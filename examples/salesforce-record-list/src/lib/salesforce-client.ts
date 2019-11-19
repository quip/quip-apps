// Copyright 2019 Quip

import "whatwg-fetch";
import quip from "quip-apps-api";
import {HttpResponse} from "quip-apps-api";
import {
    DefaultError,
    TimeoutError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalServerError,
    ServiceUnavailableError,
} from "../../shared/base-field-builder/error";
import recordMetric from "./metrics";

// Need nav-items, which only exists in v45+. Use latest for less surprises.
const API_VERSION = "services/data/v46.0";

const MAX_CACHE_ITEMS = 64;

const DEFAULT_HEADERS = {"X-Chatter-Entity-Encoding": "false"};

// Short TTL which is mainly important to debounce multiple requests to the same
// resource which result from the one logical UI event.
const CACHE_TTL = 2000;

export class SalesforceClient {
    static ID = "salesforceClient";
    static DATA_VERSION = 1;

    private cache_ = new SimpleCache<HttpResponse>();
    private inFlightGets_: Map<string, Promise<HttpResponse>> = new Map();
    private responseCache_: Map<string, Promise<HttpResponse>> = new Map();
    private auth_: quip.apps.OAuth2;
    private instanceUrl_?: string = "http://localhost:8080";

    setAuth(auth: quip.apps.OAuth2) {
        if (auth) {
            this.auth_ = auth;
            this.instanceUrl_ = undefined;
            if (auth.getTokenResponseParam("instance_url")) {
                this.instanceUrl_ = auth
                    .getTokenResponseParam("instance_url")
                    .toLowerCase();
            }
        }
    }

    // A new user has logged in via this client
    initForUser() {
        this.instanceUrl_ = this.auth_
            .getTokenResponseParam("instance_url")
            .toLowerCase();
    }

    logout() {
        const success = this.auth_.logout();
        if (success) {
            recordMetric("logged_out");
        }
        return success;
    }

    getInstanceUrl() {
        return this.instanceUrl_;
    }

    getCurrentUserId() {
        return quip.apps.getViewingUser().getId();
    }

    isLoggedIn() {
        return this.auth_ && this.auth_.isLoggedIn();
    }

    async getResponseProperties<T>(
        endpoint: string,
        query?: {[key: string]: string | number | boolean}
    ) {
        await this.ensureLoggedIn();
        const data = await this.request_<T>("GET", endpoint, query);
        return {
            ownerId: this.getCurrentUserId(),
            instanceUrl: this.getInstanceUrl(),
            lastFetchedTime: Date.now(),
            endpoint,
            query,
            data,
        };
    }

    async doGet<T>(
        endpoint: string,
        query?: {[key: string]: string | number | boolean}
    ) {
        await this.ensureLoggedIn();
        return this.request_<T>("GET", endpoint, query);
    }

    async doPatch<T>(endpoint: string, data: Object) {
        await this.ensureLoggedIn();
        return this.request_<T>("PATCH", endpoint, data);
    }

    login() {
        return this.ensureLoggedIn();
    }

    ensureLoggedIn() {
        if (this.isLoggedIn()) {
            return Promise.resolve();
        }
        return this.login_();
    }

    async login_() {
        let result: boolean;
        let errorMessage: string;
        try {
            result = await this.auth_.login({
                prompt: "login",
            });
        } catch (error) {
            console.error("auth.login returned error: ", error);
            recordMetric("error", {
                "error_type": "login",
                "message": error.error_message,
            });
            errorMessage = error.error_message;
        }
        if (!result) {
            const userMessage =
                "Salesforce login failed to complete" +
                (errorMessage ? `: ${errorMessage}` : ".");
            console.warn(userMessage);
            return Promise.reject(userMessage);
        }
        this.initForUser();
        recordMetric("logged_in");
    }

    toQueryString(params: {[key: string]: string | number | boolean}): string {
        return Object.keys(params)
            .sort()
            .filter(key => params[key] !== undefined)
            .map(
                key =>
                    encodeURIComponent(key) +
                    "=" +
                    encodeURIComponent(params[key]))
            .join("&");
    }

    request_<T>(
        fetchMethod: string,
        endpoint: string,
        data: Object = {},
        tryRefreshToken: boolean = true
    ): Promise<T> {
        const method = fetchMethod.trim().toUpperCase();
        const baseUrl = `${this.getInstanceUrl()}/${API_VERSION}/${endpoint}`;
        let url = baseUrl;
        let body;

        if (method === "GET" || method === "HEAD") {
            const queryString = this.toQueryString(data as {
                [key: string]: string | number | boolean;
            });
            url = queryString ? baseUrl + "?" + queryString : baseUrl;
        } else {
            body = data;
        }

        // Debounce concurrent GET requests to the same resource. Ensure that
        // each caller gets a *copy* of the reponse JSON (on success);
        if (method === "GET" && this.inFlightGets_.has(url)) {
            return this.inFlightGets_
                .get(url)
                .then(response => response.json() as T);
        }

        const request = this.doRequest_<T>(
            method,
            url,
            body,
            tryRefreshToken).finally(() => {
            this.inFlightGets_.delete(url);
        });

        if (method === "GET") {
            this.inFlightGets_.set(url, request);
        }

        return request.then(response => response.json());
    }

    doRequest_<T>(
        method: string,
        url: string,
        body: Object,
        tryRefreshToken: boolean
    ): Promise<HttpResponse<T>> {
        if (method !== "GET") {
            // Drop the cache whenever we may cause side-effects.
            this.cache_ = new SimpleCache();
        }

        if (method === "GET") {
            const {value: cachedResponse, ttl} = this.cache_.get(url);
            if (cachedResponse && ttl > Date.now()) {
                // If a GET is within a short TLL for a resouce which returned
                // an ETAG, bypass the fetch.
                return Promise.resolve(cachedResponse as HttpResponse<T>);
            }
        }

        if (!this.isLoggedIn()) {
            return Promise.reject(new UnauthorizedError());
        }

        const requestObject = {
            url: url,
            data: body,
            method: method,
            headers: DEFAULT_HEADERS,
        };

         
        // update ETAGs after writes to objects. When/if this is fixed,
        // send the etag in a "If-None-Match" request header and
        // look for a 304.
        const fetcher: Promise<HttpResponse<T>> = this.auth_
            .request<T>(requestObject)
            .then(response => {
                if (response.status == 401 && tryRefreshToken) {
                    // refetch the endpoint after refresh
                    return this.refreshToken_().then(response =>
                        this.doRequest_(method, url, body, false)
                    );
                }
                if (response.status >= 400) {
                    const error = this.getError_(response);
                    return Promise.reject(error);
                }

                if (method === "GET" &&
                    response.status === 200 &&
                    response.headers.get("etag")) {
                    this.cache_.set(url, response, Date.now() + CACHE_TTL);
                }

                return response;
            });

        return fetcher;
    }

    refreshToken_() {
        return this.auth_.refreshToken().then(response => {
            if (response && response.status >= 400) {
                return Promise.reject(this.getError_(response));
            }
            return response;
        });
    }

    getEnhancedError_(body: Object) {
        const expectedType = body as {
            enhancedErrorType?: string;
            output?: {errors?: {message: string}[]};
        };
        return (
            expectedType.enhancedErrorType === "RecordError" &&
            expectedType.output &&
            Array.isArray(expectedType.output.errors) &&
            expectedType.output.errors.length &&
            expectedType.output.errors[0].message
        );
    }

    getErrorMessage_(body: Object) {
        if (body) {
            const hasMessage = !!(body as {message: string}).message;
            if (hasMessage) {
                return (
                    this.getEnhancedError_(body) ||
                    (body as {message: string}).message
                );
            }
            if (Array.isArray(body)) {
                const messageObj = body.find(e => e.message);
                if (messageObj) {
                    return messageObj.message;
                }
            }
        }
        return undefined;
    }

    getError_(response: HttpResponse) {
        const status = response.status;
        let errorMessage = "Invalid Response";
        try {
            errorMessage = this.getErrorMessage_(response.json());
        } catch (parseError) {
            console.error("Invalid response:", response);
        }
        let error;
        switch (status) {
            case 400:
                error = new BadRequestError(errorMessage);
                break;
            case 401:
                error = new UnauthorizedError(errorMessage);
                break;
            case 403:
                error = new ForbiddenError(errorMessage);
                break;
            case 404:
                error = new NotFoundError(errorMessage);
                break;
            case 500:
                error = new InternalServerError(errorMessage);
                break;
            case 503:
                error = new ServiceUnavailableError(errorMessage);
                break;
            default:
                error = new DefaultError(
                    errorMessage ? errorMessage : String(status));
                break;
        }
        return error;
    }
}

class SimpleCache<T> {
    private count = 0;
    private items: {[key: string]: T} = Object.create(null);
    private ttls: Map<string, number> = new Map();

    get(key: string) {
        return {value: this.items[key], ttl: this.ttls.get(key)};
    }

    set(key: string, value: T, ttl: number = 0) {
        // ES objects iterate in insertion order.
        if (key in this.items) {
            // On "update", we must delete so that insertion (below) will make
            // this key MRU.
            delete this.items[key];
        } else {
            if (this.count == MAX_CACHE_ITEMS) {
                // If we need room, the first iterated item will be the LRU.
                for (key in this.items) {
                    delete this.items[key];
                    this.count -= 1;
                    break;
                }
            }

            this.count += 1;
        }

        this.items[key] = value;
        this.ttls.set(key, ttl);
    }
}
