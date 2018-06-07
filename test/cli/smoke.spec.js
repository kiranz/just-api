'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('smoke test', async function () {
    it('can invoke and run just-api with serial execution mode', async function () {
        let result = runJustAPIJSON('smoke*.suite.yml');
        if (result.error) throw result.error;

        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');

        const report = fs.readFileSync(result.jsonReport);
        const reportData = JSON.parse(report);
        expect(reportData.passedSuitesCount).to.equal(2);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(2);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(0);

        reportData.suites.forEach(suite => {
            expect(suite.error).to.be.a('null');
        })
    });

    it('can invoke and run just-api with parallel execution mode', async function () {
        let args = ['--parallel', '4'];
        let result = runJustAPIJSON('smoke*.suite.yml', args);
        if (result.error) throw result.error;

        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');

        const report = fs.readFileSync(result.jsonReport);
        const reportData = JSON.parse(report);
        expect(reportData.passedSuitesCount).to.equal(2);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(2);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(0);

        reportData.suites.forEach(suite => {
            expect(suite.error).to.be.a('null');
        })
    });

});