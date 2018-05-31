// Copyright 2017 Quip

import "whatwg-fetch";
import {
    DefaultError,
    TimeoutError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalServerError,
    ServiceUnavailableError,
    TypeNotSupportedError,
} from "../../shared/base-field-builder/error.js";

const OBJECT_INFO_ENDPOINT = "ui-api/object-info";

const RECORDS_ENDPOINT = "ui-api/records";
const RECORDS_BATCH_ENDPOINT = "ui-api/records/batch";
const RECORDS_SINGLE_ENDPOINT = "ui-api/records";

const SOQL_ENDPOINT = "query";

const API_VERSION = "services/data/v42.0";

// Access toke for local development
const ACCESS_TOKEN = "";

const TIMEOUT = 15000;

export class SalesforceClient {
    constructor(auth) {
        if (auth) {
            this.auth_ = auth;
            this.instanceUrl_ = undefined;
            if (auth.getTokenResponseParam("instance_url")) {
                this.instanceUrl_ = auth
                    .getTokenResponseParam("instance_url")
                    .toLowerCase();
            }
        } else {
            this.instanceUrl_ = "http://localhost:8080";
        }
        this.apiUrl_ = `${this.instanceUrl_}/${API_VERSION}`;
    }

    setAPIEndpoints_() {
        this.instanceUrl_ = this.auth_
            .getTokenResponseParam("instance_url")
            .toLowerCase();
        this.apiUrl_ = `${this.instanceUrl_}/${API_VERSION}`;
    }

    logout() {
        return this.auth_.logout();
    }

    getInstanceUrl() {
        return this.instanceUrl_;
    }

    getHostname() {
        if (this.instanceUrl_.includes("://")) {
            const segs = this.instanceUrl_.split("://");
            return segs[1];
        }
        return this.instanceUrl_;
    }

    salesforceUrl(instanceUrl, recordId) {
        if (!instanceUrl) {
            instanceUrl = this.instanceUrl_;
        }
        return `${instanceUrl}/${recordId}`;
    }

    isLoggedIn() {
        return this.auth_ && this.auth_.isLoggedIn();
    }

    onSourceInstance() {
        return (
            !quip.apps.getRootEntity().getInstanceUrl() ||
            quip.apps.getRootEntity().getInstanceUrl() === this.getInstanceUrl()
        );
    }

    ensureLoggedIn() {
        if (this.isLoggedIn()) {
            return Promise.resolve();
        }
        return this.login_();
    }

    login_() {
        return (
            this.auth_
                // Let caller catch if login() fails
                .login({
                    prompt: "login",
                })
                .then(result => {
                    if (!result) {
                        console.warn("Salesforce login failed to complete.");
                        return Promise.reject();
                    }
                    this.setAPIEndpoints_();
                    if (!this.onSourceInstance()) {
                        return Promise.reject(new MismatchedInstanceError());
                    }
                })
        );
    }

    fetchListViews(recordType, fetchType = "recent") {
        if (fetchType) {
            let query;
            switch (fetchType) {
                case "recent":
                    query =
                        `SELECT name,id,developerName FROM ListView where sobjecttype` +
                        `=\'${recordType}\' AND LastViewedDate != NULL ORDER BY ` +
                        `LastViewedDate DESC limit 10`;
                    break;
                case "all":
                    query =
                        `SELECT name,id,developerName FROM ListView where sobjecttype` +
                        `=\'${recordType}\'`;
                    break;
                default:
                    break;
            }
            if (query) {
                return this.fetchSoqlQuery(query);
            }
        }
        return Promise.reject(
            new TypeNotSupportedError(
                "The fetchType is not supported",
                null,
                fetchType));
    }

    fetchApiLink(link) {
        const url = `${this.instanceUrl_}/${API_VERSION}/${link}`;
        return this.request("GET", url);
    }

    fetchPicklistOptions(recordType, recordTypeId, fieldName) {
        const url = `${
            this.apiUrl_
        }/${OBJECT_INFO_ENDPOINT}/${recordType}/picklist-values/${recordTypeId}/${fieldName}`;
        return this.request("GET", url);
    }

    fetchSoqlQuery(query) {
        const params = {q: query};
        const soqlUrl = `${this.apiUrl_}/${SOQL_ENDPOINT}/`;
        return this.request("GET", soqlUrl, params);
    }

    fetchObjectInfo(recordType) {
        const objectInfoUrl = `${
            this.apiUrl_
        }/${OBJECT_INFO_ENDPOINT}/${recordType}`;
        return this.request("GET", objectInfoUrl);
    }

    fetchRecord(recordId) {
        const params = {layoutTypes: "Full"};
        const recordsUrl = `${
            this.apiUrl_
        }/${RECORDS_SINGLE_ENDPOINT}/${recordId}`;
        return this.request("GET", recordsUrl, params);
    }

    fetchRecords(recordIds) {
        const params = {layoutTypes: "Full"};
        const recordsUrl = `${
            this.apiUrl_
        }/${RECORDS_BATCH_ENDPOINT}/${recordIds.join(",")}`;
        return this.request("GET", recordsUrl, params);
    }

    fetchRelatedLists(recordType) {
        const url = `${this.apiUrl_}/sobjects/${recordType}/describe/layouts`;
        return this.request("GET", url);
    }

    toQueryString(params) {
        return Object.keys(params)
            .map(
                key =>
                    encodeURIComponent(key) +
                    "=" +
                    encodeURIComponent(params[key]))
            .join("&");
    }

    updateRecord(recordId, body = {}) {
        const url = `${this.apiUrl_}/${RECORDS_ENDPOINT}/${recordId}`;
        return this.request("PATCH", url, body);
    }

    request(fetchMethod, baseUrl, data = {}, tryRefreshToken = true) {
        const method = fetchMethod.trim().toUpperCase();
        let url = baseUrl;
        let body;
        if (method === "GET" || method === "HEAD") {
            const queryString = this.toQueryString(data);
            url = queryString ? baseUrl + "?" + queryString : baseUrl;
        } else {
            body = data;
        }

        const timeout = new Promise((resolve, reject) => {
            window.setTimeout(
                reject,
                TIMEOUT,
                new TimeoutError("Request timed out"));
        });

        let fetcher;
        if (!this.auth_) {
            fetcher = fetch(url, {
                method: method,
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${ACCESS_TOKEN}`,
                },
                body: JSON.stringify(body),
            }).then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            });
        } else {
            if (!this.isLoggedIn()) {
                return Promise.reject(new UnauthorizedError());
            }
            fetcher = new Promise((resolve, reject) => {
                this.auth_.request(
                    {
                        url: url,
                        data: body,
                        method: method,
                    },
                    resolve);
            }).then(response => {
                if (response.status == 401 && tryRefreshToken) {
                    // refetch the endpoint after refresh
                    return this.refreshToken_().then(response =>
                        this.request(fetchMethod, baseUrl, data, false)
                    );
                }
                if (response.status >= 400) {
                    const error = this.getErrorFromStatus_(response.status);
                    return Promise.reject(error);
                }
                return response.json();
            });
        }
        return Promise.race([timeout, fetcher]);
    }

    refreshToken_() {
        return this.auth_.refreshToken().then(response => {
            if (response && response.status >= 400) {
                return Promise.reject(
                    this.getErrorFromStatus_(response.status));
            }
            return response;
        });
    }

    getErrorFromStatus_(status) {
        let error;
        switch (status) {
            case 400:
                error = new BadRequestError();
                break;
            case 401:
                error = new UnauthorizedError();
                break;
            case 403:
                error = new ForbiddenError();
                break;
            case 404:
                error = new NotFoundError();
                break;
            case 500:
                error = new InternalServerError();
                break;
            case 503:
                error = new ServiceUnavailableError();
                break;
            default:
                error = new DefaultError(status);
                break;
        }
        return error;
    }
}

export class MismatchedInstanceError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, MismatchedInstanceError.prototype);
    }
}
