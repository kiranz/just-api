'use strict';

const chalk = require('chalk');
import BaseReporter from './base';
import { INDICATORS } from './base';
const testIndent = '  ';
const suiteIndent = ' ';

export default class SpecsReporter extends BaseReporter {

    constructor(launcher, opts = {}) {
        super(launcher, opts);

        this.launcher = launcher;
        this.isParallelRun = opts.parallel;
        let self = this;

        launcher.on('start', function (suiteFiles) {
            console.log();
            console.log(`Launcher will run suites: ${suiteFiles}`);
        });

        launcher.on('end', function () {
            console.log();
        });

        launcher.on('new suite', function (suite) {
            self.addSuite(suite)
        });
    }

    addSuite(suite) {
        super.addSuite(suite);

        suite.on('test pass', function (test) {
            console.log();
            console.log(chalk.green(`${testIndent} ${INDICATORS.ok} ${test.name} (${test.duration}ms)`));
        });

        suite.on('test fail', function (test, error) {
            console.log();
            console.log(chalk.red(`${testIndent} ${INDICATORS.err} ${test.name} (${test.duration}ms)`));
        });

        suite.on('test skip', function (test) {
            console.log();
            console.log(chalk.cyan(`${testIndent} - ${test.name} (${test.duration}ms)`));
        });

        suite.on('end', function (suite, error) {
            console.log();

            if (suite.status === 'pass') {
                console.log(chalk.green(`${suiteIndent} Done: ${suite.file} (Passed)`));
            } else if (suite.status === 'skip') {
                console.log(chalk.cyan(`${suiteIndent} Done: ${suite.file} (Skipped)`));
            } else {
                console.log(chalk.red(`${suiteIndent} Done: ${suite.file} (Failed)`));
            }
        });
    }

}