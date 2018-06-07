'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('Intra suite spec dependencies', function () {
    let suiteContext = this;

    before(async function () {
        let result = runJustAPIJSON('suitedependencies/intradependencies.suite.yml');
        if (result.error) throw result.error;
        expect(result.exitCode).to.equal(1);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(0);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(1);
        expect(reportData.passedTestsCount).to.equal(3);
        expect(reportData.skippedTestsCount).to.equal(1);
        expect(reportData.failedTestsCount).to.equal(3);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');

        suiteContext.result = reportData.suites[0];
    });

    it('dep disabled', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('skip');
        expect(test.error).to.be.a('null');
    });

    it('beforetest hook intra-dependent', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('dep enabled', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('beforetest hook intra-dependent enabled', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('beforetest hook intra-dependent validate response - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('BeforeTestHookError');
        expect(test.error.message).to.contain('ResponseStatusCodeDidNotMatchError - Expected status code: 400, Actual status code: 200');
    });

    it('beforetest hook intra-dependent error in hook - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('BeforeTestHookError');
        expect(test.error.message).to.contain('SyntaxError - Unexpected token u in JSON at position');
    });

    it('beforetest hook intra-dependent no matching spec - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('BeforeTestHookError');
        expect(test.error.message).to.contain('NoSpecFoundMatchingNameError - No matching spec found with name');
    });

});