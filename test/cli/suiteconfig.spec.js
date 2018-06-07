'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('suite configuration', function () {
    let suiteContext = this;

    function runConfigSuite(path) {
        let result = runJustAPIJSON(path);
        if (result.error) throw result.error;
        return result;
    }

    it('inline async error', function () {
        let result = runConfigSuite('suiteconfig/inline.async.error.suite.yml');
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
        expect(reportData.suites[0].error.name).to.equal('SuiteConfigurationFailedError');
    });

    it('inline async invalid config', function () {
        let result = runConfigSuite('suiteconfig/inline.async.invalidconfig.suite.yml');
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
        expect(reportData.suites[0].error.name).to.equal('InvalidSuiteConfigurationError');
        expect(reportData.suites[0].error.message).to.contain('property - instance, message: requires property "scheme"');
    });

    it('inline async rejected promise', function () {
        let result = runConfigSuite('suiteconfig/inline.async.rejectedpromise.suite.yml');
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
        expect(reportData.suites[0].error.name).to.equal('SuiteConfigurationFailedError');
    });

    it('inline async valid', function () {
        let result = runConfigSuite('suiteconfig/inline.async.valid.suite.yml');
        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(1);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(1);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('pass');
        expect(reportData.suites[0].tests.length).to.equal(1);
        expect(reportData.suites[0].error).to.be.a('null');
    });


    it('inline sync error', function () {
        let result = runConfigSuite('suiteconfig/inline.sync.error.suite.yml');
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
        expect(reportData.suites[0].error.name).to.equal('SuiteConfigurationFailedError');
    });

    it('inline sync invalid config', function () {
        let result = runConfigSuite('suiteconfig/inline.sync.invalidconfig.suite.yml');
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
        expect(reportData.suites[0].error.name).to.equal('InvalidSuiteConfigurationError');
        expect(reportData.suites[0].error.message).to.contain('property - instance, message: requires property "scheme"');
    });

    it('inline sync valid', function () {
        let result = runConfigSuite('suiteconfig/inline.sync.valid.suite.yml');
        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(1);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(1);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('pass');
        expect(reportData.suites[0].tests.length).to.equal(1);
        expect(reportData.suites[0].error).to.be.a('null');
    });

});