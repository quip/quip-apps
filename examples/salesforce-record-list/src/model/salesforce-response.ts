// Copyright 2019 Quip

import quip from "quip-apps-api";

/**
 * @fileoverview This class is used when interacting with salesforce APIs. It is
 * primarily a cache but exposes some useful information like lastFetchedTime
 */

export interface SalesforceResponseProperties<T> {
    [key: string]: any;
    endpoint: string;
    instanceUrl: string;
    data: T;
    lastFetchedTime: number;
    query: {[key: string]: string | number | boolean};
    ownerId: string;
}

export default class SalesforceResponse<T> extends quip.apps.Record {
    static ID = "salesforceResponse";
    static DATA_VERSION = 1;

    static getProperties() {
        return {
            endpoint: "string",
            instanceUrl: "string",
            data: "object",
            lastFetchedTime: "number",
            query: "object",
            ownerId: "string",
        };
    }

    setProperties(properties: SalesforceResponseProperties<T>) {
        for (let prop in properties) {
            this.set(prop, properties[prop]);
        }
    }

    getData(): T {
        return this.get("data");
    }
    getEndpoint(): string {
        return this.get("endpoint");
    }
    getQuery(): {[key: string]: string} {
        return this.get("query");
    }
    getOwnerId(): string {
        return this.get("ownerId");
    }
    getLastFetchedTime(): number {
        return this.get("lastFetchedTime");
    }
    getInstanceUrl(): string {
        return this.get("instanceUrl");
    }
}
