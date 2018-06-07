'use strict';

const request = require('request');
import  JustAPIResponse from './response';

export default class JustAPIRequest {
    constructor(options, test) {
        this.options = options;
        this.test = test;
    }

    async send() {
        const self = this;
        self.options.time = true;

        try {
            let response = await new Promise(function (resolve, reject) {
                request(self.options, function (err, response, body) {
                    let log = {};

                    log.request = {
                        uri: this.uri.href,
                        method: this.method,
                        headers: {...this.headers}
                    };

                    if (this.body) {
                        log.request.body = this.body.toString('utf8');
                    } else if (this.formData) {
                        log.request.formRequest = true;
                        log.request.body = {...this.formData};
                    }

                    if (err !== null) {
                        log.error = err;
                        self.test.suite.requests.push(log);
                        return reject(err);
                    }

                    log.response = {
                        headers: {...response.headers},
                        statusCode: response.statusCode,
                        body: body,
                        timings: {...response.timingPhases }
                    };

                    self.test.suite.requests.push(log);

                    let justAPIResponse = new JustAPIResponse(this, err, response, body);
                    return resolve(justAPIResponse);
                });
            });

            return response;
        } catch (error) {
            throw error;
        }

    }

}