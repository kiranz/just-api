'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('Disabled suite', function () {

    it('correct response code', async function () {
        let result = runJustAPIJSON('disabledsuite.suite.yml');
        if (result.error) throw result.error;
        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(0);
        expect(reportData.skippedSuitesCount).to.equal(1);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(0);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('skip');
    });


});