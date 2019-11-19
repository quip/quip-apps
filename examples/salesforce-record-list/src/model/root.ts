// Copyright 2019 Quip

import quip from "quip-apps-api";
import _ from "quiptext";
import {
    SalesforceListEntity,
    SalesforceListData,
    SalesforceListProperties,
} from "./salesforce-list";
import placeholderData from "../placeholder-data";
import SalesforceResponse, {
    SalesforceResponseProperties,
} from "./salesforce-response";
import {ListsResponse, ListsResponseData} from "./lists-response";
import {SalesforceClient} from "../lib/salesforce-client";
import {navItems, objectInfoTypes} from "../lib/salesforce-responses";
import recordMetric from "../lib/metrics";
import {AUTH_CONFIG_NAMES, DEFAULT_LIST_TYPES} from "../config";
import {
    SalesforceNavigationItems,
    SalesforceNavigationItem,
    SalesforceObject,
    SalesforcePicklistValuesCollection,
    SalesforceListResponse,
    SalesforceRecordCollection,
    ObjectInfoResponse,
} from "../lib/salesforce-types";

const placeholderListProps: SalesforceListProperties = {
    listId: "placeholder-data",
    response: {
        endpoint: "placeholder",
        instanceUrl: "http://test.data",
        data: placeholderData,
        lastFetchedTime: Date.now(),
        query: {},
        ownerId: "none",
    },
    comments: [],
    isPlaceholder: true,
    hasInitialColumns: true,
};

export interface AppData {
    isLoggedIn: boolean;
    isReadOnly: boolean;
    isSaving: boolean;
    instanceUrl: string;
    selectedList: SalesforceListData;
    listTypes: SalesforceNavigationItem[];
    listViews: Map<string, ListsResponseData>;
    availableObjects: Set<string>;
    truncateContent: boolean;
    useSandboxAuth: boolean;
    listError?: Error;
    saveError?: Error;
    objectInfoError?: Error;
    isFetchingMoreLists: boolean;
    isLoadingLists: boolean;
    isLoadingListTypes: boolean;
    isLoadingObjectInfo: boolean;
    isLoadingListData: boolean;
}

// Sometimes the UI API returns 0 results and no nextPageUrl when in fact the
// next page exists. This is a bug on the salesforce side but to get things
// working, we'll seek ahead a few pages when we reach an "empty" page just to
// make sure we're not encountering the bug.
const LIST_TYPES_SEEK_PAGES = 2;

// List responses are already slow, and currently we wait until we have them all
// to show the user - so having a super large number here does not impact UX.
// Why is this 1999? Salesforce does not allow requesting a pageToken greater than
// 2000, but the logic is not based on the actual number of records, just the
// token. This means that if we're at page 2 and our pageSize is 1000, it will
// fail - BUT if we're at page 2 and our pageSize is 999, it will succeed one
// additional time, resulting in 997 more records than if we had requested with
// a page size of 1000. Following this logic, if our page size is 2000, we will
// only be able to request 2000 records - but if our page size is 1999, we can
// request up to 3998 records.
const PAGE_SIZE = 1999;

export class RootEntity extends quip.apps.RootRecord {
    static ID = "listPicker";
    static DATA_VERSION = 1;

    static getProperties() {
        return {
            selectedList: SalesforceListEntity,
            navItemResponses: quip.apps.RecordList.Type(SalesforceResponse),
            objectInfoResponse: SalesforceResponse,
            typeToResponseIndex: "object",
            listsResponses: quip.apps.RecordList.Type(ListsResponse),
            containerWidth: "number",
            truncateContent: "boolean",
            useSandboxAuth: "boolean",
        };
    }

    static getDefaultProperties(): {[property: string]: any} {
        return {
            dataVersion: RootEntity.DATA_VERSION,
            selectedList: placeholderListProps,
            typeToResponseIndex: {},
            listsResponses: [],
            navItemResponses: [],
            containerWidth: 800,
            truncateContent: false,
            useSandboxAuth: false,
        };
    }

    getSelectedList(): SalesforceListEntity {
        return this.get("selectedList");
    }
    getNavItemResponses(): quip.apps.RecordList<
        SalesforceResponse<SalesforceNavigationItems>
    > {
        return this.get("navItemResponses");
    }
    getOjectInfoResponse(): SalesforceResponse<ObjectInfoResponse> | undefined {
        return this.get("objectInfoResponse");
    }
    getTypeToResponseIndex(): {[typeKey: string]: number} {
        return this.get("typeToResponseIndex");
    }
    getListsResponses(): quip.apps.RecordList<ListsResponse> {
        return this.get("listsResponses");
    }
    getContainerWidth(): number {
        return Math.max(this.get("containerWidth"), 800);
    }
    setContainerWidth(width: number) {
        this.set("containerWidth", width);
        this.notifyListeners();
        recordMetric("resize_container");
    }
    getTruncateContent(): boolean {
        return this.get("truncateContent");
    }
    getUseSandboxAuth(): boolean {
        return this.get("useSandboxAuth");
    }

    private isSaving_: boolean = false;
    private listError_?: Error;
    private saveError_?: Error;
    private objectInfoError_?: Error;
    private isLoadingTypes_: boolean = false;
    private isLoadingLists_: boolean = false;
    private isLoadingObjectInfo_: boolean = false;
    private isLoadingListData_: boolean = false;
    private isFetchingMoreLists_: boolean = false;
    private client_: SalesforceClient = new SalesforceClient();

    initialize() {
        const list = this.getSelectedList();
        this.refreshAuth();
        if (list) {
            list.listen(this.listUpdated_);
        }
    }

    getClient() {
        return this.client_;
    }

    setAuth(auth: quip.apps.OAuth2, name: string) {
        if (!auth) {
            this.saveError_ = new Error(_(
                `Please visit dev/console and set up an OAuth2 provider named ${name}.`) as string);
        } else {
            this.client_.setAuth(auth);
        }
        this.notifyListeners();
    }

    refreshAuth() {
        const useSandboxAuth = this.getUseSandboxAuth();
        const authName = useSandboxAuth
            ? AUTH_CONFIG_NAMES.SANDBOX
            : AUTH_CONFIG_NAMES.ORG_62;
        this.setAuth(quip.apps.auth(authName) as quip.apps.OAuth2, authName);
    }

    clearData() {
        const existingList = this.getSelectedList();
        if (existingList) {
            existingList.unlisten(this.listUpdated_);
            this.clear("selectedList");
        }
        this.set("selectedList", placeholderListProps);
        this.clear("typeToResponseIndex");
        this.set("typeToResponseIndex", {});
        this.clear("listsResponses");
        this.clear("navItemResponses");
        this.set("navItemResponses", []);
        this.clear("objectInfoResponse");
    }

    getData(): AppData {
        const selectedList = this.getSelectedList().getData();
        const typeToResponseIndex = this.getTypeToResponseIndex();
        const listsResponses = this.getListsResponses();
        const navItemResponses = this.getNavItemResponses();
        const objectInfoResponse = this.getOjectInfoResponse();
        // This response is lazily generated, so may not exist until the user
        // asks for it.
        let listTypes: SalesforceNavigationItem[] = [];
        if (navItemResponses) {
            listTypes = navItems(navItemResponses);
        }
        let availableObjects: Set<string> = new Set(
            DEFAULT_LIST_TYPES.map(({objectApiName}) => objectApiName));
        if (objectInfoResponse) {
            availableObjects = objectInfoTypes(objectInfoResponse);
        }
        const listViews: Map<string, ListsResponseData> = new Map();
        for (const type in typeToResponseIndex) {
            const list: ListsResponse = listsResponses.get(
                typeToResponseIndex[type]);
            listViews.set(type, list.getData());
        }
        const instanceUrl = this.client_.getInstanceUrl();
        const isReadOnly = selectedList.instanceUrl !== instanceUrl;
        return {
            isLoggedIn: this.client_.isLoggedIn(),
            isReadOnly,
            isSaving: this.isSaving_,
            instanceUrl,
            selectedList,
            listTypes,
            listViews,
            availableObjects,
            truncateContent: this.get("truncateContent"),
            useSandboxAuth: this.get("useSandboxAuth"),
            listError: this.listError_,
            saveError: this.saveError_,
            objectInfoError: this.objectInfoError_,
            isFetchingMoreLists: this.isFetchingMoreLists_,
            isLoadingLists: this.isLoadingLists_,
            isLoadingObjectInfo: this.isLoadingObjectInfo_,
            isLoadingListTypes: this.isLoadingTypes_,
            isLoadingListData: this.isLoadingListData_,
        };
    }

    getActions() {
        return {
            onAddComment: (
                recordId: string,
                columnName: string,
                domNode: Node
            ) =>
                this.getSelectedList().addComment(
                    recordId,
                    columnName,
                    domNode),
            onUpdateCell: (recordId: string, colName: string, value: string) =>
                this.getSelectedList().updateCell(recordId, colName, value),
            onSetSortColumn: (sortColumn: string) =>
                this.getSelectedList().setSortColumn(sortColumn),
            onSetColumnWidths: (columnWidths: Map<string, number>) =>
                this.getSelectedList().setColumnWidths(columnWidths),
            onSetShowingColumns: (showingColumns: string[]) =>
                this.getSelectedList().setShowingColumns(showingColumns),
            onResetData: () => this.getSelectedList().resetData(),
            onFetchListTypes: () =>
                Promise.all([this.fetchListTypes_(), this.fetchObjectInfo_()]),
            onFetchLists: (
                type: SalesforceNavigationItem,
                pageToken?: string
            ) => this.fetchLists_(type, pageToken),
            onSetSelectedList: (id: string, type: string) =>
                this.setSelectedList_(id, type),
            onSave: () => this.saveList_(),
            onRefresh: () => this.refreshList_(),
            onHideColumn: (colName: string) =>
                this.getSelectedList().hideColumn(colName),
            onToggleTruncate: () =>
                this.set("truncateContent", !this.get("truncateContent")),
            onToggleSandbox: () => {
                this.set("useSandboxAuth", !this.get("useSandboxAuth"));
                this.refreshAuth();
            },
        };
    }

    searchForLists = async (
        type: SalesforceNavigationItem,
        query: string
    ): Promise<ListsResponseData> => {
        this.listError_ = undefined;
        this.notifyListeners();
        let listData: ListsResponseData = {hasMore: false, lists: []};
        try {
            const apiName = type.objectApiName;
            listData = await this.getClient().doGet<ListsResponseData>(
                `ui-api/list-ui/${apiName}`,
                {pageSize: 2000, q: query});
        } catch (err) {
            console.error("Error loading types", err);
            this.listError_ = err;
            recordMetric("error", {
                "error_type": "lists_search",
                "message": err.message,
                "stack": err.stack,
            });
            this.notifyListeners();
        }
        return listData;
    };

    async fetchObjectInfo_() {
        this.isLoadingObjectInfo_ = true;
        this.objectInfoError_ = undefined;
        this.notifyListeners();
        try {
            const res = await this.getClient().getResponseProperties<
                ObjectInfoResponse
            >("ui-api/object-info");
            this.clear("objectInfoResponse");
            this.set("objectInfoResponse", res);
        } catch (err) {
            console.error("Error loading object info");
            this.objectInfoError_ = err;
            recordMetric("error", {
                "error_type": "object_info",
                "message": err.message,
                "stack": err.stack,
            });
        }
        this.isLoadingObjectInfo_ = false;
        this.notifyListeners();
    }

    async fetchListTypes_() {
        this.isLoadingTypes_ = true;
        this.listError_ = undefined;
        this.notifyListeners();
        let responses = [];
        let pagesSeeked = 0;
        let page = 0;
        try {
            let res;
            do {
                if (res && !res.data.nextPageUrl) {
                    pagesSeeked++;
                }
                res = await this.getClient().getResponseProperties<
                    SalesforceNavigationItems
                >("ui-api/nav-items", {pageSize: 100, page});
                page++;
                responses.push(res);
            } while (
                (res && res.data.nextPageUrl) ||
                pagesSeeked < LIST_TYPES_SEEK_PAGES
            );
        } catch (err) {
            console.error("Error loading types", err);
            this.listError_ = err;
            recordMetric("error", {
                "error_type": "list_types",
                "message": err.message,
                "stack": err.stack,
            });
        }
        this.isLoadingTypes_ = false;
        this.clear("navItemResponses");
        this.set("navItemResponses", responses);
    }

    async fetchLists_(type: SalesforceNavigationItem, pageToken?: string) {
        if (!pageToken) {
            this.isLoadingLists_ = true;
        } else {
            this.isFetchingMoreLists_ = true;
        }
        this.notifyListeners();
        this.listError_ = undefined;
        try {
            const apiName = type.objectApiName;
            const props = await this.getClient().getResponseProperties(
                `ui-api/list-ui/${apiName}`,
                {pageSize: 100, pageToken});
            const typeToResponseIndex = this.get("typeToResponseIndex");
            const listsResponses = this.get("listsResponses");
            const existingIndex = typeToResponseIndex[apiName];
            if (existingIndex !== undefined) {
                if (pageToken) {
                    listsResponses.get(existingIndex).addListProps(props);
                } else {
                    listsResponses.get(existingIndex).resetWithListProps(props);
                }
            } else {
                const list = listsResponses.add({});
                list.resetWithListProps(props);
                typeToResponseIndex[apiName] = listsResponses.indexOf(
                    list.id());
                this.set("typeToResponseIndex", typeToResponseIndex);
            }
        } catch (err) {
            console.error("Error loading types", err);
            this.listError_ = err;
            recordMetric("error", {
                "error_type": "lists",
                "message": err.message,
                "stack": err.stack,
            });
        }
        this.isFetchingMoreLists_ = false;
        this.isLoadingLists_ = false;
        this.notifyListeners();
    }

    saveList_() {
        const selectedList = this.getSelectedList();
        const {listId, objectType, updates} = selectedList.getSaveData();
        if (updates.length === 0) {
            return;
        }
        recordMetric("save", {
            "record_count": String(
                updates.reduce(
                    (s: Set<string>, u) => s.add(u.recordId),
                    new Set()).size),
            "edit_count": String(updates.length),
        });
        const client = this.getClient();
        this.isSaving_ = true;
        this.saveError_ = undefined;
        this.notifyListeners();
        return Promise.all(
            updates.map(({recordId, fields}) =>
                client.doPatch(`ui-api/records/${recordId}`, {fields})
            ))
            .then(() => {
                this.isLoadingListData_ = true;
                this.notifyListeners();
            })
            .then(() => this.getListProps_(listId, objectType))
            .then(listProps => {
                this.isSaving_ = false;
                this.isLoadingListData_ = false;
                selectedList.setProperties(
                    listProps,
                    /** reset dirty fields */ true);
            })
            .catch(err => {
                this.isSaving_ = false;
                this.isLoadingListData_ = false;
                console.error("Error saving list", err);
                this.saveError_ = err;
                recordMetric("error", {
                    "error_type": "save",
                    "message": err.message,
                    "stack": err.stack,
                });
                this.notifyListeners();
            });
    }

    async refreshList_() {
        const selectedList = this.get("selectedList");
        const {listId, objectType} = selectedList.getSaveData();
        this.isLoadingListData_ = true;
        this.notifyListeners();
        recordMetric("refresh");
        try {
            const listProps = await this.getListProps_(listId, objectType);
            this.isLoadingListData_ = false;
            selectedList.setProperties(listProps);
        } catch (err) {
            this.isLoadingListData_ = false;
            this.notifyListeners();
            throw err;
        }
    }

    listUpdated_ = () => {
        this.notifyListeners();
    };

    async getListProps_(listId: string, objectType: string) {
        const startFetchTime = Date.now();
        const client = this.getClient();
        const [
            response,
            {objectResponse, picklistsResponse},
        ] = await Promise.all([
            client.getResponseProperties<SalesforceListResponse>(
                `ui-api/list-ui/${listId}`,
                {pageSize: PAGE_SIZE}),
            // To build all the input values, we'll need object info for all
            // fields and the potential picklists for any picklists - see
            // https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_features_records_dependent_picklist.htm
            client
                .getResponseProperties<SalesforceObject>(
                    `ui-api/object-info/${objectType}`)
                .then(objectResponse => {
                    return client
                        .getResponseProperties<
                            SalesforcePicklistValuesCollection
                        >(
                            `ui-api/object-info/${objectType}/picklist-values/${
                                // I'm not sure if there are any cases where
                                // this would return more than one key, or how
                                // that would effect the available picklists.
                                Object.values(
                                    objectResponse.data.recordTypeInfos)[0]
                                    .recordTypeId
                            }`)
                        .then(picklistsResponse => ({
                            objectResponse,
                            picklistsResponse,
                        }));
                }),
        ]);
        let {
            data: {
                records: {count: totalRecords, nextPageToken},
            },
        } = response;
        const recordResponses: SalesforceResponseProperties<
            SalesforceRecordCollection
        >[] = [];
        let isLargerThanMax = false;
        let numRequests = 0;
        try {
            while (nextPageToken) {
                const response = await client.getResponseProperties<
                    SalesforceRecordCollection
                >(`ui-api/list-records/${listId}`, {
                    pageToken: nextPageToken,
                    pageSize: PAGE_SIZE,
                });
                nextPageToken = response.data.nextPageToken;
                totalRecords += response.data.count;
                recordResponses.push(response);
                numRequests++;
                // This logic, while wrong, best emulates what will trigger
                // errors on salesforce's side, so it will properly predict errors.
                if (numRequests * PAGE_SIZE > 2000) {
                    isLargerThanMax = true;
                    break;
                }
            }
        } catch (err) {
            console.error("Error fetching pages:", err);
            this.saveError_ = err;
            recordMetric("error", {
                "error_type": "save",
                "message": err.message,
                "stack": err.stack,
            });
        }
        recordMetric("list_fetch", {
            "duration": String(Date.now() - startFetchTime),
            "total_records": String(totalRecords),
        });
        return {
            listId,
            objectType,
            response,
            recordResponses,
            objectResponse,
            picklistsResponse,
            isLargerThanMax,
        };
    }

    async setSelectedList_(selectedListId: string, selectedListType: string) {
         
        // in the selection UI, but they could be attempted vi intercept URLs.
        if (selectedListId === "Recent") {
            recordMetric("recent_list_attempted");
            throw new Error(_("Recent lists not yet supported.") as string);
        }
        this.isLoadingListData_ = true;
        this.notifyListeners();
        try {
            const listProps = await this.getListProps_(
                selectedListId,
                selectedListType);
            const existingList = this.get("selectedList");
            if (existingList) {
                existingList.unlisten(this.listUpdated_);
                 
                // not, this will leak.
                this.clear("selectedList");
            }
            this.isLoadingListData_ = false;
            this.set("selectedList", listProps);
            const list = this.get("selectedList");
            list.listen(this.listUpdated_);
            recordMetric("selected_list", {
                "list_id": selectedListId,
                "list_type": selectedListType,
            });
        } catch (err) {
            this.isLoadingListData_ = false;
            this.notifyListeners();
            throw err;
        }
    }
}
