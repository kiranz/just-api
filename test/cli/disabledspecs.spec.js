'use strict';

const runJustAPIJSON = require('./helpers').runJustAPIJSON;
const expect = require('chai').expect;
const fs = require('fs');

describe('Disabled specs', function () {
    let suiteContext = this;
    let tests = ['disabled', 'enabled default', 'enabled with spec'];

    before(async function () {
        let result = runJustAPIJSON('disabledspecs.suite.yml');
        if (result.error) throw result.error;
        expect(result.exitCode).to.equal(0);
        expect(result.terminationSignal).to.be.a('null');
        const report = fs.readFileSync(result.jsonReport);
        let reportData = JSON.parse(report);

        expect(reportData.passedSuitesCount).to.equal(1);
        expect(reportData.skippedSuitesCount).to.equal(0);
        expect(reportData.failedSuitesCount).to.equal(0);
        expect(reportData.passedTestsCount).to.equal(2);
        expect(reportData.skippedTestsCount).to.equal(1);
        expect(reportData.failedTestsCount).to.equal(0);
        expect(reportData.suites.length).to.equal(1);
        expect(reportData.suites[0].status).to.equal('pass');

        suiteContext.result = reportData.suites[0];
    });

    tests.forEach(function (testTitle) {
        it(testTitle, function () {
            let result = suiteContext.result;
            let test = result.tests.find(t =>  t.name === this.test.title);
            if (this.test.title.includes('disabled')) {
                expect(test.status).to.equal('skip');
                expect(test.error).to.be.a('null');
            } else {
                expect(test.status).to.equal('pass');
                expect(test.error).to.be.a('null');
            }

        });
    });


});