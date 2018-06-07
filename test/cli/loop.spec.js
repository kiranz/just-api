'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('loop', function () {
    let suiteContext = this;

    before(async function () {
        let result = runJustAPIJSON('loop.suite.yml');
        if (result.error) throw result.error;
        expect(result.exitCode).to.equal(1);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(0);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(1);
        expect(reportData.passedTestsCount).to.equal(11);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(2);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('fail');

        suiteContext.result = reportData.suites[0];
    });

    it('test status', function () {
        let result = suiteContext.result;
        result.tests.forEach(function (test) {
            if (test.name === 'loop continues despite iteration failure - should fail one in loop - loop iteration 1') {
                expect(test.status).to.equal('fail');
                expect(test.error.name).to.equal('CustomResponseValidationError');
                expect(test.error.message).to.contain('failing loop spec on an iteration');
            } else if (test.name === 'loop function failure - should fail') {
                expect(test.status).to.equal('fail');
                expect(test.error.name).to.equal('LoopItemsBuilderError');
                expect(test.error.message).to.contain('error thrown from loop items builder function');
            } else {
                expect(test.status).to.equal('pass');
                expect(test.error).to.be.a('null');
            }
        });

    });


});