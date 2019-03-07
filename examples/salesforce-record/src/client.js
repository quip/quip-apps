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
import {
    parseFieldsData,
    parseListViews,
    parseLayout,
    parsePicklistOptions,
    parseSchema,
    parseSoqlRecords,
} from "../../shared/base-field-builder/response-handler.js";
import {
    fieldSupportedFn,
    nameFieldSupportedFn,
} from "model/salesforce-record.js";

const OBJECT_INFO_ENDPOINT = "ui-api/object-info";

const RECORDS_ENDPOINT = "ui-api/records";

const RECORD_UI_ENDPOINT = "ui-api/record-ui";

const LAYOUT_ENDPOINT = "ui-api/layout";

const APPS_ENDPOINT = "ui-api/apps";

const SOQL_ENDPOINT = "query";

const API_VERSION = "services/data/v43.0";

// Access token for local development
const ACCESS_TOKEN = "";

const TIMEOUT = 15000;

const MAX_CACHE_ITEMS = 64;

// Short TTL which is mainly important to debounce multiple requests to the same
// resource which result from the one logical UI event.
const CACHE_TTL = 2000;

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
        this.cache_ = new SimpleCache();
        this.inFlightGets_ = {};
    }

    // A new user has logged in via this client
    initForUser() {
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
                    this.initForUser();
                    if (!this.onSourceInstance()) {
                        return Promise.reject(new MismatchedInstanceError());
                    }
                })
        );
    }

    fetchListViews(recordType) {
        const query =
            `SELECT name,id,developerName FROM ListView where sobjecttype` +
            `=\'${recordType}\' AND LastViewedDate != NULL ORDER BY ` +
            `LastViewedDate DESC limit 10`;
        return this.fetchSoqlQuery(query).then(response =>
            parseListViews(response, recordType)
        );
    }

    fetchListViewsForType(recordType) {
        return this.fetchSchema(recordType).then(schema => {
            const recordDisplayName = schema.labelPlural;
            const all = {
                label: `All ${recordDisplayName}`,
                key: "All",
                id: "All",
            };
            const recentlyViewed = {
                label: `Recently Viewed ${recordDisplayName}`,
                key: "RecentlyViewed",
                id: "RecentlyViewed",
            };

            const listViews = [all];
            if (schema.hasLastViewedDate) {
                listViews.push(recentlyViewed);
            }

            return this.fetchListViews(recordType).then(views => {
                views.forEach(view => {
                    if (view.label === all.label ||
                        (schema.hasLastViewedDate &&
                            view.label === recentlyViewed.label)) {
                        return;
                    }

                    listViews.push(view);
                });

                return listViews;
            });
        });
    }

    fetchApiLink(link) {
        const url = `${this.instanceUrl_}/${API_VERSION}/${link}`;
        return this.request_("GET", url);
    }

    fetchPicklistOptions(recordType, recordTypeId, fieldName) {
        const url = `${
            this.apiUrl_
        }/${OBJECT_INFO_ENDPOINT}/${recordType}/picklist-values/${recordTypeId}/${fieldName}`;
        return this.request_("GET", url).then(parsePicklistOptions);
    }

    fetchSoqlQuery(query) {
        const params = {q: query};
        const soqlUrl = `${this.apiUrl_}/${SOQL_ENDPOINT}/`;
        return this.request_("GET", soqlUrl, params);
    }

    fetchSelectedAppEntityTypes() {
        // The response will contain navItems for ONLY the "selected" (MRU) app.
        const appsUrl = `${this.apiUrl_}/${APPS_ENDPOINT}`;
        const data = {userCustomizations: true, formFactor: "Large"};
        return this.request_("GET", appsUrl, data).then(response => {
            const entities = {};
            response.apps.forEach(app =>
                app.navItems
                    .filter(item => item.itemType === "Entity")
                    .forEach(item => (entities[item.objectApiName] = true))
            );
            return Object.keys(entities);
        });
    }

    fetchObjectTypes() {
        const objectInfoUrl = `${this.apiUrl_}/${OBJECT_INFO_ENDPOINT}`;
        return this.request_("GET", objectInfoUrl).then(response =>
            Object.values(response.objects)
        );
    }

    fetchSchema(recordType) {
        const objectInfoUrl = `${
            this.apiUrl_
        }/${OBJECT_INFO_ENDPOINT}/${recordType}`;

        return Promise.all([
            this.request_("GET", objectInfoUrl),
            this.fetchLayoutFields(recordType, true /* Full */),
        ]).then(([response, layoutFields]) =>
            parseSchema(
                response,
                layoutFields,
                fieldSupportedFn,
                nameFieldSupportedFn)
        );
    }

    fetchLayoutFields(recordType, full = true) {
        const layoutUrl = `${this.apiUrl_}/${LAYOUT_ENDPOINT}/${recordType}`;
        const data = {layoutType: full ? "Full" : "Compact"};
        return this.request_("GET", layoutUrl, data)
            .then(parseLayout)
            .catch(e => {
                if (e.message.indexOf("Layout Information") >= 0) {
                    // Slighly more friendly message.
                    throw new TypeNotSupportedError(
                        `In order for the ${recordType} object to be used, it ` +
                            `must have a "Full" layout defined.`);
                }

                throw e;
            });
    }

    fetchRecordDataForListView(
        recordType,
        listViewId,
        searchTerm,
        searchField) {
        return this.fetchDescribeQuery_(
            recordType,
            listViewId,
            searchField).then(query =>
            this.fetchRecordsDataByQuery_(
                query,
                recordType,
                searchTerm,
                searchField)
        );
    }

    fetchDescribeQuery_(recordType, listViewId, searchField) {
        if (listViewId === "All") {
            const query = `SELECT ${searchField}, Id FROM ${recordType}`;
            return Promise.resolve(query);
        } else if (listViewId === "RecentlyViewed") {
            const query =
                `SELECT ${searchField}, Id FROM ${recordType}` +
                ` WHERE LastViewedDate != NULL ORDER BY LastViewedDate DESC`;
            return Promise.resolve(query);
        }

        const describeUrl = `sobjects/${recordType}/listviews/${listViewId}/describe`;
        return this.fetchApiLink(describeUrl).then(response => response.query);
    }

    fetchRecordsDataByQuery_(query, recordType, searchTerm, searchField) {
        if (searchTerm) {
            query = this.reformatQuery_(
                query,
                recordType,
                searchTerm,
                searchField);
        }
        // FIXME
        query = query + " LIMIT 200";
        return this.fetchSoqlQuery(query).then(response =>
            parseSoqlRecords(response, searchField)
        );
    }

    reformatQuery_(query, recordType, searchTerm, searchField) {
        if (!query) return;
        query = query.toLowerCase();

        if (query.includes("order by")) {
            const seg = query.split("order by");
            if (seg[0].includes("where")) {
                seg[0] += ` AND ${searchField} LIKE \'%${searchTerm}%\' `;
            } else {
                seg[0] += ` Where ${searchField} LIKE \'%${searchTerm}%\' `;
            }
            return seg[0] + "order by" + seg[1];
        }

        if (query.includes("where")) {
            query += ` AND ${searchField} LIKE \'%${searchTerm}%\' `;
        } else {
            query += ` Where ${searchField} LIKE \'%${searchTerm}%\' `;
        }
        return query;
    }

    fetchRecordAndSchema(recordId, optExistingSchema) {
        const recordUiUrl = `${this.apiUrl_}/${RECORD_UI_ENDPOINT}/${recordId}`;
        const data = {layoutTypes: "Full"};

        let requestedOptionalFields = [];
        if (optExistingSchema &&
            optExistingSchema.extraFields &&
            optExistingSchema.extraFields.length > 0) {
            requestedOptionalFields = optExistingSchema.extraFields;
            data.optionalFields = requestedOptionalFields
                .map(f => optExistingSchema.apiName + "." + f)
                .join(",");
        }

        return this.request_("GET", recordUiUrl, data).then(response => {
            const record = response.records[recordId];
            const objectInfo = response.objectInfos[record.apiName];
            let fullLayout;
            for (let layoutId in response.layouts[record.apiName]) {
                fullLayout =
                    response.layouts[record.apiName][layoutId]["Full"]["View"];
                break;
            }
            const schema = parseSchema(
                objectInfo,
                parseLayout(fullLayout),
                fieldSupportedFn,
                nameFieldSupportedFn);

            if (schema.extraFields &&
                !schema.extraFields.every(f =>
                    requestedOptionalFields.includes(f)
                )) {
                // This is subtle. In general, we fetch the schema every time we
                // fetch the object because it might have changed. The endpoint
                // we use returns us the fields defined in the "Full" layout,
                // but that may NOT contain some fields defined as "name" fields
                // on the "objectInfo". Thus we have a bit of a cycle. IOW, its
                // possible that we have to fetch the object twice: (1) to
                // discover that there are name fields not included in the
                // "Full" layout, and (2) to fetch again with those fields
                // provided as optional. We expect this to happern rarely, so we
                // optimistically assume it won't happen (first call), but
                // tolerate the case that it does (second call). Note that we
                // *should* not recurse infinitely -- because the second call
                // should return the same schema as the first and the check
                // above will only be true if it has changed.
                return this.fetchRecordAndSchema(recordId, schema);
            }

            return [parseFieldsData(record, schema), schema];
        });
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

    updateRecord(recordId, optExistingSchema, body = {}) {
         
        // header).
        // The response to this call won't include fields typically fetched as
        // optional, so we need to follow up immediately with a call to
        // RECORDS_UI_ENDPOINT.
        const url = `${this.apiUrl_}/${RECORDS_ENDPOINT}/${recordId}`;
        return this.request_("PATCH", url, body).then(response =>
            this.fetchRecordAndSchema(recordId, optExistingSchema)
        );
    }

    request_(fetchMethod, baseUrl, data = {}, tryRefreshToken = true) {
        const method = fetchMethod.trim().toUpperCase();
        let url = baseUrl;
        let body;

        if (method === "GET" || method === "HEAD") {
            const queryString = this.toQueryString(data);
            url = queryString ? baseUrl + "?" + queryString : baseUrl;
        } else {
            body = data;
        }

        // Debounce concurrent GET requests to the same resource. Ensure that
        // each caller gets a *copy* of the reponse JSON (on success);
        if (method === "GET" && this.inFlightGets_[url]) {
            return this.inFlightGets_[url].then(response =>
                response.json ? response.json() : response
            );
        }

        const result = this.doRequest_(
            method,
            url,
            body,
            tryRefreshToken).finally(() => {
            delete this.inFlightGets_[url];
        });

        if (method === "GET") {
            this.inFlightGets_[url] = result;
        }

        return result.then(response =>
            response.json ? response.json() : response
        );
    }

    doRequest_(method, url, body, tryRefreshToken) {
        if (method !== "GET") {
            // Drop the cache whenever we may cause side-effects.
            this.cache_ = new SimpleCache();
        }

        if (method === "GET") {
            const cachedResponse = this.cache_.get(url);
            if (cachedResponse && cachedResponse.ttl > Date.now()) {
                // If a GET is within a short TLL for a resouce which returned
                // an ETAG, bypass the fetch.
                return Promise.resolve(cachedResponse.json());
            }
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
                return response;
            });
        } else {
            if (!this.isLoggedIn()) {
                return Promise.reject(new UnauthorizedError());
            }

            const requestObject = {
                url: url,
                data: body,
                method: method,
            };

            fetcher = new Promise((resolve, reject) => {
                 
                // update ETAGs after writes to objects. When/if this is fixed,
                // send the etag in a "If-None-Match" request header and
                // look for a 304.
                this.auth_.request(requestObject, resolve);
            }).then(response => {
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
                    response.ttl = Date.now() + CACHE_TTL;
                    this.cache_.set(url, response);
                }

                return response;
            });
        }

        return Promise.race([timeout, fetcher]);
    }

    refreshToken_() {
        return this.auth_.refreshToken().then(response => {
            if (response && response.status >= 400) {
                return Promise.reject(this.getError_(response));
            }
            return response;
        });
    }

    getEnhancedError_(body) {
        return (
            body.enhancedErrorType === "RecordError" &&
            body.output &&
            Array.isArray(body.output.errors) &&
            body.output.errors.length &&
            body.output.errors[0].message
        );
    }

    getErrorMessage_(body) {
        if (body) {
            if (body.message) {
                return this.getEnhancedError_(body) || body.message;
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

    getError_(response) {
        const status = response.status;
        const errorMessage = this.getErrorMessage_(response.json());

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
                error = new DefaultError(errorMessage ? errorMessage : status);
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

class SimpleCache {
    constructor() {
        this.count = 0;
        this.items = Object.create(null);
    }

    get(key) {
        return this.items[key];
    }

    set(key, value) {
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
    }
}
