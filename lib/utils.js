import path from 'path';
import fs from 'fs';
import glob from 'glob';
import he from 'he';
import { customError } from './errors';
import isEqual from 'lodash/isEqual';

export function doesDirectoryExist(dirPath) {
    const fullPath = path.resolve(process.cwd(), dirPath);

    try {
        const stat = fs.statSync(fullPath);
        return stat.isDirectory();
    } catch (err) {
        return false;
    }
}

export function findSuiteFiles(basePath, digDeep = false, extensions = ['yml', 'yaml']) {
    let files = [];

    if (!fs.existsSync(basePath)) {

        if (fs.existsSync(basePath + '.yml')) {
            basePath += '.yml';
        } else if (fs.existsSync(basePath + '.yaml')) {
            basePath += '.yaml';
        } else {
            files = glob.sync(basePath);

            if (!files.length) {
                throw new Error(`No suites found using path/pattern ${basePath}`);
            }
            return files;
        }
    }

    try {
        let stat = fs.statSync(basePath);

        if (stat.isFile()) {
            return basePath;
        }
    } catch (err) {
        return;
    }

    fs.readdirSync(basePath).forEach(function (fileOrDir) {
        let file = path.join(basePath, fileOrDir);

        try {
            var stat = fs.statSync(file);

            if (stat.isDirectory()) {
                if (digDeep) {
                    files = files.concat(findSuiteFiles(file, digDeep, extensions));
                }
                return;
            }
        } catch (err) {
            return;
        }

        let re = new RegExp('\\.(?:' + extensions.join('|') + ')$');

        if (!stat.isFile() || !re.test(file) || path.basename(file)[0] === '.') {
            return;
        }

        files.push(file);
    });

    return files;
}

export function assertFileValidity(filePath, fileContext) {
    const absPath = filePath;

    if (!fs.existsSync(absPath)) {
        const FileDoesNotExistError = customError('FileDoesNotExistError');
        throw new FileDoesNotExistError(`${fileContext} file doesn't exist at '${absPath}'`);
    }

    if (!fs.statSync(absPath).isFile()) {
        throw new Error(`${fileContext} at: ${absPath} is not a file`);
    }

    return absPath;
}

export function loadModule(modulePath) {
    try {
        return require(modulePath);
    } catch (e) {
        throw e;
    }
}

export async function runModuleFunction(module, fnName, context, args) {
    let CustomFunctionNotFoundInModuleError = customError('CustomFunctionNotFoundInModuleError');
    let NotAFunctionError = customError('NotAFunctionError');

    try {
        let func = module[fnName];

        if (!func) {
            throw new CustomFunctionNotFoundInModuleError(`'${fnName}' function not found in module`);
        }

        if (typeof func !== 'function') {
            throw new NotAFunctionError(`'${fnName}', Provide valid javascript function`);
        }

        let result = await module[fnName].call(context);

        return result;
    } catch (error) {
        throw error;
    }
}

export async function runInlineFunction(fn, context, args) {
    let NotAFunctionError = customError('NotAFunctionError');

    if (typeof fn !== 'function') {
        throw new NotAFunctionError(`'${fn}' is not a function, Provide valid inline javascript function`);
    }

    try {
        let result = await fn.call(context);
        return result;
    } catch (error) {
        throw error;
    }
}

export function convertMillisToHumanReadableFormat(duration) {
    let milliseconds = parseInt((duration % 1000));
    let seconds = parseInt((duration / 1000) % 60);
    let minutes = parseInt((duration / (1000 * 60)) % 60);
    let hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    if (hours === 0) {
        return minutes + "m" + seconds + "s." + milliseconds + "ms";
    }

    return hours + "h" + minutes + "m" + seconds + "s." + milliseconds + "ms";
}

export async function wait(durationInMillis) {
    return new Promise(resolve => setTimeout(resolve, durationInMillis));
}

export function isNumber(number) {
    return !isNaN(parseFloat(number)) && isFinite(number);
}

export function escapeHTML(html) {
    return he.escape(String(html));
}

export function prettifyRequestLog(reqResInfo) {
    let result = '';

    const request = reqResInfo.request;
    const response = reqResInfo.response;
    const error = reqResInfo.error;

    result += 'Request: \n\n';
    result += `${request.method.toUpperCase()} ${request.uri} \n`;

    for (let headerKey in request.headers) {
        result += `${headerKey}: ${request.headers[headerKey]}\n`;
    }

    result += '\n';

    if (request.body && request.formRequest) {
        result += "It's a form/multipart-form request, this may or may not be the actual raw body \n";
        result += JSON.stringify(request.body) + '\n';
    }

    if (request.body && !request.formRequest) {
        result += request.body + '\n';
    }

    if (error) {
        result += '\n--Encountered following error \n\n';
        result += `${error}`;
        result += '\n';
    } else {
        result += '\nResponse: \n\n';
        result += `Status code: ${response.statusCode} \n`;

        for (let headerKey in response.headers) {
            result += `${headerKey}: ${response.headers[headerKey]}\n`;
        }

        result += '\n';

        if (response.headers['content-type'].includes('application/json')) {
            try {
                //TODO send json as pretty multiline string so it's easy to read
                result += response.body.toString();
            } catch (e) {
                result += response.body.toString();
            }
        } else {
            result += response.body.toString();
        }

        result += '\n';
        result += `\nRequest duration: ${response.timings.total}ms \n`;
    }

    return result;
}

export function equals(value, other) {
    return isEqual(value, other);
}

