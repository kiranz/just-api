'use strict';

import JustAPIRequest from './request';
import fs from 'fs';
import path from 'path';
import { assertFileValidity, loadModule, runModuleFunction, runInlineFunction, wait, isNumber, equals as isEqual } from './utils';
import { customError, errorTypes } from './errors';
const url = require('url');
const format = require('string-template');
const validateObject = require('jsonschema').validate;
const jsonPath = require('jsonpath');
const Cookie = require('request-cookies').Cookie;

export default class Spec {
    constructor(data, suite, type = 'test', dependencyOptions = {}) {
        this.suite = suite;
        this.data = data;
        this.assignName();
        this.userContext = {};
        this.setInitialContext();
        this.type = type;
        this.dependencyOpts = dependencyOptions;
        this.requests = [];

        this.result = {
            suiteName: this.suite.name,
            name: this.data.name,
            status: null,
            file: this.suite.file,
            duration: 0,
            startTime: new Date(),
            endTime: null,
            steps: [],
            context: '',
            error: null
        };
    }

    setInitialContext() {
        this.userContext.name = this.name;
    }

    assignName() {
        if (this.isLoopSpec()) {
            this.name = `${this.data.name} - loop iteration ${parseInt(this.data.loopData.index) + 1}`;
        } else {
            this.name = this.data.name;
        }
    }

    getLoopItem() {
        return this.data.loopData;
    }

    isLoopSpec() {
        return this.data.loopSpec;
    }

    async init() {
        return await this.run();
    }

    setEndTime() {
        this.result.endTime = new Date();
    }

    setDuration() {
        if (!this.result.endTime) {
            this.setEndTime();
        }

        this.result.duration = this.result.endTime.getTime() - this.result.startTime.getTime();
        this.duration = this.result.duration;
    }

    async run() {
        if (this.type === 'test') {
            return await this.runAsTest();
        } else {
            return this.runAsDependency();
        }
    }

    async runAsTest() {
        var startTime = new Date();

        if (this.suite.hooks.before_each) {
            await this.runHook('before each', this.suite.hooks.before_each);
        }

        if (this.data.before_test) {
            await this.runHook('before test', this.data.before_test);
        }

        let testContext = Object.assign({}, this.userContext);
        delete testContext.method;

        let reqOptions = await this.buildRequestDetails(testContext);
        let response = await this.processRequest(reqOptions);

        try {
            await this.validateResponse(response);
        } catch (err) {
            if (this.data.retry) {
                let retriesResult = await this.processRetries(reqOptions);
                response = retriesResult.response;

                if (retriesResult.error === null) {
                    this.result.status = 'pass';
                } else {
                    this.result.status = 'fail';
                    this.result.error = retriesResult.error;
                    let error = retriesResult.error;
                    error.message = `${error.message} \n request: ${response._req.method.toUpperCase()} ${response._req.href}`;
                    throw error;
                }
            } else {
                this.result.status = 'fail';
                this.result.error = err;
                err.message = `${err.message} \n request: ${response._req.method.toUpperCase()} ${response._req.href}`;
                throw err;
            }
        }

        if (this.data.after_test) {
            await this.runHook('after test', this.data.after_test, {response: response});
        }

        if (this.suite.hooks.after_each) {
            await this.runHook('after each', this.suite.hooks.after_each, {response: response});
        }

        this.setEndTime();
        this.setDuration();
        this.result.error = null;
        this.result.status = 'pass';

        return this.result;
    }

    async processRetries(reqOptions) {
        const retryInfo = this.data.retry;
        let attempts = isNumber(retryInfo.count) ? parseInt(retryInfo.count) : 1;
        let waitTimeBeforeEachAttempt = isNumber(retryInfo.wait_before_each) ? parseInt(retryInfo.wait_before_each) : 100;
        let currentAttempts = 0;

        while (currentAttempts <= attempts) {
            await wait(waitTimeBeforeEachAttempt);
            currentAttempts += 1;
            let response;

            try {
                response = await this.processRequest(reqOptions);
                await this.validateResponse(response);
                return { error: null, response: response };
            } catch (err) {
                if (currentAttempts >= attempts) {
                    return {error: err, response: response};
                }
            }
        }
    }

    async runAsDependency() {
        const dependencyOptions = this.dependencyOpts;
        delete dependencyOptions.method;

        let reqOptions = await this.buildRequestDetails(dependencyOptions);
        const response = await this.processRequest(reqOptions);

        if (dependencyOptions.validateResponse) {
            await this.validateResponse(response);
            return response._response;
        } else {
            return response._response;
        }
    }

    async buildRequestDetails(opts) {
        let _reqOptions = {};

        try {
            _reqOptions.baseUrl = this.buildBaseURL(opts);

            let subPath = this.buildPath(opts);

            if (subPath) {
                _reqOptions.url = subPath;
            } else {
                _reqOptions.url = _reqOptions.baseUrl;
                delete _reqOptions.baseUrl;
            }

            _reqOptions.qs = this.buildQueryParams(opts);
            _reqOptions.headers = this.buildHeaders(opts);
            _reqOptions.cookiesData = this.buildCookies(opts);
            _reqOptions.timeout = this.getTimeout(opts);
            _reqOptions.method = this.data.request.method.toLowerCase();
        } catch (err) {
            let RequestBuilderError = customError('RequestBuilderError');
            throw new RequestBuilderError(` ${err.name} ${err.message}`);
        }

        if (['patch', 'post', 'put'].includes(_reqOptions.method)) {
            try {
                let bodyOptions = this.buildRequestBody(opts, _reqOptions.headers, _reqOptions.method);
                _reqOptions = Object.assign(_reqOptions, bodyOptions);
            } catch (err) {
                if (errorTypes.includes(err.name)) {
                    throw err;
                } else {
                    let RequestBodyBuilderError = customError('RequestBodyBuilderError');
                    throw new RequestBodyBuilderError(` ${err.name} ${err.message}`);
                }
            }
        }

        this.addAdditionalRequestOptions(_reqOptions);

        return _reqOptions;
    }

    async processRequest(opts) {
        let _req = new JustAPIRequest(opts, this);
        return _req.send();
    }

    getTimeout(opts) {
        return opts.read_timeout || this.data.request.read_timeout || this.suite.targetConfiguration.read_timeout;
    }

    async runHook(type, hookData, opts) {
        try {
            const data = hookData;
            const self = this;

            let _context = {
                suite: this.suite.userContext,
                runSpec: this.suite.runDependencySpec,
                test: this.userContext,
                _sctx: self.suite
            };

            if (this.isLoopSpec())
                _context.loopItem = this.getLoopItem().value;

            if (type === 'after test' || type === 'after each') {
                _context.response = opts.response._response;
            }

            if (typeof data !== 'object') {
                throw Error(`Invalid ${type} hook schema`);
            }

            let InvalidYAMLSuiteSchemaError = customError('InvalidYAMLSuiteSchemaError');

            if (data.run_type === 'inline') {
                if (data.inline) {
                    let inlineFunction = data.inline.function;
                    await runInlineFunction(inlineFunction, _context);
                } else {
                    throw new InvalidYAMLSuiteSchemaError(`Test ${type} hook inline function definition is not specified`);
                }
            } else if (data.run_type === 'module') {
                if (data.module) {
                    let modulePath = this.suite.resolveFile(data.module.module_path);
                    const module = assertFileValidity(modulePath, 'Test ${type} hook module');
                    const customModule = loadModule(module);
                    await runModuleFunction(customModule, data.module.function_name, _context);
                } else {
                    throw new InvalidYAMLSuiteSchemaError(`Test ${type} hook module function definition is not specified`);
                }
            } else {
                throw new InvalidYAMLSuiteSchemaError(`Test ${type} hook run type should be inline or module`);
            }
        } catch (err) {
            let errorType;

            if (type === 'before each') {
                errorType = customError('BeforeEachHookError');
            } else if (type === 'after each') {
                errorType = customError('AfterEachHookError');
            } else if (type === 'before test') {
                errorType = customError('BeforeTestHookError');
            } else if (type === 'after test') {
                errorType = customError('AfterTestHookError');
            } else {
                throw new Error(`Unknown hook ${type}`);
            }

            throw new errorType(`${err.name || 'Error'} - ${err.message || err}`);
        }
    }

    async validateResponse(response) {
        const code = this.data.response.status_code;
        if (code) {
            this._validateStatus(response, code);
        }

        const expectedHeaders = this.data.response.headers;
        if (expectedHeaders) {
            this._validateHeaders(response, expectedHeaders);
        }

        const cookies = this.data.response.cookies;
        if (cookies) {
            this._validateCookies(response, cookies);
        }

        const jsonSchemaInfo = this.data.response.json_schema;
        if (jsonSchemaInfo) {
            this._validateJSONSchema(response, jsonSchemaInfo)
        }

        const jsonData = this.data.response.json_data;

        if (jsonData) {
            this._validateJSONData(response, jsonData);
        }

        if (this.data.response.custom_validator) {
            await this.runCustomResponseValidator(response);
        }

        return true;
    }

    async runCustomResponseValidator(response) {
        const data = this.data.response.custom_validator;
        const dependencySuite = this.dependencyOpts.outerDependency ?  this.dependencyOpts.outerDependencySuite : this.suite;

        let _context = { response: response._response };

        if (this.isLoopSpec())
            _context.loopItem = this.getLoopItem().value;

        let InvalidYAMLSuiteSchemaError = customError('InvalidYAMLSuiteSchemaError');
        let CustomResponseValidationError = customError('CustomResponseValidationError');

        try {
            if (data.run_type === 'inline') {
                if (data.inline) {
                    let inlineFunction = data.inline.function;
                    await runInlineFunction(inlineFunction, _context);
                } else {
                    throw new InvalidYAMLSuiteSchemaError(`Custom validator inline function definition is not specified`);
                }
            } else if (data.run_type === 'module') {
                if (data.module) {
                    let modulePath = dependencySuite.resolveFile(data.module.module_path);
                    const module = assertFileValidity(modulePath, 'custom validation module');
                    const customModule = loadModule(module);
                    await runModuleFunction(customModule, data.module.function_name, _context);
                } else {
                    throw new InvalidYAMLSuiteSchemaError(`Custom validator module function definition is not specified`);
                }
            } else {
                throw new InvalidYAMLSuiteSchemaError(`Custom validator run type should be inline or module`);
            }
        } catch (err) {
            if (err.name === 'CustomResponseValidationError') {
                throw err;
            } else {
                throw new CustomResponseValidationError(`${err.name || 'Error' } occurred in custom response validation \n ${err.message || err}`);
            }
        }
    }

    buildBaseURL(additionalOptions) {
        let options;

        if (additionalOptions.outerDependency) {
            options = Object.assign({}, additionalOptions.outerDependencySuite.targetConfiguration, this.data.request, additionalOptions);
        } else {
            options = Object.assign({}, this.suite.targetConfiguration, this.data.request, additionalOptions);
        }

        return url.format({
            protocol: options.scheme,
            hostname: options.host,
            port: options.port,
            pathname: options.base_path
        });
    }

    buildPath(additionalOptions) {
        let path = additionalOptions.path || this.data.request.path || '';

        if (path.length === 0) return '';

        let defaultPathParams = {};

        const specParams = this.data.request.path_params;

        if (specParams) {
            for (let item of specParams) {
                defaultPathParams[item['name']] = item['value'];
            }
        }

        let customPathParams = additionalOptions.path_params || {};
        const params = Object.assign({}, defaultPathParams, customPathParams);

        return format(path, params)
    }

    buildQueryParams(additionalOptions) {
        let defaultParams = {};

        const specParams = this.data.request.query_params;

        if (specParams) {
            for (let item of specParams) {
                defaultParams[item['name']] = item['value'];
            }
        }

        let customParams = additionalOptions.query_params || {};

        return Object.assign({}, defaultParams, customParams);
    }

    buildHeaders(additionalOptions) {
        let defaultHeaders = {};

        const specHeaders = this.data.request.headers;

        if (specHeaders) {
            for (let item of specHeaders) {
                defaultHeaders[item['name']] = item['value'];
            }
        }

        let customHeaders = additionalOptions.headers || {};
        let commonSuiteHeaders = this.data.ignore_suite_headers ? {} : ((additionalOptions.outerDependency) ? additionalOptions.outerDependencySuite.commonHeaders : this.suite.commonHeaders);

        return Object.assign({}, commonSuiteHeaders, defaultHeaders, customHeaders);
    }

    buildCookies(additionalOptions) {
        let defaultCookies = {};

        const specCookies = this.data.request.cookies;

        if (specCookies) {
            for (let item of specCookies) {
                defaultCookies[item['name']] = item['value'];
            }
        }

        let customCookies = additionalOptions.cookies || {};

        return Object.assign({}, defaultCookies, customCookies);
    }

    addAdditionalRequestOptions(reqOptions) {
        const supportedOptions = ['followRedirect', 'followAllRedirects', 'followOriginalHttpMethod', 'encoding', 'gzip'];
        const options = this.data.request.additional_options;

        if (options) {
            for (let [ key, value ] of Object.entries(options)) {
                if (supportedOptions.includes(key)) {
                    reqOptions[key] = value;
                }
            }
        }
    }

    buildRequestBody(additionalOptions, headers, method) {
        let bodyData = {};
        let requestContentType = headers['content-type'] || this.suite.commonHeaders['content-type'];
        let RequestBodyNotFoundError = customError('RequestBodyNotFoundError');
        let InvalidRequestSpecificationError = customError('InvalidRequestSpecificationError');
        let InvalidRequestHeaderError = customError('InvalidRequestHeaderError');
        let RequestBodyBuilderError = customError('RequestBodyBuilderError');

        const payload = additionalOptions.payload || this.data.request.payload;
        const dependencySuite = additionalOptions.outerDependency ?  additionalOptions.outerDependencySuite : this.suite;

        if (requestContentType && requestContentType.length > 1) {
            let expectedBodyFields = ['body', 'form', 'form_data'];

            if (!payload) {
                throw new RequestBodyNotFoundError(`request content-type is ${requestContentType}, but request body is not found`);
            }

            if (typeof payload !== 'object') {
                throw new RequestBodyNotFoundError(`request content-type is ${requestContentType}, invalid specification for request body. \n  Provide request body as one of ${expectedBodyFields} in payload `);
            }

            let reqKeys = Object.keys(payload);
            let providedFields = reqKeys.filter(key => expectedBodyFields.includes(key));
            if (providedFields.length < 1) {
                throw new RequestBodyNotFoundError(`Request method is ${method}, but request specification does not have any expected body fields. \n  Provide request body as one of ${expectedBodyFields}`);
            }

            if (providedFields.length > 1) {
                throw new InvalidRequestSpecificationError(`request method is ${method}, and request specification contains more than one of expected body fields. Provide one of ${expectedBodyFields}`);
            }

            let providedBodyField = providedFields[0];

            if (providedBodyField === 'body') {
                let givenBody = payload.body;

                if (givenBody.type === 'binary') {

                    let file = dependencySuite.resolveFile(payload.body.content);

                    try {
                        let fileExistsAndFile = fs.lstatSync(file).isFile();

                        if (fileExistsAndFile) {
                            bodyData.body = fs.createReadStream(file);
                        } else {
                            throw new RequestBodyBuilderError(`${file} is not a file, Provide a valid file path to be sent as body content`);
                        }
                    } catch (e) {
                        if (e.code == 'ENOENT') {
                            throw new RequestBodyBuilderError(`ENOENT file at '${file}' does not exist, Provide a valid file path to be sent as body content`);
                        } else {
                            throw e;
                        }
                    }
                } else if (givenBody.type === 'text') {
                    if (typeof givenBody.content === 'string' || typeof givenBody.content === 'number') {
                        bodyData.body = givenBody.content.toString();
                    } else {
                        throw new InvalidRequestSpecificationError(`Payload type is given as text, but content provided is not a string or number`);
                    }

                } else if (givenBody.type === 'json') {
                    if (typeof givenBody.content === 'string' || typeof givenBody.content === 'number') {
                        bodyData.body = givenBody.content;
                    } else if (typeof givenBody.content === 'object') {
                        if (requestContentType === 'application/json') {
                            bodyData.body = JSON.stringify(givenBody.content);
                        } else {
                            throw new InvalidRequestSpecificationError(`Request body is an object but content-type header value is not application/json`);
                        }
                    } else {
                        try {
                            bodyData.body = JSON.stringify(givenBody.content);
                        } catch (error) {
                            throw new RequestBodyBuilderError(`${error.name} Unable to dump the body content as json \n ${error.message}`);
                        }
                    }

                } else {
                    throw new InvalidRequestSpecificationError(`body type should be one of binary, json or text`);
                }
            }

            if (providedBodyField === 'form') {
                if (requestContentType !== 'application/x-www-form-urlencoded') {
                    throw new InvalidRequestHeaderError(`Request body is provided as form but request Content-Type is ${requestContentType}. It should be application/x-www-form-urlencoded`);
                }

                bodyData.form = payload.form;
            }

            if (providedBodyField === 'form_data') {
                let formData = {};
                let giveFormData = payload.form_data;

                if (requestContentType !== 'multipart/form-data') {
                    throw new InvalidRequestHeaderError(`Request body is provided as formData but request Content-Type is ${requestContentType}. It should be multipart/form-data`);
                }

                for (let formParam of giveFormData) {
                    if (formParam.type === 'file') {
                        let file = dependencySuite.resolveFile(formParam.content);

                        try {
                            let fileExistsAndFile = fs.lstatSync(file).isFile();

                            if (fileExistsAndFile) {
                                let paramData = {};
                                paramData.value = fs.createReadStream(file);
                                paramData.options = formParam.options;
                                formData[formParam.name] = paramData;
                            } else {
                                throw new RequestBodyBuilderError(` '${file}' is not a file, Provide a valid path for content of form body`);
                            }
                        } catch (e) {
                            if (e.code == 'ENOENT') {
                                throw new RequestBodyBuilderError(`ENOENT file at '${file}' does not exist, Provide a valid path for content of form body`);
                            } else {
                                throw e;
                            }
                        }
                    } else if (formParam.type === 'text') {
                        let paramData = {};

                        if (typeof formParam.content === 'string' || typeof formParam.content === 'number') {
                            paramData.value = formParam.content.toString();
                            paramData.options = formParam.options;
                            formData[formParam.name] = paramData;
                        } else {
                            throw new InvalidRequestSpecificationError(`Multipart form field type is given as text, but content provided is not a string or number`);
                        }
                    } else if (formParam.type === 'json') {
                        let paramData = {};

                        if (typeof formParam.content === 'string' || typeof formParam.content === 'number') {
                            paramData.value = formParam.content;
                            paramData.options = formParam.options;
                            formData[formParam.name] = paramData;
                        } else if (typeof formParam.content === 'object') {
                            paramData.value = JSON.stringify(formParam.content);
                            paramData.options = formParam.options;
                            formData[formParam.name] = paramData;
                        } else {
                            try {
                                paramData.value = JSON.stringify(formParam.content);
                            } catch (error) {
                                throw new RequestBodyBuilderError(`${error.name} Unable to dump the body content as json \n ${error.message}`);
                            }

                            paramData.options = formParam.options;
                            formData[formParam.name] = paramData;
                        }
                    } else {
                        throw new InvalidRequestSpecificationError(`body type should be one of binary, json or text`);
                    }
                }

                bodyData.formData = formData;
            }
        } else if (payload && !requestContentType) {
            throw new InvalidRequestHeaderError(`Request method is ${method},request body is provided but Content-Type header is not provided`);
        }
        else {
            return bodyData;
        }

        return bodyData;
    }

    _validateStatus(response, code) {
        if (code !== response._response.statusCode) {
            let ResponseStatusCodeDidNotMatchError = customError('ResponseStatusCodeDidNotMatchError');
            throw new ResponseStatusCodeDidNotMatchError(`Expected status code: ${code}, Actual status code: ${response._response.statusCode}`);
        }

        return true;
    }

    _validateHeaders(response, expectedHeaders) {
        let headers = {};
        let ResponseHeaderValueDidNotMatchError = customError('ResponseHeaderValueDidNotMatchError');

        for (let item of expectedHeaders) {
            headers[item['name'].toLowerCase()] = item['value'];
        }

        const actualHeaders = response._response.headers;

        for (let headerKey in headers) {
            let expectedHeaderValue = headers[headerKey];
            let actualHeaderValue = actualHeaders[headerKey];

            if (typeof actualHeaderValue === 'undefined') {
                throw new ResponseHeaderValueDidNotMatchError(`Expected value for header: ${headerKey} is ${expectedHeaderValue}, Actual value: [couldn't find it in response headers]`);
            }

            if (expectedHeaderValue.constructor.name === 'RegExp') {
                const result = expectedHeaderValue.test(actualHeaderValue.toString());

                if (!result) {
                    throw new ResponseHeaderValueDidNotMatchError(`Header value did not match with expected Regex. Expected value for header: ${headerKey} is to match RegExp ${expectedHeaderValue}, Actual value: ${actualHeaderValue}`);
                }
            } else {
                if (expectedHeaderValue.toString() !== actualHeaderValue.toString()) {
                    throw new ResponseHeaderValueDidNotMatchError(`Expected value for header: ${headerKey} is ${expectedHeaderValue}, Actual value: ${actualHeaderValue}`);
                }
            }
        }

        return true;
    }

    _validateCookies(response, expectedCookies) {
        let cookies = {};
        let ResponseCookieValueDidNotMatchError = customError('ResponseCookieValueDidNotMatchError');

        for (let item of expectedCookies) {
            cookies[item['name']] = { value: item['value'] };
        }

        let rawCookies = response._response.headers['set-cookie'];
        let actualCookies = {}

        for (let idx in rawCookies) {
            let cookie = new Cookie(rawCookies[idx]);

            actualCookies[cookie.key] = {
                value: cookie.value,
                expires: cookie.expires
            }
        }

        for (let item in cookies) {
            let expectedCookieDetails = cookies[item];
            let actualCookieDetails = actualCookies[item];

            if (typeof actualCookieDetails === 'undefined') {
                throw new ResponseCookieValueDidNotMatchError(`Expected value for Cookie: ${item} is ${expectedCookieDetails.value}, Actual value: [couldn't find it in response cookies]`);
            }

            if (expectedCookieDetails.value.constructor.name === 'RegExp') {
                const result = expectedCookieDetails.value.test(actualCookieDetails.value.toString());

                if (!result) {
                    throw new ResponseCookieValueDidNotMatchError(`Cookie value did not match with expected Regex. Expected value for cookie: ${item} is to match RegExp ${expectedCookieDetails.value}, Actual value: ${actualCookieDetails.value}`);
                }
            } else {
                if (expectedCookieDetails.value.toString() !== actualCookieDetails.value.toString()) {
                    throw new ResponseCookieValueDidNotMatchError(`Expected value for cookie: ${item} is ${expectedCookieDetails.value}, Actual value: ${actualCookieDetails.value}`);
                }
            }
        }

        return true;
    }

    _validateJSONData(response, jsonData) {
        let jsonBody;
        let JSONBodyParseError = customError('JSONBodyParseError');
        let ResponseJSONDataMismatchError = customError('ResponseJSONDataMismatchError');

        try {
            jsonBody = JSON.parse(response._response.body);
        } catch (err) {
            throw new JSONBodyParseError(`${err.name} Error occurred while parsing the body as json \n ${err.message}`);
        }

        for (let eachJsonData of jsonData) {
            const values = jsonPath.query(jsonBody, eachJsonData.path);

            if (!values) {
                throw new ResponseJSONDataMismatchError(`JSON Path evaluation did not return any matching value, json path: ${eachJsonData.path}`);
            }

            if (eachJsonData.value === null) {
                if (values[0] !== eachJsonData.value) {
                    throw new ResponseJSONDataMismatchError(`JSON path evaluated value did not match with expected value (null), json path: ${eachJsonData.path}, Actual value: ${values[0]}, Expected value: ${eachJsonData.value}`);
                }
            } else if (isNumber(eachJsonData.value) || eachJsonData.value.constructor.name === 'String') {
                if (values[0] !== eachJsonData.value) {
                    throw new ResponseJSONDataMismatchError(`JSON path evaluated value did not match with expected value, json path: ${eachJsonData.path}, Actual value: ${values[0]}, Expected value: ${eachJsonData.value}`);
                }
            } else if (eachJsonData.value.constructor.name === 'RegExp') {
                const result = eachJsonData.value.test(values[0]);

                if (!result) {
                    throw new ResponseJSONDataMismatchError(`JSON path evaluated value did not match the expected Regexp, json path: ${eachJsonData.path}, Regexp: ${eachJsonData.value}, Actual value: ${values[0]}`);
                }
            } else if (eachJsonData.value.constructor.name === 'Array') {
                if (!isEqual(values[0], eachJsonData.value)) {
                    throw new ResponseJSONDataMismatchError(`JSON path evaluated value did not match with expected value, json path: ${eachJsonData.path}, Actual value: ${JSON.stringify(values[0])}, Expected value: ${JSON.stringify(eachJsonData.value)}`);
                }
            } else if (eachJsonData.value.constructor.name === 'Object') {
                if (!isEqual(values[0], eachJsonData.value)) {
                    throw new ResponseJSONDataMismatchError(`JSON path evaluated value did not match with expected value, json path: ${eachJsonData.path}, Actual value: ${JSON.stringify(values[0])}, Expected value: ${JSON.stringify(eachJsonData.value)}`);
                }
            } else if (eachJsonData.value.constructor.name === 'Boolean')  {
                if (values[0] !== eachJsonData.value) {
                    throw new ResponseJSONDataMismatchError(`JSON path evaluated value did not match with expected Boolean value, json path: ${eachJsonData.path}, Actual value: ${values[0]}, Expected value: ${eachJsonData.value}`);
                }
            }
            else {
                throw new Error(`Unknown json data value type, only Array, Object, RegExp, Number, Boolean & String are allowed`);
            }
        }

        return true;
    }

    _validateJSONSchema(response, jsonSchemaInfo) {
        let InvalidSpecificationSchemaError = customError('InvalidSpecificationSchemaError');
        let ResponseJSONSchemaValidationError = customError('ResponseJSONSchemaValidationError');
        let expectedSchema;
        const dependencySuite = this.dependencyOpts.outerDependency ?  this.dependencyOpts.outerDependencySuite : this.suite;

        try {
            if (jsonSchemaInfo.type === 'inline') {
                try {
                    expectedSchema = JSON.parse(jsonSchemaInfo['$ref']);
                } catch (e) {
                    throw new ResponseJSONSchemaValidationError(`${e.name} occurred while parsing the inline input schema \n ${e.message} \n Input schema \n ${jsonSchemaInfo['$ref']}`);
                }

            } else if (jsonSchemaInfo.type === 'file') {
                const schemaFile = dependencySuite.resolveFile(jsonSchemaInfo['$ref']);
                const fileData = fs.readFileSync(schemaFile, 'utf8');

                try {
                    expectedSchema = JSON.parse(fileData);
                } catch (e) {
                    throw new ResponseJSONSchemaValidationError(`${e.name} occurred while parsing the input schema in '${schemaFile}' \n ${e.message} \n Input schema: \n ${fileData}`);
                }
            } else {
                throw new InvalidSpecificationSchemaError(`Response json schema type should be inline or file`);
            }

            const schemaValidation = validateObject(JSON.parse(response._response.body), expectedSchema);

            if (schemaValidation.errors.length >= 1) {
                let errors = [];

                for (let error of schemaValidation.errors) {
                    errors.push(`Response json schema validation failed for property - ${error.property}, message: ${error.message}`);
                }

                throw new ResponseJSONSchemaValidationError(errors.join('\n'));
            }
        } catch (err) {
            if (err.name === 'ResponseJSONSchemaValidationError') {
                throw err;
            } else {
                throw new ResponseJSONSchemaValidationError(`${err.name} occurred during response json schema validation \n ${err.message}`);
            }

        }
    }


}
