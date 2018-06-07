function beforeTestSyncSuccess() {
    this.test.query_params = {param1: 'value2'};
}

async function beforeTestAsyncSuccess() {
    var self = this;

    await new Promise(function (resolve, reject) {
        setTimeout(function () {
            self.test.query_params = {param1: 'value2'};
            resolve(true);
        }, 1);
    });
}

function beforeTestSyncError() {
    this.test.query_params = {param1: 'value2'};
    throw new Error('error thrown in before test hook');
}

async function beforeTestAsyncError() {
    var self = this;

    await new Promise(function (resolve, reject) {
        setTimeout(function () {
            self.test.query_params = {param1: 'value2'};
            resolve(true);
        }, 1);
    });

    throw new Error('error thrown in before test hook');
}

async function beforeTestAsyncRejectedPromise() {
    var self = this;

    await new Promise(function (resolve, reject) {
        setTimeout(function () {
            self.test.query_params = {param1: 'value2'};
            reject('error thrown in before test hook');
        }, 1);
    });
}

module.exports = {
    beforeTestSyncSuccess: beforeTestSyncSuccess,
    beforeTestAsyncSuccess: beforeTestAsyncSuccess,
    beforeTestSyncError: beforeTestSyncError,
    beforeTestAsyncError: beforeTestAsyncError,
    beforeTestAsyncRejectedPromise: beforeTestAsyncRejectedPromise
};