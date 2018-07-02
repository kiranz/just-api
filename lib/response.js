'use strict';

export default class JustAPIResponse {

    constructor(req, err, response, body) {
        this._req = req;
        this._err = err;
        this._response = response;
        this._body = body;

        if (response.timingPhases && response.timingPhases.total) {
            this._response.duration = response.timingPhases.total;
        }
    }

}