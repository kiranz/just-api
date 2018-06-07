'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('grep', function () {
    let suiteContext = this;

    it('grep using string', async function () {
        let result = runJustAPIJSON('grep.suite.yml', ['--grep', 'matches']);
        if (result.error) throw result.error;

        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(1);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(2);
        expect(reportData.skippedTestsCount).to.equal(2);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('pass');

        suiteContext.result = reportData.suites[0];

        suiteContext.result.tests.forEach(function (test) {
            if (test.name.includes('matches')) {
                expect(test.status).to.equal('pass');
                expect(test.error).to.be.a('null');
            } else {
                expect(test.status).to.equal('skip');
                expect(test.error).to.be.a('null');
            }
        })
    });

    it('grep using regex', async function () {
        let result = runJustAPIJSON('grep.suite.yml', ['--grep', /(\d)/]);
        if (result.error) throw result.error;

        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(1);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(2);
        expect(reportData.skippedTestsCount).to.equal(2);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('pass');

        suiteContext.result = reportData.suites[0];
        let regex = new RegExp(/(\d)/);

        suiteContext.result.tests.forEach(function (test) {
            if (regex.test(test.name)) {
                expect(test.status).to.equal('pass');
                expect(test.error).to.be.a('null');
            } else {
                expect(test.status).to.equal('skip');
                expect(test.error).to.be.a('null');
            }
        })
    });

});