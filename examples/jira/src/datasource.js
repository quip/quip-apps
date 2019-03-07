// Copyright 2017 Quip

import {BaseDatasource} from "../../shared/base-field-builder/base-datasource.js";
import {
    DefaultError,
    TimeoutError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalServerError,
    ServiceUnavailableError,
    GatewayTimeoutError,
    UnauthenticatedError,
} from "../../shared/base-field-builder/error.js";

export const MAX_RECORDS_LIST = 120;
export const MAX_RECORDS_SEARCH = 30;

// We use the JIRA Cloud API.
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/?utm_source=%2Fcloud%2Fjira%2Fplatform%2Frest%2F&utm_medium=302
const API_PATH = "rest/api/2";
const AGILE_PATH = "rest/agile/1.0";
const GREENHOPPER_PATH = "rest/greenhopper/1.0";

export class JiraDatasource extends BaseDatasource {
    constructor(auth) {
        super();
        this.auth_ = auth;
    }

    fetchBase(method, url, data = {}) {
        if (!this.isLoggedIn()) {
            return Promise.reject(new UnauthenticatedError());
        }
        let body;
        if (method === "GET" || method === "HEAD") {
            const queryString = this.toQueryString(data);
            url = queryString ? url + "?" + queryString : url;
        } else {
            body = data;
        }
        return this.auth_
            .request({url: url, data: body, method: method})
            .then(response => {
                if (response.status >= 400) {
                    let error;
                    switch (response.status) {
                        case 400:
                            let message = "";
                            const json = response.json();
                            if (json && json.errors) {
                                message =
                                    json.errors[Object.keys(json.errors)[0]];
                            }
                            error = new BadRequestError(message);
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
                        case 504:
                            error = new GatewayTimeoutError();
                            break;
                        default:
                            error = new DefaultError(response.statusText);
                            break;
                    }
                    throw error;
                } else {
                    if (response.status === 204) {
                        // Signals no content so there's no body to parse.
                        return {};
                    } else if (response.text() === "") {
                        return {};
                    } else {
                        return response.json();
                    }
                }
            })
            .catch(error => {
                if (error instanceof UnauthorizedError && this.isLoggedIn()) {
                    // This token has expired. Log the user out so they have a
                    // chance to be logged in again.
                    this.auth_.logout();
                } else {
                    throw error;
                }
            });
    }

    isLoggedIn() {
        if (this.auth_) {
            return (
                this.auth_.isLoggedIn() &&
                (this.getInstanceUrl() ===
                    this.auth_.getTokenResponseParam("instance_url") ||
                    this.auth_.getTokenResponseParam("instance_url") ===
                        this.getAlternativeOAuthBaseUrl())
            );
        } else {
            return false;
        }
    }

    onSourceInstance() {
        return !this.getInstanceUrl() || this.isLoggedIn();
    }

    getInstanceUrl() {
        return quip.elements.getRootRecord().getInstanceUrl();
    }

    getAlternativeOAuthBaseUrl() {
        return quip.elements.getRootRecord().getAlternativeOAuthBaseUrl();
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

    getBaseUrl_() {
        return `${this.getInstanceUrl()}/${API_PATH}`;
    }

    getAgileUrl_() {
        return `${this.getInstanceUrl()}/${AGILE_PATH}`;
    }

    getGreenhopperUrl_() {
        return `${this.getInstanceUrl()}/${GREENHOPPER_PATH}`;
    }

    fetchRecord(recordId, options) {
        const url = `${this.getBaseUrl_()}/issue/${recordId}`;
        return this.fetchBase("GET", url, options);
    }

    summaryRecord(recordId) {
        return this.fetchRecord(recordId, {fields: ["id", "summary"]});
    }

    clearEpicLink(recordId) {
        const url = `${this.getAgileUrl_()}/epic/none/issue`;
        return this.fetchBase("POST", url, {issues: [recordId]});
    }

    clearSprint(recordId) {
        const url = `${this.getAgileUrl_()}/backlog/issue`;
        return this.fetchBase("POST", url, {issues: [recordId]});
    }

    linkIssues(issueLink) {
        const url = `${this.getBaseUrl_()}/issueLink`;
        const body = issueLink;
        return this.fetchBase("POST", url, body);
    }

    deleteLink(issueLink) {
        const url = `${this.getBaseUrl_()}/issueLink/${issueLink}`;
        return this.fetchBase("DELETE", url);
    }

    transitionRecord(recordId, value) {
        const url = `${this.getBaseUrl_()}/issue/${recordId}/transitions`;
        const body = {transition: value};
        return this.fetchBase("POST", url, body);
    }

    updateRecord(recordId, fields) {
        const url = `${this.getBaseUrl_()}/issue/${recordId}`;
        const body = {fields: {}};
        for (const key in fields) {
            body.fields[key] = fields[key];
        }
        return this.fetchBase("PUT", url, body);
    }

    searchRecordsWithFilter(filter) {
        const url = filter.searchUrl;
        return this.fetchBase("GET", url);
    }

    searchRecords(options, maxResults) {
        const url = `${this.getBaseUrl_()}/search`;
        options["startAt"] = 0;
        options["maxResults"] = maxResults;
        return this.fetchBase("GET", url, options);
    }

    getIssueUrl(issueId) {
        return `${this.getInstanceUrl()}/browse/${issueId}`;
    }

    getFilterUrl(filterId) {
        return `${this.getInstanceUrl()}/issues/?filter=${filterId}`;
    }

    fetchFilters(server) {
        const url = server
            ? `${this.getBaseUrl_()}/filter/favourite`
            : `${this.getBaseUrl_()}/filter`;
        return this.fetchBase("GET", url);
    }

    fetchFilter(filterId) {
        const url = `${this.getBaseUrl_()}/filter/${filterId}`;
        return this.fetchBase("GET", url);
    }

    isServerInstance() {
        if (this.instanceMap_ && this.instanceMap_.has(this.getInstanceUrl())) {
            return Promise.resolve(this.instanceMap_[this.getInstanceUrl()]);
        }

        const url = `${this.getBaseUrl_()}/serverInfo`;
        return this.fetchBase("GET", url)
            .then(response => {
                const server = response.deploymentType !== "Cloud";
                if (!this.instanceMap_) {
                    this.instanceMap_ = new Map();
                }
                this.instanceMap_.set(this.getInstanceUrl(), server);
                return server;
            })
            .catch(error => {
                console.error(error);
                // Fall back to server because at the moment server API is more
                //conservative.
                return true;
            });
    }

    autocomplete(text, url, key) {
        url = `${url}${text}`;
        return this.fetchBase("GET", url).then(response => {
            let options;
            if (key === "labels") {
                options = response.suggestions.map(item => {
                    return {
                        id: item.label,
                        name: item.label,
                        serverValue: item.label,
                    };
                });
                if (response.token) {
                    var newLabel = quiptext("New Label");
                    options.push({
                        id: response.token,
                        name: response.token,
                        dropdownName: `${response.token} (${newLabel})`,
                        serverValue: response.token,
                    });
                }
            } else if (key.startsWith("issuelinks")) {
                options = response.sections.reduce(
                    (list, section) =>
                        list.concat(
                            section.issues.map(issue => {
                                return {
                                    id: issue.key,
                                    name: issue.key,
                                    serverValue: issue.key,
                                };
                            })),
                    []);
            } else {
                options = response.map(item => {
                    return {
                        id: item.name,
                        name: item.displayName,
                        serverValue: {name: item.name},
                    };
                });
                if (text.length === 0) {
                    options.unshift({
                        id: "unassigned",
                        name: quiptext("Unassigned"),
                        serverValue: {name: ""},
                        useQuery: true,
                    });
                }
            }
            return options;
        });
    }

    fetchEpic(epicId) {
        const url = `${this.getAgileUrl_()}/epic/${epicId}`;
        return this.fetchBase("GET", url);
    }

    fetchEpicLinkOptions(field) {
        const url = `${this.getGreenhopperUrl_()}/epics`;
        return this.fetchBase("GET", url, {maxResults: 100}).then(response =>
            response.epicLists.reduce(
                (total, list) => {
                    const items = list.epicNames.map(epic => {
                        return {
                            id: epic.key,
                            name: epic.name,
                            serverValue: epic.key,
                        };
                    });
                    return total.concat(items);
                },
                [{id: "none", name: quiptext("None"), serverValue: ""}])
        );
    }

    fetchSprintOptions(field) {
        const url = `${this.getGreenhopperUrl_()}/sprint/picker`;
        return this.fetchBase("GET", url).then(response =>
            Object.keys(response).reduce(
                (total, key) => {
                    const items = response[key].map(sprint => {
                        return {
                            id: sprint.id.toString(),
                            name: sprint.name,
                            serverValue: sprint.id,
                        };
                    });
                    return total.concat(items);
                },
                [{id: "none", name: quiptext("None"), serverValue: ""}])
        );
    }

    fetchIssueLinkTypes() {
        const url = `${this.getBaseUrl_()}/issueLinkType`;
        return this.fetchBase("GET", url).then(response =>
            response.issueLinkTypes.map(item => item)
        );
    }
}
