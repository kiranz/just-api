function loopSyncSuccess() {
    return ['a', 'b'];
}

async function loopAsyncSuccess() {
    var promise = await new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(['a', 'b'])
        }, 3)
    });

    return promise;
}

module.exports = {
    loopSyncSuccess: loopSyncSuccess,
    loopAsyncSuccess: loopAsyncSuccess
};