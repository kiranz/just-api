'use strict';

const chalk = require('chalk');
import { convertMillisToHumanReadableFormat } from './../utils';
import ms from 'pretty-ms';

export const INDICATORS = {
    ok: '✓',
    err: '✖'
};

export default class BaseReporter {

    constructor(launcher, opts = {}) {
        try {
            this.startTime = process._api.startTime;
        } catch (err) {
            this.startTime = new Date();
        }

        this.launcher = launcher;
        this.isParallelRun = opts.parallel;
        const self = this;

        launcher.on('start', function (suiteFiles) {
            self.suites = [];
            self.plannedSuites = suiteFiles.slice(0);
        });

        launcher.on('end', function () {
            self.printSummary();
        });
    }

    addSuite(suite) {
        this.suites.push({
            location: suite.file,
            status: null,
            tests: [],
            passedTestsCount: 0,
            failedTestsCount: 0,
            skippedTestsCount: 0,
            failures: [],
            error: null
        });

        const self = this;

        suite.on('test pass', function (test) {
            let suite = self.getSuite(test.suite.file);
            suite.tests.push(test);
            suite.passedTestsCount += 1;
        });

        suite.on('test fail', function (test, error) {
            let suite = self.getSuite(test.suite.file);
            suite.tests.push(test);
            suite.failedTestsCount += 1;
            suite.failures.push({name: test.name, error: error, file: test.suite.file});
        });

        suite.on('test skip', function (test) {
            let suite = self.getSuite(test.suite.file);
            suite.tests.push(test);
            suite.skippedTestsCount += 1;
        });

        suite.on('end', function (suiteObj, error) {
            let suiteResultObject = self.getSuite(suiteObj.file);
            suiteResultObject.status = suite.status;
            suiteResultObject.error = error || null;
        });
    }

    getSuite(location) {
        return this.suites.find(function (suiteObj) {
            return suiteObj.location === location;
        });
    }

    printSummary() {
        let failedSuitesCount = 0;
        let passedSuitesCount = 0;
        let skippedSuitesCount = 0;

        let passedTestsCount = 0;
        let failedTestsCount = 0;
        let skippedTestsCount = 0;
        let totalTestsCount = 0;

        for (let suite of this.suites) {

            if (suite.status === 'pass') {
                passedSuitesCount += 1;
            } else if (suite.status === 'skip') {
                skippedSuitesCount += 1;
            } else {
                failedSuitesCount += 1;
            }

            passedTestsCount += suite.passedTestsCount;
            failedTestsCount += suite.failedTestsCount;
            skippedTestsCount += suite.skippedTestsCount;
            totalTestsCount += suite.tests.length;
        }

        console.log();
        console.log(chalk.cyan(`${skippedTestsCount} skipped, `) + chalk.red(`${failedTestsCount} failed, `) + chalk.green(`${passedTestsCount} passed `) + `(${totalTestsCount} tests)`);
        console.log(chalk.cyan(`${skippedSuitesCount} skipped, `) + chalk.red(`${failedSuitesCount} failed, `) + chalk.green(`${passedSuitesCount} passed `) + `(${this.plannedSuites.length} suites)`);

        this.endTime = new Date();
        let duration = this.endTime.getTime() - this.startTime.getTime();
        console.log(`Duration: ${ms(duration)}`);

        if (failedTestsCount > 0 || failedSuitesCount > 0) {
            console.log('\nFailures:');
        }

        this.logFailures();
    }

    logFailures() {
        let count = 0;

        for (let suite of this.suites) {
            if (suite.error) {
                count++;
                console.log();
                console.log(chalk.red(` ${count}) Suite failure: ${suite.location}`));
                console.log(chalk.red(`${suite.error.stack}`));
            } else {
                if (suite.failures.length) {
                    for (let failure of suite.failures) {
                        count++;
                        console.log();
                        console.log(chalk.red(` ${count}) ${failure.name} (${failure.file})`));
                        console.log(chalk.red(`${failure.error.stack}`));
                    }
                }

            }
        }
    }


}