'use strict';

const spawn = require('cross-spawn').spawn;
const path = require('path');

function runJustAPIJSON(suiteName, args) {
    let suite = resolveSuitePath(suiteName);

    let jsonFile = (new Date()).getTime().toString();
    let jsonReportOpts = `jsonReportDir=logs,jsonReportName=${jsonFile}`;
    const jsonReport = path.resolve(path.resolve('./test/cli/src/logs'), `${jsonFile}.json`);
    args = args || [];
    args = args.concat(['--reporter', 'json', '--reporter-options', jsonReportOpts, suite]);

    let justAPIProcess = invokeJustAPI(args);

    return {
        error: justAPIProcess.error,
        output: justAPIProcess.output,
        exitCode: justAPIProcess.status,
        terminationSignal: justAPIProcess.signal,
        jsonReport: jsonReport
    }
}

function invokeJustAPI (args) {
    args = [path.join(__dirname, '..', '..', 'bin', 'just-api')].concat(args);
    
    return spawn.sync(process.execPath, args, { cwd: path.resolve('./test/cli/src') });
}

function resolveSuitePath (suiteFile) {
    return path.resolve(process.cwd(), 'test/cli/src/suites', suiteFile);
}

module.exports = {
    runJustAPIJSON: runJustAPIJSON
};
