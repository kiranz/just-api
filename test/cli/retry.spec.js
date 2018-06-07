'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('retries', function () {
    let suiteContext = this;

    before(async function () {
        let result = runJustAPIJSON('retry.suite.yml', ['--reporter-options', 'logRequests']);
        if (result.error) throw result.error;
        expect(result.exitCode).to.equal(1);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(0);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(1);
        expect(reportData.passedTestsCount).to.equal(1);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(1);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');

        suiteContext.result = reportData.suites[0];
    });

    it('retry returns success after 2 attempts', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('retry fails - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find( t =>  t.name === this.test.title );
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('ResponseStatusCodeDidNotMatchError');
        expect(test.error.message).to.contain('Expected status code: 200, Actual status code: 404');
    });

});