'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('url encoded form post', function () {
    let suiteContext = this;

    before(async function () {
        let result = runJustAPIJSON('urlencodeformpost.suite.yml');
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
        expect(reportData.failedTestsCount).to.equal(2);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');

        suiteContext.result = reportData.suites[0];
    });

    it('post form data as body', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('post form data as body without header - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('InvalidRequestHeaderError');
        expect(test.error.message).to.contain('Request method is post,request body is provided but Content-Type header is not provided');
    });

    it('post form data as body with wrong header - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('InvalidRequestHeaderError');
        expect(test.error.message).to.contain('Request body is provided as form but request Content-Type is application/wrongheadertype. It should be application/x-www-form-urlencoded');
    });

});