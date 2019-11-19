// Copyright 2019 Quip

import quip from "quip-apps-api";
import SalesforceResponse from "./salesforce-response";
import {
    listTypeListData,
    getLastPageToken,
} from "../lib/salesforce-responses";
import {
    SalesforceListViewSummary,
    SalesforceListViewSummaryCollection,
} from "../lib/salesforce-types";

export interface ListsResponseData {
    hasMore: boolean;
    lastPageToken?: string;
    lists: SalesforceListViewSummary[];
}

export class ListsResponse extends quip.apps.Record {
    static ID = "listsResponse";
    static DATA_VERSION = 1;

    static getProperties() {
        return {
            responses: quip.apps.RecordList.Type(SalesforceResponse),
        };
    }

    static getDefaultProperties(): {[key: string]: any} {
        return {
            dataVersion: ListsResponse.DATA_VERSION,
            responses: [],
        };
    }

    getResponses(): quip.apps.RecordList<
        SalesforceResponse<SalesforceListViewSummaryCollection>
    > {
        return this.get("responses");
    }

    resetWithListProps(responseProps: SalesforceListViewSummaryCollection) {
        this.clearResponses();
        this.addListProps(responseProps);
    }

    addListProps(responseProps: SalesforceListViewSummaryCollection) {
        return this.get("responses").add(responseProps);
    }

    clearResponses() {
        this.clear("responses");
        this.set("responses", []);
    }

    getData(): ListsResponseData {
        const responses = this.get("responses").getRecords();
        const lastPageToken = getLastPageToken(responses);
        const lists = responses.map(listTypeListData);
        const hasMore = lastPageToken !== null;
        return {
            hasMore,
            lastPageToken: hasMore ? lastPageToken : undefined,
            lists: [].concat(...lists),
        };
    }
}
