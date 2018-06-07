'use strict';

import EventEmitter from 'events';
import fs from 'fs';
import * as childProcess from 'child_process';

import Suite from './suite';
import { convertMillisToHumanReadableFormat, isNumber } from './utils';

export default class Launcher extends EventEmitter {

    constructor(specFiles, options) {
        super();

        this.specs = specFiles.slice(0);
        this.options = options;
        this.pendingFiles = specFiles.slice(0);
        this.runningFiles = [];
        this.suiteOptions = {};
        this.parallel = options.parallel;
        this.max_parallel = options.max_parallel;
        this.max_parallel_limit = options.max_parallel_limit;
        this.suiteOptions.grep = options.grep;
        this.reporterOptions = options.reporterOptions;
        this.results = [];

        this.setupReporters(options.reporters);
    }

    setupReporters(reporters) {
        if (!reporters) {
            console.error(`Reporters not set`);
            process.exit(1);
        }

        this.reporters = [];

        for (let Reporter of reporters) {
            let reporter = new Reporter(this, {
                parallel: this.parallel,
                reporterOptions: {...this.reporterOptions}
            });

            this.reporters.push(reporter);
        }
    }

    async go() {
        const self = this;

        this.emit('start', this.pendingFiles.slice(0));

        if (self.parallel) {
            let parallelRuns;

            if (self.max_parallel >= self.pendingFiles.length) {
                parallelRuns = self.pendingFiles.length;
            } else {
                parallelRuns = self.max_parallel;
            }

            for (let run = 1; run <= parallelRuns; run++) {
                self.runNextSuite(self);
            }


        } else {
            for (let file of self.pendingFiles) {
                const suite = new Suite(file, this.suiteOptions);
                this.emit('new suite', suite);
                await suite.launch();
                let result = suite.result;
                result.status = suite.status;
                self.results.push(result);
            }

            this.exit();
        }
    }

    runNextSuite(context) {
        let self = context;

        if (self.runningFiles.length === 0 && self.pendingFiles.length === 0) {
            self.exit();
        }

        let file = self.pendingFiles.shift();

        if (file) {
            let suite = new Suite(file, self.suiteOptions);
            self.runningFiles.push(file);
            this.emit('new suite', suite);

            suite.on('end', function (suiteObject, error) {
                self.runningFiles.splice(self.runningFiles.indexOf(suiteObject.file), 1);
                let result = suiteObject.result;
                result.status = suiteObject.status;
                self.results.push(result);
                self.runNextSuite(self);
            });

            suite.launch();
        } else if (!file && self.runningFiles.length > 0) {
            console.log(`\n ${self.runningFiles.length} suite(s) are still running...`);
        }
    }

    exit() {
        this.emit('end');

        try {
            let failedSuites = this.results.filter(suiteResult => (suiteResult.status !== 'pass' && suiteResult.status !== 'skip'));
            console.log();
            process.exit(failedSuites.length);
        } catch (error) {
            console.log();
            process.exit(1);
        }

    }

}