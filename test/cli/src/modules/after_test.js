function afterTestSyncSuccess() {
    var body = JSON.parse(this.response.body);
    if (body.param1 !== 'value2')
        throw new Error('unexpected response');
}

async function afterTestAsyncSuccess() {
    var self = this;

    await new Promise(function (resolve, reject) {
        setTimeout(function () {
            var body = JSON.parse(self.response.body);
            if (body.param1 !== 'value2')
                throw new Error('unexpected response');
            resolve(true);
        }, 1);
    });
}

function afterTestSyncError() {
    var body = JSON.parse(this.response.body);
    if (body.param1 !== 'value2')
        throw new Error('unexpected response');

    throw new Error('error thrown in after test hook');
}

async function afterTestAsyncError() {
    var self = this;

    await new Promise(function (resolve, reject) {
        setTimeout(function () {
            var body = JSON.parse(self.response.body);
            if (body.param1 !== 'value2')
                throw new Error('unexpected response');
            resolve(true);
        }, 1);
    });

    throw new Error('error thrown in after test hook');
}

async function afterTestAsyncRejectedPromise() {
    var self = this;

    await new Promise(function (resolve, reject) {
        setTimeout(function () {
            var body = JSON.parse(self.response.body);
            if (body.param1 !== 'value2')
                throw new Error('unexpected response');
            reject('error thrown in after test hook');
        }, 1);
    });
}

module.exports = {
    afterTestSyncSuccess: afterTestSyncSuccess,
    afterTestAsyncSuccess: afterTestAsyncSuccess,
    afterTestSyncError: afterTestSyncError,
    afterTestAsyncError: afterTestAsyncError,
    afterTestAsyncRejectedPromise: afterTestAsyncRejectedPromise
};