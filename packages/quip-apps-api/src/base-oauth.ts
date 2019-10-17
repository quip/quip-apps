// Copyright 2019 Quip

import Auth from "./auth";

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
    login(params: Object): Promise<boolean> {
        return Promise.resolve(true);
    }
    logout(): Promise<HttpResponse> {
        return Promise.resolve(new HttpResponse());
    }
    request<T = Object>(params: Object): Promise<HttpResponse<T>> {
        return Promise.resolve(this.nextHttpResponseValue as HttpResponse<T>);
    }
}

export class HttpResponse<T = Object> {
    public url: string;
    public status: number;
    public statusText: string;
    public headers: HttpHeaders;
    private body_: string;
    public ok: boolean;
    constructor(
        options: {
            url?: string;
            body?: string;
            status?: number;
            statusText?: string;
            headers?: HttpHeaders | {[name: string]: string};
        } = {
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
        this.headers =
            options.headers instanceof HttpHeaders
                ? options.headers
                : new HttpHeaders(options.headers);
        this.body_ = options.body || "";
        this.ok = this.status >= 200 && this.status < 300;
    }
    text() {
        return this.body_;
    }
    json(): T {
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

export class HttpHeaders {
    private map_ = new Map();
    constructor(headers?: {[name: string]: string}) {
        if (headers) {
            Object.getOwnPropertyNames(headers).forEach(name => {
                this.append_(name, headers[name]);
            });
        }
    }
    append_(name: string, value: string) {
        const oldValue = this.map_.get(name);
        this.map_.set(name, oldValue ? `${oldValue},${value}` : value);
    }
    get(name: string) {
        return this.has(name) ? this.map_.get(name) : null;
    }
    has(name: string) {
        return this.map_.has(name);
    }
}
