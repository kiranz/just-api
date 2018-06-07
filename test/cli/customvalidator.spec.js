'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('Custom Validator', function () {
    let suiteContext = this;

    before(async function () {
        let result = runJustAPIJSON('customvalidator.suite.yml');
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
        expect(reportData.failedTestsCount).to.equal(8);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');

        suiteContext.result = reportData.suites[0];
    });

    it('inline custom validator sync function', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('inline custom validator async function', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('custom validator sync function from module', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('custom validator async function from module', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('pass');
        expect(test.error).to.be.a('null');
    });

    it('inline custom validator sync function - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('CustomResponseValidationError');
        expect(test.error.message).to.contain('error thrown from custom validator sync function');
    });

    it('validate json response with inline custom validator async function - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('CustomResponseValidationError');
        expect(test.error.message).to.contain('error thrown from custom validator async function');
    });


    it('inline custom validator async function has rejected promise - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('CustomResponseValidationError');
        expect(test.error.message).to.contain('rejected promise');
    });

    it('inline custom validator async function returns rejected promise - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('CustomResponseValidationError');
        expect(test.error.message).to.contain('rejected promise');
    });


    it('custom validator sync function from module - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('CustomResponseValidationError');
        expect(test.error.message).to.contain('error thrown from custom validator module sync function');
    });

    it('custom validator async function from module - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('CustomResponseValidationError');
        expect(test.error.message).to.contain('error thrown from custom validator module async function');
    });

    it('module custom validator async function has rejected promise - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('CustomResponseValidationError');
        expect(test.error.message).to.contain('rejected promise');
    });

    it('module custom validator async function returns rejected promise - should fail', function () {
        let result = suiteContext.result;
        let test = result.tests.find(t =>  t.name === this.test.title);
        expect(test.status).to.equal('fail');
        expect(test.error.name).to.equal('CustomResponseValidationError');
        expect(test.error.message).to.contain('rejected promise');
    });

});