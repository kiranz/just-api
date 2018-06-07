function customValidatorSuccessSync() {
    var keys = Object.keys(this);

    if (keys.length !== 1 || keys[0] !== 'response')
        throw new Error("response context is not available in custom validator module sync function");

    if (this.response.constructor.name !== 'IncomingMessage')
        throw new Error("response is not of type Incoming Message");

    var body = JSON.parse(this.response.body);

    if (body.key1 !== 'value1')
        throw new Error("Value of key1 is not value1");
}

function customValidatorErrorSync() {
    throw new Error('error thrown from custom validator module sync function');
}

async function customValidatorSuccessAsync() {
    var keys = Object.keys(this);
    if (keys.length !== 1 || keys[0] !== 'response')
        throw new Error("response context is not available in custom validator");

    var startTime = new Date().getTime();
    var result = await new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(1)
        }, 7);
    });
    var endTime = new Date().getTime();

    if ((endTime - startTime) < 7)
        throw new Error("did not wait until promise is resolved");

    var body = JSON.parse(this.response.body);

    if (body.key1 !== 'value1')
        throw new Error("Value of key1 is not value1");
}

async function customValidatorErrorAsync() {
    throw new Error('error thrown from custom validator module async function');
}

async function customValidatorErrorAsyncRejectedPromise() {
    var result = await new Promise(function (resolve, reject) {
        reject('rejected promise');
    });

    var endTime = new Date().getTime();
}

async function customValidatorErrorAsyncReturnRejectedPromise() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject('rejected promise')
        }, 3);
    });
}

module.exports = {
    customValidatorSuccessSync: customValidatorSuccessSync,
    customValidatorErrorSync: customValidatorErrorSync,
    customValidatorSuccessAsync: customValidatorSuccessAsync,
    customValidatorErrorAsync: customValidatorErrorAsync,
    customValidatorErrorAsyncRejectedPromise: customValidatorErrorAsyncRejectedPromise,
    customValidatorErrorAsyncReturnRejectedPromise: customValidatorErrorAsyncReturnRejectedPromise
};