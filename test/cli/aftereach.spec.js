'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('suite configuration', function () {

    function runConfigSuite(path) {
        let result = runJustAPIJSON(path);
        if (result.error) throw result.error;

        return result;
    }

    it('module sync success', function () {
        let result = runConfigSuite('hooks/aftereach/aftereach.module.success.suite.yml');
        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(1);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(2);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('pass');
        expect(reportData.suites[0].tests.length).to.equal(2);
    });

    it('module sync failure', function () {
        let result = runConfigSuite('hooks/aftereach/aftereach.module.failure.suite.yml');
        expect(result.exitCode).to.equal(1);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(0);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(1);
        expect(reportData.passedTestsCount).to.equal(0);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(2);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');
        expect(reportData.suites[0].tests.length).to.equal(2);
        expect(reportData.suites[0].error).to.be.a('null');
        reportData.suites[0].tests.forEach(t => {
            expect(t.error.name).to.equal('AfterEachHookError');
        })
    });

    it('module async success', function () {
        let result = runConfigSuite('hooks/aftereach/aftereach.module.async.success.suite.yml');
        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(1);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(2);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('pass');
        expect(reportData.suites[0].tests.length).to.equal(2);
    });

    it('module async failure', function () {
        let result = runConfigSuite('hooks/aftereach/aftereach.module.async.failure.suite.yml');
        expect(result.exitCode).to.equal(1);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(0);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(1);
        expect(reportData.passedTestsCount).to.equal(0);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(2);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');
        expect(reportData.suites[0].tests.length).to.equal(2);
        expect(reportData.suites[0].error).to.be.a('null');
        reportData.suites[0].tests.forEach(t => {
            expect(t.error.name).to.equal('AfterEachHookError');
        })
    });


    it('inline sync success', function () {
        let result = runConfigSuite('hooks/aftereach/aftereach.inline.success.suite.yml');
        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(1);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(2);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('pass');
        expect(reportData.suites[0].tests.length).to.equal(2);
    });

    it('inline sync failure', function () {
        let result = runConfigSuite('hooks/aftereach/aftereach.inline.failure.suite.yml');
        expect(result.exitCode).to.equal(1);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(0);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(1);
        expect(reportData.passedTestsCount).to.equal(0);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(2);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');
        expect(reportData.suites[0].tests.length).to.equal(2);
        expect(reportData.suites[0].error).to.be.a('null');
        reportData.suites[0].tests.forEach(t => {
            expect(t.error.name).to.equal('AfterEachHookError');
        })
    });

    it('inline async success', function () {
        let result = runConfigSuite('hooks/aftereach/aftereach.inline.async.success.suite.yml');
        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(1);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(2);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('pass');
        expect(reportData.suites[0].tests.length).to.equal(2);
    });

    it('inline async failure', function () {
        let result = runConfigSuite('hooks/aftereach/aftereach.inline.async.failure.suite.yml');
        expect(result.exitCode).to.equal(1);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(0);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(1);
        expect(reportData.passedTestsCount).to.equal(0);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(2);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');
        expect(reportData.suites[0].tests.length).to.equal(2);
        expect(reportData.suites[0].error).to.be.a('null');
        reportData.suites[0].tests.forEach(t => {
            expect(t.error.name).to.equal('AfterEachHookError');
        })
    });

});