'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('Params', function () {
    let suiteContext = this;

    before(async function () {
        let result = runJustAPIJSON('params.suite.yml');
        if (result.error) throw result.error;
        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(1);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(8);
        expect(reportData.skippedTestsCount).to.equal(0);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('pass');

        suiteContext.result = reportData.suites[0];
    });

    let tests = ['static query params in request', 'multiple static query params in request', 'query params added to test context', 'query params overidden in test context', 'static path params in request',
        'multiple static path params in request', 'query params added to test context', 'query params overidden in test context'];

    tests.forEach(function (testTitle) {
        it(testTitle, function () {
            let result = suiteContext.result;
            let test = result.tests.find(t =>  t.name === this.test.title);
            expect(test.status).to.equal('pass');
            expect(test.error).to.be.a('null');
        });
    })

});