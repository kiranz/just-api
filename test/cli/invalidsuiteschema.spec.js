'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('Invalid suite schema', function () {

    it('invalid suite schema - request key missing in spec', function () {
        let result = runJustAPIJSON('suiteschema/invalidspecschema.suite.yml');
        expect(result.exitCode).to.equal(1);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(0);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(1);
        expect(reportData.passedTestsCount).to.equal(0);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');
        expect(reportData.suites[0].tests.length).to.equal(0);
        expect(reportData.suites[0].error.name).to.equal('InvalidSuiteSchemaError');
    });

});