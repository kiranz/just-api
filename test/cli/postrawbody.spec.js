'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('Post raw body request', function () {
    let suiteContext = this;

    before(async function () {
        let result = runJustAPIJSON('postrawbody.suite.yml');
        if (result.error) throw result.error;
        expect(result.exitCode).to.equal(1);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(0);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(1);
        expect(reportData.passedTestsCount).to.equal(4);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(4);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');
        suiteContext.result = reportData.suites[0];
    });

    it('post json data as  body', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('post text data as json body', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('post text data as body', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('post binary data (file) as body', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('post json data as  body without header - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('InvalidRequestHeaderError');
        expect(test.error.message).to.contain('Request method is post,request body is provided but Content-Type header is not provided');
    });

    it('post text data as body with wrong content - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('InvalidRequestSpecificationError');
        expect(test.error.message).to.contain('Payload type is given as text, but content provided is not a string or number');
    });

    it('post binary data (non existant file) as body - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('RequestBodyBuilderError');
        expect(test.error.message).to.contain('does not exist, Provide a valid file path to be sent as body content');
    });

    it('post binary data (directory path) as body - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('RequestBodyBuilderError');
        expect(test.error.message).to.contain('is not a file, Provide a valid file path to be sent as body content');
    });

});