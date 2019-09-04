// Copyright 2019 Quip

const Auth = require("./auth");

class BaseOAuth extends Auth {
    constructor(...args) {
        super(...args);
        this.values.tokenResponse = {};
        this.values.nextHttpResponse = new HttpResponse();
    }
    getTokenResponse() {
        return this.values.tokenResponse;
    }
    getTokenResponseParam(param) {
        return this.values.tokenResponse[param];
    }
    isLoggedIn() {
        return !!this.getTokenResponseParam("access_token");
    }
    login() {}
    logout() {}
    request(params) {
        return Promise.resolve(this.values.nextHttpResponse);
    }
}

module.exports = BaseOAuth;

class HttpResponse {
    constructor(
        options = {
            url: undefined,
            body: undefined,
            status: undefined,
            statusText: undefined,
            headers: undefined,
        }
    ) {
        this.url = options.url || "";
        this.status = options.status === undefined ? 200 : options.status;
        this.statusText = options.statusText || "OK";
        this.headers =
            options.headers instanceof HttpHeaders
                ? options.headers
                : new HttpHeaders(options.headers);
        this.body_ = options.body || "";
        this.ok = this.ok = this.status >= 200 && this.status < 300;
    }
    text() {
        return this.body_;
    }
    json() {
        return JSON.parse(this.body_);
    }

    toJSON() {
        return JSON.stringify({
            url: this.url,
            body: this.body_,
            status: this.status,
            statusText: this.statusText,
            headers: this.headers.map_,
        });
    }
}
