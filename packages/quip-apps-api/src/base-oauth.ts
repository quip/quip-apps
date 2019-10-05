// Copyright 2019 Quip

import Auth from "./auth";
import Client from "./client";

export default class BaseOAuth extends Auth {
    public tokenResponseValue: {
        [key: string]: string;
    } = {};
    public nextHttpResponseValue: HttpResponse = new HttpResponse();

    getTokenResponse() {
        return this.tokenResponseValue;
    }
    getTokenResponseParam(param: string): string {
        return this.tokenResponseValue[param];
    }
    isLoggedIn() {
        return !!this.getTokenResponseParam("access_token");
    }
    login(params: Object) {
        return Promise.resolve();
    }
    logout(): Promise<HttpResponse> {
        return Promise.resolve(new HttpResponse());
    }
    request(params: Object): Promise<HttpResponse> {
        return Promise.resolve(this.nextHttpResponseValue);
    }
}

export class HttpResponse {
    public url: string;
    public status: number;
    public statusText: string;
    public headers?: {[key: string]: string};
    private body_: string;
    public ok: boolean;
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
        this.status = options.status || 200;
        this.statusText = options.statusText || "OK";
        this.headers = options.headers;
        this.body_ = options.body || "";
        this.ok = this.status >= 200 && this.status < 300;
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
            headers: this.headers,
        });
    }
}
