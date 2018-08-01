import fs from 'fs';
import path from 'path';
import { loadYAML } from './schema/yaml/loader';
import { customError } from './errors';

export default class SuiteDependency {

    constructor(filePath, parent) {
        this.file = filePath;
        this.parent = parent;
        this.targetConfiguration = {};
        this.commonHeaders = {};
    }

    loadFileAndValidateSchema() {
        this.parent.loadFileAndValidateSchema.call(this);
    }

    loadFile(file) {
        if (!fs.existsSync(file)) {
            let FileDoesNotExistError = customError('FileDoesNotExist');
            throw new FileDoesNotExistError(`Test suite file doesn't exist at '${file}'`);
        }

        try {
            return loadYAML(file, {encoding: 'UTF-8', customTypes: ['asyncFunction']});
        } catch (err) {
            let YAMLSuiteLoadingError = customError('YAMLSuiteLoadingError');
            throw new YAMLSuiteLoadingError(`(${file}) \n ${err.message}`);
        }
    }

    resolveFile(filePath) {
        return this.parent.resolveFile.call(this, filePath);
    }

    async configure() {
        await this.parent.configure.call(this);
    }
}