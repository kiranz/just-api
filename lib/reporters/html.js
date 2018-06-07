'use strict';

import fs from 'fs';
import path from 'path';
import { INDICATORS, colors } from './base';
import { escapeHTML, doesDirectoryExist, prettifyRequestLog } from './../utils';
import he from 'he';

import { buildHTML } from './html-src/template';
import ms from 'pretty-ms';

function loadCSS() {
    const stylesheet = path.join(__dirname, 'html-src/assets', 'html-report.css');
    return fs.readFileSync(stylesheet, 'utf-8')
}

function loadJS() {
    const js = path.join(__dirname, 'html-src/assets', 'html-report.js');
    return fs.readFileSync(js, 'utf-8')
}

export default class HTMLReporter {

    constructor(launcher, opts = {}) {
        this.launcher = launcher;
        this.isParallelRun = opts.parallel;
        this.reporterOptions = opts.reporterOptions;
        this.suites = [];
        let self = this;

        this.stats = {
            suites: 0,
            skippedSuites: 0,
            failedSuites: 0,
            passedSuites: 0,
            failedTests: 0,
            passedTests: 0,
            skippedTests: 0,
            tests: 0,
            start: process._api.startTime || new Date()
        };

        launcher.on('start', function (suiteFiles) {
            self.plannedSuites = suiteFiles.length;
        });

        launcher.on('end', function () {
            self.stats.end = new Date();
            self.stats.duration = ms(self.stats.end.getTime() - self.stats.start.getTime());
            let consolidatedMarkupForAllSuites = '';
            self.suites.forEach(suite => {
                consolidatedMarkupForAllSuites += suite.html;
            });

            const html = buildHTML({
                css: loadCSS(),
                js: loadJS(),
                report: consolidatedMarkupForAllSuites,
                stats: self.stats
            });

            try {
                let outputDirectory = this.reporterOptions.htmlReportDir || '';
                if (!doesDirectoryExist(outputDirectory)) {
                    console.error(`Directory ${outputDirectory} does not exist, cannot write html report`);
                    return;
                }

                let outputFile = this.reporterOptions.htmlReportName ? this.reporterOptions.htmlReportName + '.html' : 'report.html';
                const reportPath = path.resolve(process.cwd(), outputDirectory, outputFile);

                fs.writeFileSync(reportPath, html);
                console.log(`\nHTML report is written to "${reportPath}"`);
            } catch (err) {
                console.error(err);
            }
        });

        launcher.on('new suite', function (suite) {
            self.stats.suites++;
            self.addSuite(suite)
        });
    }

    addSuite(suite) {
        let self = this;

        let html = '';
        const suiteTitle = escapeHTML(suite.file);

        html += '<li class="suite">';
        html += `<h1 class="suite-name">${suiteTitle}</h1>`;
        html += '<ul>';

        this.suites.push({
            location: suite.file,
            status: null,
            html: html,
            error: null
        });


        suite.on('test pass', function (test) {
            let suite = self.getSuite(test.suite.file);
            const title = escapeHTML(test.name);

            suite.html += `<li class="test pass">`;
            suite.html += `<h2 class="test-name">${title} <span class="duration">( ${test.duration}ms )</span></h2>`;
            suite.html += '</li>';

            self.stats.passedTests++;
            self.stats.tests++;
        });

        suite.on('test fail', function (test, error) {
            let suite = self.getSuite(test.suite.file);
            const err = error;
            const title = escapeHTML(test.name);

            suite.html += '<li class="test fail">';
            suite.html += `<h2 class="test-name" onclick="toggleTestDetailedView(this)">${title} <span class="duration">( ${test.duration}ms )</span></h2>`;
            suite.html += `<pre class="error">${err.stack}</pre>`;

            if (self.reporterOptions.logRequests) {
                try {
                    if (test.requests && test.requests.length) {
                        let requestsLog = '';
                        for (let loggedRequestResponse of test.requests) {
                            let prettyLog = prettifyRequestLog(loggedRequestResponse);
                            prettyLog += '----------------------------------- \n';
                            requestsLog += prettyLog;
                        }
                        requestsLog = he.escape(requestsLog);
                        suite.html += `<pre class="test-requests">${requestsLog}</pre>`;
                    }
                } catch (e) {

                }
            }

            suite.html += '</li>';

            self.stats.failedTests++;
            self.stats.tests++;
        });

        suite.on('test skip', function (test) {
            let suite = self.getSuite(test.suite.file);

            const title = escapeHTML(test.name);
            const duration = test.duration || 1;

            suite.html += `<li class="test skip">`;
            suite.html += `<h2 class="test-name"">${title} <span class="duration">( ${test.duration}ms )</span></h2>`;
            suite.html += '</li>';

            self.stats.skippedTests++;
            self.stats.tests++;
        });

        suite.on('end', function (suite, error) {
            let suiteResultObject = self.getSuite(suite.file);
            suiteResultObject.status = suite.status;
            suiteResultObject.error = error || null;

            if (suite.status === 'fail') {
                if (error) {
                    suiteResultObject.html += `<pre class="suite-error">${error.stack}</pre>`;
                }

                if (self.reporterOptions.logRequests) {
                    try {
                        if (suite.requests && suite.requests.length) {
                            let requestsLog = '';

                            for (let loggedRequestResponse of suite.requests) {
                                let prettyLog = prettifyRequestLog(loggedRequestResponse);
                                prettyLog += '----------------------------------- \n';
                                requestsLog += prettyLog;
                            }

                            requestsLog = he.escape(requestsLog);
                            suiteResultObject.html += `<pre class="suite-requests">${requestsLog}</pre>`;
                        }
                    } catch (e) {

                    }
                }

                self.stats.failedSuites++;
            } else if (suite.status === 'pass') {
                self.stats.passedSuites++;
            } else if (suite.status === 'skip') {
                self.stats.skippedSuites++;
            }

            if (suite.status === 'skip') {
                let html = '';
                html += '<li class="suite skip">';
                html += `<h1 class="suite-name">${escapeHTML(suite.file)} - Skipped</h1>`;
                html += '<ul>';

                if (suite.name && suite.name.length > 0) {
                    html += `<span class="suite-name-hidden">${suite.name}</span>`;
                }

                html += '</ul></li>';
                suiteResultObject.html = html;
            } else {
                if (suite.name && suite.name.length > 0) {
                    suiteResultObject.html += `<span class="suite-name-hidden">${suite.name}</span>`;
                }
                suiteResultObject.html += '</ul>';
                suiteResultObject.html += '</li>';
            }


        });
    }

    getSuite(location) {
        return this.suites.find(function (suiteObj) {
            return suiteObj.location === location;
        });
    }

}