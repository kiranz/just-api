'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('Response JSON data validation with JSON path', function () {
    let suiteContext = this;

    before(async function () {
        let result = runJustAPIJSON('jsondata.suite.yml');
        if (result.error) throw result.error;
        expect(result.exitCode).to.equal(1);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(0);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(1);
        expect(reportData.passedTestsCount).to.equal(5);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(4);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');

        suiteContext.result = reportData.suites[0];
    });

    it('validate json response with json data functionality', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('validate json response with json data functionality regex', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('validate json response with multiple json data expectations', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('validate json response with json data value as object', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });
    it('validate json response with json data value as Array', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('validate json response with json data functionality - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('ResponseJSONDataMismatchError');
        expect(test.error.message).to.contain('JSON path evaluated value did not match with expected value');
    });

    it('should fail when json data regex does not match the value', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('ResponseJSONDataMismatchError');
        expect(test.error.message).to.contain('JSON path evaluated value did not match the expected Regexp');
    });

    it('validate json response with json data value as non matching object - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('ResponseJSONDataMismatchError');
        expect(test.error.message).to.contain('JSON path evaluated value did not match with expected value');
    });

    it('validate json response with json data value as non matching Array - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('ResponseJSONDataMismatchError');
        expect(test.error.message).to.contain('JSON path evaluated value did not match with expected value');
    });


});