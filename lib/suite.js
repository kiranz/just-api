'use strict';

import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import { loadYAML } from './schema/yaml/loader';
import { validateJSONSchema } from './schema/validator';
import { assertFileValidity,
     loadModule,
     runModuleFunction,
     runInlineFunction } from './utils';
import Spec from './spec';
import SuiteDependency from './suite-dependency';
import { customError } from './errors';
const url = require('url');

let InvalidYAMLSuiteSchemaError = customError('InvalidYAMLSuiteSchemaError');
let DisabledSuiteError = customError('DisabledSuiteError');
let InvalidSuiteConfigurationError = customError('InvalidSuiteConfigurationError');
let NoSpecsFoundError = customError('NoSpecsFoundError');
let NoSpecFoundMatchingNameError = customError('NoSpecFoundMatchingNameError');
let InvalidSpecificationSchemaError = customError('InvalidSpecificationSchemaError');

export default class Suite extends EventEmitter {

    constructor(filePath, options) {
        super();

        this.file = filePath;
        this.userContext = {};
        this.targetConfiguration = {};
        this.commonHeaders = {};
        this.grep = options.grep;
        this.specDependencies = [];
        this.result = {};
        this.result.specs = [];
        this.result.status = null;
        this.requests = [];
        this.status = null;
    }

    async launch() {
        try {
            this.loadFileAndValidateSchema();
        } catch (err) {
            if (err.name === 'DisabledSuiteError') {
                this.status = 'skip';
                this.emit('end', this);
            } else {
                this.status = 'fail';
                this.emit('end', this, err);
            }

            return;
        }

        try {
            await this.loadSpecDependencies();
        } catch (err) {
            let LoadingSpecDependencySuiteError = customError('LoadingSpecDependencySuiteError');
            let error = new LoadingSpecDependencySuiteError(`${err.name} error occurred while loading dependencies \n ${err.message}`);
            this.status = 'fail';
            this.emit('end', this, error);
            return;
        }

        try {
            await this.configure();
        } catch (err) {
            if (err.name === 'InvalidSuiteConfigurationError' || err.name === 'InvalidYAMLSuiteSchemaError') {
                this.status = 'fail';
                this.emit('end', this, err);
            } else {
                let SuiteConfigurationFailedError = customError('SuiteConfigurationFailedError');
                let error = new SuiteConfigurationFailedError(`error occurred while configuring the suite '${this.file}' \n ${err.message}`);
                this.status = 'fail';
                this.emit('end', this, error);
            }

            return;
        }

        try {
            await this.run();
        } catch (error) {
            return;
        }
    }

    loadFileAndValidateSchema() {
        const data = this.loadFile(this.file);

        if (!data.meta) {
            throw new InvalidYAMLSuiteSchemaError(`Metadata is not specified in suite '${this.file}'`);
        } else {
            const suiteFlag = ((typeof data.meta.enabled === 'undefined') || (data.meta.enabled === true));
            if (!suiteFlag) {
                throw new DisabledSuiteError(`Suite '${this.file}' is disabled, skipping the suite`);
            }

            if (data.meta.locate_files_relative === true) {
              this.areFilesRelativeToSuite = true;
            }
        }

        const suiteSchemaDefinition = path.resolve(__dirname, './schema/yaml/suite.json');
        const schemaValidation = validateJSONSchema(data, suiteSchemaDefinition);

        if (schemaValidation.errors.length >= 1) {
            let errorMessages = '';

            for (let error of schemaValidation.errors) {
                errorMessages += `  property - ${error.property}, message: ${error.message} \n`;
            }
            const InvalidSuiteSchemaError = customError('InvalidSuiteSchemaError');
            throw new InvalidSuiteSchemaError(`invalid schema found in file ${this.file} \n ${errorMessages}`);
        }

        this.data = data;
        this.hooks = this.data.hooks || {};
        this.specs = this.data.specs;
        this.name = this.data.meta.name;
    }

    loadFile(file) {
        if (!fs.existsSync(file)) {
            let FileDoesNotExistError = customError('FileDoesNotExist');
            throw new FileDoesNotExistError(`Test suite file doesn't exist at '${file}'`);
        }

        try {
            return loadYAML(file, { encoding: 'UTF-8', customTypes: ['asyncFunction'] });
        } catch (err) {
            let YAMLSuiteLoadingError = customError('YAMLSuiteLoadingError');
            throw new YAMLSuiteLoadingError(`(${file}) \n ${err.message}`);
        }
    }

    resolveFile(filePath) {
        if (this.areFilesRelativeToSuite) {
            let suiteDirectory = path.dirname(this.file);
            return path.resolve(suiteDirectory, filePath);
        } else {
            return path.resolve(process.cwd(), filePath);
        }
    }

    async loadSpecDependencies() {
        if (this.data.spec_dependencies) {
            for (let dependency of this.data.spec_dependencies) {
                let file = this.resolveFile(dependency);

                try {
                    let fileExistsAndFile = fs.lstatSync(file).isFile();

                    if (fileExistsAndFile) {
                        let dependencySuite = new SuiteDependency(file, this);
                        dependencySuite.loadFileAndValidateSchema();
                        await dependencySuite.configure();
                        this.specDependencies.push(dependencySuite);
                    } else {
                        throw new Error(`dependency suite at '${file}' is not a file, Provide a valid file path`);
                    }
                } catch (e) {
                    if (e.code == 'ENOENT') {
                        throw new Error(`dependency suite file at '${file}' does not exist, Provide a valid path`);
                    } else {
                        throw e;
                    }
                }
            }
        }
    }

    async configure() {
        const suiteConfigData = this.data.configuration;
        let SuiteCustomConfigurationError = customError('SuiteCustomConfigurationError');

        if (suiteConfigData.custom_configuration) {

            let staticSuiteConfiguration = {
                host: suiteConfigData.host,
                port: suiteConfigData.port,
                scheme: suiteConfigData.scheme,
                base_path: suiteConfigData.base_path,
                read_timeout: suiteConfigData.read_timeout,
                common_headers: suiteConfigData.common_headers,
            };

            const configContext = {};

            try {
                if (suiteConfigData.custom_configuration.run_type === 'inline') {
                    let inlineFunction = suiteConfigData.custom_configuration.inline.function;
                    await runInlineFunction(inlineFunction, configContext);
                } else if (suiteConfigData.custom_configuration.run_type === 'module') {
                    let modulePath = this.resolveFile(suiteConfigData.custom_configuration.module.module_path);
                    const module = assertFileValidity(modulePath, 'Custom Configuration module');
                    const customModule = loadModule(module);
                    await runModuleFunction(customModule, suiteConfigData.custom_configuration.module.function_name, configContext);
                } else {
                    throw new InvalidYAMLSuiteSchemaError(`suite custom_configuration.run_type should be either inline or module`);
                }
            } catch (err) {
                if (err.name === 'InvalidYAMLSuiteSchemaError') {
                    throw err;
                } else {
                    throw new SuiteCustomConfigurationError(`${err.name || 'Error' } occurred while running the custom configuration function \n ${err.message || err}`);
                }
            }

            let configuration = Object.assign({}, staticSuiteConfiguration, configContext);
            this.scheme = configuration.scheme;
            this.host = configuration.host;
            this.port = configuration.port;
            this.base_path = configuration.base_path || '';
            this.read_timeout = configuration.read_timeout || 60000;
            suiteConfigData.common_headers = configuration.common_headers || [];
        } else {
            this.scheme = suiteConfigData.scheme;
            this.host = suiteConfigData.host;
            this.port = suiteConfigData.port;
            this.base_path = suiteConfigData.base_path || '';
            this.read_timeout = suiteConfigData.read_timeout || 60000;
        }

        const data = {
            scheme: this.scheme,
            host: this.host,
            port: this.port,
            base_path: this.base_path,
            read_timeout: this.read_timeout
        };

        const suiteConfigSchemaDefinition = path.resolve(__dirname, './schema/yaml/suite-config.json');
        const schemaValidation = validateJSONSchema(data, suiteConfigSchemaDefinition);

        if (schemaValidation.errors.length >= 1) {
            let errorMessages = '';

            for (let error of schemaValidation.errors) {
                errorMessages += `  property - ${error.property}, message: ${error.message} \n`;
            }

            throw new InvalidSuiteConfigurationError(`Invalid Suite configuration : ${this.file} \n ${errorMessages}`);
        }

        this.targetConfiguration = {
            host: this.host,
            port: this.port,
            scheme: this.scheme,
            base_path: this.base_path,
            read_timeout: this.read_timeout
        };

        this.rootURL = url.format({
            protocol: this.scheme,
            hostname: this.host,
            port: this.port,
            pathname: this.base_path
        });

        if (suiteConfigData.common_headers && suiteConfigData.common_headers.constructor.name === 'Array') {
            let defaultHeaders = {};
            const specHeaders = suiteConfigData.common_headers;
            for (let item of specHeaders) {
                defaultHeaders[item['name']] = item['value'];
            }

            this.commonHeaders = defaultHeaders;
        }
    }

    isSpecSkippable(specification) {
        if (!((typeof specification.enabled === 'undefined') || (specification.enabled === true)))
            return true;

        if (this.grep) {
            return (!this.grep.test(specification.name))
        }

        return false;
    }

    addSpecResultToSuite(spec) {
        this.result.specs.push(spec.result);
    }

    async run() {
        const self = this;

        try {
            this.ensureSpecsExist();
            await this.runBeforeAllHook();
            let specs = this.specs;

            for (const specData of specs) {
                this.requests = [];
                const specification = specData;
                let spec;

                /**
                 * Check if spec is skippable
                 */
                try {
                    if (this.isSpecSkippable(specification)) {
                        spec = new Spec(specification, this);
                        spec.result.status = 'skip';
                        spec.setDuration();
                        this.addSpecResultToSuite(spec);
                        this.emit('test skip', spec);
                        continue;
                    }

                } catch (error) {
                    spec = new Spec(specification, this);
                    spec.result.status = 'fail';
                    spec.setDuration();
                    this.addSpecResultToSuite(spec);
                    this.emit('test fail', spec, error);
                    continue;
                }

                /**
                 * Handle specs with loop definitions
                 */

                if (specification.loop) {
                    let loopItems;

                    try {
                        loopItems = await this.fetchLoopItems(specification.loop);
                    } catch (error) {
                        spec = new Spec(specification, this);
                        spec.result.status = 'fail';
                        spec.setDuration();
                        this.addSpecResultToSuite(spec);
                        this.emit('test fail', spec, error);
                        continue;
                    }

                    for (let loopItemIdx in loopItems) {
                        this.requests = [];
                        let loopSpec;

                        try {
                            let iterationSpecification = Object.assign({}, specification);
                            iterationSpecification.loopSpec = true;
                            iterationSpecification.loopData = {index: loopItemIdx, value: loopItems[loopItemIdx]};
                            loopSpec = new Spec(iterationSpecification, this);
                            this.emit('test start', loopSpec);
                            await loopSpec.init();
                            loopSpec.result.status = 'pass';
                            loopSpec.requests = this.requests.slice(0);
                            this.addSpecResultToSuite(loopSpec);
                            this.emit('test pass', loopSpec);
                        } catch (error) {
                            loopSpec.result.status = 'fail';
                            loopSpec.requests = this.requests.slice(0);
                            loopSpec.setDuration();
                            this.addSpecResultToSuite(loopSpec);
                            this.emit('test fail', loopSpec, error);
                        }
                    }
                    continue;
                }

                /**
                 * When a spec is not loop-able, run it normally
                 */

                try {
                    spec = new Spec(specification, this);
                    this.emit('test start', spec);
                    await spec.init();
                    spec.result.status = 'pass';
                    spec.requests = this.requests.slice(0);
                    this.addSpecResultToSuite(spec);
                    this.emit('test pass', spec);
                } catch (error) {
                    spec.result.status = 'fail';
                    spec.setDuration();
                    spec.requests = this.requests.slice(0);
                    this.addSpecResultToSuite(spec);
                    this.emit('test fail', spec, error);
                }
            }

            this.requests = [];
            await this.runAfterAllHook();
            this.updateSuiteStatus();
            this.emit('end', this);
        } catch (error) {
            this.status = 'fail';
            this.emit('end', this, error);
        }
    }

    updateSuiteStatus() {
        let failedSpecCount = 0;

        for (let spec of this.result.specs) {
            if (spec.status === 'fail') {
                failedSpecCount += 1;
            }
        }

        this.status = (failedSpecCount > 0) ? 'fail' : 'pass';
    }

    async fetchLoopItems(loopData) {
        let loopItems;
        let LoopItemsBuilderError = customError('LoopItemsBuilderError');

        try {
            if (loopData.type === 'static') {
                loopItems = loopData.static;
            } else if (loopData.type === 'dynamic') {
                if (loopData.dynamic.run_type === 'inline') {
                    let inlineFunction = loopData.dynamic.inline.function;
                    let inlineResult = await runInlineFunction(inlineFunction);
                    loopItems = inlineResult;
                } else if (loopData.dynamic.run_type === 'module') {
                    let modulePath = this.resolveFile(loopData.dynamic.module.module_path);
                    const module = assertFileValidity(modulePath, 'Loop data module');
                    const customModule = loadModule(module);

                    let moduleResult = await runModuleFunction(customModule, loopData.dynamic.module.function_name);
                    loopItems = moduleResult;
                } else {
                    throw new InvalidYAMLSuiteSchemaError(`Loop dynamic run_type should be either inline or module`);
                }
            } else {
                throw new InvalidYAMLSuiteSchemaError('Loop data should be either static or dynamic');
            }

            if ((loopItems.constructor.name !== 'Array')) {
                throw new InvalidSpecificationSchemaError('Loop dynamic function did not return an Array');
            }
        } catch (err) {
            if (err.name === 'LoopItemsBuilderError') {
                throw err;
            } else {
                throw new LoopItemsBuilderError(`${err.name || 'Error' } occurred while building loop items \n ${err.message || err}`);
            }
        }

        return loopItems;
    }

    /*
    options can include host, port, scheme, path_params, query_params, headers,
    read_timeout, in case of body requirements ( body, form_data, form)
    validateResponse option will enable/disable response validation
    */
    async runDependencySpec(name, options = {}) {
        let specData;
        let dependencyFromSuite;
        specData = this._sctx.specs.find(spec => spec.name === name);

        if (!specData) {
            if (this._sctx.specDependencies.length) {
                for (let dependencySuite of this._sctx.specDependencies) {
                    specData = dependencySuite.specs.find(spec => spec.name === name);
                    if (specData) {
                        dependencyFromSuite = dependencySuite;
                        break;
                    }
                }

                if (!specData) {
                    throw new NoSpecFoundMatchingNameError(`No matching spec found with name '${name}'`);
                }
            }
            else {
                throw new NoSpecFoundMatchingNameError(`No matching spec found with name '${name}'`);
            }
        }

        let opts;

        if (dependencyFromSuite) {
            opts = Object.assign({outerDependency: true, outerDependencySuite: dependencyFromSuite}, options);
        } else {
            opts = Object.assign({}, options);
        }

        let spec = new Spec(specData, this._sctx, 'dependency', opts);

        try {
            return await spec.init();
        } catch (error) {
            throw error;
        }
    }

    async runHook(type, hookData) {
        const data = hookData;
        const self = this;
        const runSpecFunc = self.runDependencySpec;
        let _context = {suite: this.userContext, runSpec: runSpecFunc, _sctx: self};

        if (data.run_type === 'inline') {
            if (data.inline) {
                let inlineFunction = data.inline.function;
                await runInlineFunction(inlineFunction, _context);
            } else {
                throw new InvalidYAMLSuiteSchemaError(`Suite ${type} hook inline function definition is not specified`);
            }
        } else if (data.run_type === 'module') {
            if (data.module) {
                let modulePath = this.resolveFile(data.module.module_path);
                const module = assertFileValidity(modulePath, 'Suite ${type} hook module');
                const customModule = loadModule(module);
                await runModuleFunction(customModule, data.module.function_name, _context);
            } else {
                throw new InvalidYAMLSuiteSchemaError(`Suite ${type} hook module function definition is not specified`);
            }
        } else {
            throw new InvalidYAMLSuiteSchemaError(`Suite ${type} hook run type should be inline or module`);
        }
    }

    ensureSpecsExist() {
        if (this.specs.length < 1) {
            throw new NoSpecsFoundError(`No specs found in file '${this.file}'`);
        }
    }

    async runBeforeAllHook() {
        if (this.hooks.before_all) {
            try {
                await this.runHook('before all', this.hooks.before_all);
            } catch (err) {
                let BeforeAllHookError = customError('BeforeAllHookError');
                throw new BeforeAllHookError(`${err.name || 'Error'} occurred while running the before all hook \n    ${err.message || err}`);
            }

        }
    }

    async runAfterAllHook() {
        if (this.hooks.after_all) {
            try {
                await this.runHook('after all', this.hooks.after_all);
            } catch (err) {
                let AfterAllHookError = customError('AfterAllHookError');
                throw new AfterAllHookError(`${err.name || 'Error'} occurred while running the after all hook \n     ${err.message || err}`);
            }
        }
    }


}
