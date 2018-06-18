'use strict';

process._api = {};
process._api.startTime = new Date();

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
        process.exit(1);
    })
    .on('uncaughtException', err => {
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
    });

const program = require('commander');
import fs from 'fs';
import path from 'path';
import JustAPI from './just-api';
import { findSuiteFiles, doesDirectoryExist } from './utils';

program
    .version(JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')).version)
    .usage('<options> <files>')
    .option('--parallel <integer>', 'specify the number of suites to be run in parallel')
    .option('--reporter <reporternames>', 'specify the reporters to use, comma separated list e.g json,html')
    .option('--reporter-options <k=v,k2=v2,...>', 'reporter-specific options')
    .option('--grep <pattern>', 'only run tests matching <pattern>')
    .option('--recursive', 'include sub directories when searching for suites')
    .option('--reporters', 'display available reporters');

program.on('option:reporters', () => {
    console.log();
    console.log('    spec - hierarchical spec list');
    console.log('    html - html file');
    console.log();
    process.exit();
});

program._name = 'just-api';

program.parse(process.argv);

const args = program.args;
let suiteFiles = [];

if (!args.length) {
    console.warn('Test Suite path/pattern/directory is not specified, Looking for suites in specs directory');

    if (doesDirectoryExist('specs')) {
        args.push('specs');
    } else {
        console.error("'specs' directory does not exist. You can specify a path as 'just-api /path/to/yamlfile'");
        process.exit(1);
    }
}

args.forEach(arg => {
    let files;

    try {
        files = findSuiteFiles(arg, program.recursive);
    } catch (err) {
        if (err.message.indexOf('No suites found using path/pattern') === 0) {
            console.error(`Warning: Could not find any suite files matching pattern: ${arg}`);
            return;
        }

        throw err;
    }

    if (typeof files === 'string' || typeof files === 'object')
        suiteFiles = suiteFiles.concat(files);
});

let additionalOptions = {
    parallel: program.parallel,
    reporter: program.reporter,
    grep: program.grep,
    reporterOptions: program.reporterOptions
};

const justAPI = new JustAPI(suiteFiles, additionalOptions);
justAPI.init();
