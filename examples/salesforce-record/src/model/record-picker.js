// Copyright 2017 Quip

import {
    parseListViews,
    parseSchema,
    parseSoqlRecords,
} from "../../../shared/base-field-builder/response-handler.js";
import {SalesforceRecordEntity} from "./salesforce-record.js";
import {
    AUTH_CONFIG_NAMES,
    SUPPORTED_OBJECT_TYPE_KEYS,
    getDisplayName,
    getSearchField,
} from "../config.js";
import {SalesforceClient} from "../client.js";
import PlaceholderData from "../placeholder-data.js";
import {awaitValues, mapKeysToObject} from "../util.js";
import {ForbiddenError} from "../../../shared/base-field-builder/error.js";

/** @typedef {{schema: Object, listViewsData: Object}} RecordTypeData */

export class RecordPickerEntity extends quip.apps.RootRecord {
    static ID = "recordPicker";

    static getProperties() {
        return {
            lastFetchedTime: "number",
            recordTypes: "object",
            selectedRecord: SalesforceRecordEntity,
            useSandbox: "boolean",
            instanceUrl: "string",
        };
    }

    static getDefaultProperties() {
        const recordTypes = this.createRecordTypes_(SUPPORTED_OBJECT_TYPE_KEYS);
        return {recordTypes, useSandbox: false};
    }

    static createRecordTypes_(objectTypeKeys) {
        return mapKeysToObject(objectTypeKeys, () => ({
            schema: {},
        }));
    }

    initialize() {
        this.pickerData = mapKeysToObject(SUPPORTED_OBJECT_TYPE_KEYS, () => ({
            listViewsData: {},
            schema: {},
        }));
    }

    setClient(client) {
        this.salesforceClient_ = client;
        this.setInstanceUrl(client.getInstanceUrl());
    }

    getClient() {
        return this.salesforceClient_;
    }

    clearCachedData() {
        if (this.getSelectedRecord()) {
            this.getSelectedRecord().clearCachedData();
        }
    }

    toggleUseSandbox() {
        if (!this.hasSandboxAuth()) {
            return;
        }

        const useSandbox = !this.useSandbox();
        this.setUseSandbox(useSandbox);
        const auth = quip.apps.auth(
            useSandbox
                ? AUTH_CONFIG_NAMES.SANDBOX
                : AUTH_CONFIG_NAMES.PRODUCTION);
        const salesforceClient = new SalesforceClient(auth);
        this.setClient(salesforceClient);
        this.clearSelectedRecord();
        this.loadPlaceholderData(PlaceholderData);
    }

    ensureLoggedIn() {
        const client = this.getClient();
        return client
            .ensureLoggedIn()
            .then(() => this.setInstanceUrl(client.getInstanceUrl()));
    }

    logout() {
        return this.getClient().logout();
    }

    fetchData() {
        return this.ensureLoggedIn()
            .then(() => this.fetchDataForTypes_(SUPPORTED_OBJECT_TYPE_KEYS))
            .then(recordTypeToData => {
                const validRecordTypeEntries = Object.entries(recordTypeToData)
                    // Data can be undefined if the type is not available.
                    .filter(([_, data]) => typeof data !== "undefined");
                this.updatePickerData_(validRecordTypeEntries);
                // Only update schemas if current user is the one who selected
                // the record.
                if (this.shouldOverwriteSchema_()) {
                    this.updateSchemas_(validRecordTypeEntries);
                }
            });
    }

    updatePickerData_(recordTypeEntries) {
        const validRecordTypes = Object.create(null);
        recordTypeEntries.forEach(([recordType, data]) => {
            validRecordTypes[recordType] = true;
            this.pickerData[recordType] = data;
        });
        // Picker data can be invalid if a claimed supported object type cannot
        // be queried for.
        Object.keys(this.pickerData)
            .filter(recordType => !(recordType in validRecordTypes))
            .forEach(
                invalidRecordType => delete this.pickerData[invalidRecordType]);
    }

    updateSchemas_(recordTypeEntries) {
        const ownerId = quip.apps.getViewingUser().getId();
        const recordTypeKeys = recordTypeEntries.map(([key, _]) => key);
        const recordTypes = RecordPickerEntity.createRecordTypes_(
            recordTypeKeys);
        recordTypeEntries.forEach(([recordType, {schema}]) => {
            recordTypes[recordType].schema = schema;
        });
        this.setRecordTypes(recordTypes);
    }

    /**
     * @param {string[]} recordTypeKeys
     * @return {Promise<Object<string, RecordTypeData>}
     * @private
     */
    fetchDataForTypes_(recordTypeKeys) {
        /** @type {Object<string, Promise<RecordTypeData>} */
        const dataFetchers = mapKeysToObject(recordTypeKeys, recordType =>
            this.fetchDataForType_(recordType)
        );
        return awaitValues(dataFetchers);
    }

    /**
     * @param {string} recordType
     * @return {Promise<RecordTypeData>}
     * @private
     */
    fetchDataForType_(recordType) {
        return awaitValues({
            schema: this.fetchRecordSchemaForType_(recordType),
            listViewsData: this.fetchListViewsForType_(recordType),
        }).catch(err => {
            if (err instanceof ForbiddenError) {
                console.warn(
                    `Unknown or not permitted record type ${recordType}`);
                return undefined;
            }
            return Promise.reject(err);
        });
    }

    fetchRecordSchemaForType_(recordType) {
        const recordData = this.pickerData[recordType];
        if (this.isRecent(recordData.schema)) {
            return Promise.resolve(recordData.schema);
        }

        return this.getClient()
            .fetchObjectInfo(recordType)
            .then(response => ({
                ...parseSchema(response),
                lastFetchedTime: Date.now(),
            }));
    }

    fetchListViewsForType_(recordType) {
        const listViewsData = {};
        const recordDisplayName = getDisplayName(recordType);
        const allListViewLabel = `All ${recordDisplayName}`;
        const recentListViewLabel = quiptext(
            "Recently Viewed %(record_type)s",
            {
                "record_type": recordDisplayName,
            });

        const searchField = getSearchField(recordType);
        listViewsData["RecentlyViewed"] = {
            label: quiptext("Recently Viewed"),
            key: "RecentlyViewed",
            describeUrl: null,
            query:
                `SELECT ${searchField}, Id, LastModifiedDate FROM ${recordType}` +
                ` WHERE LastViewedDate != NULL ORDER BY LastViewedDate DESC`,
            id: "RecentlyViewed",
        };

        return this.getClient()
            .fetchListViews(recordType)
            .then(response => {
                const listViews = parseListViews(response, recordType);
                listViews.forEach(listView => {
                    if (listView.label != allListViewLabel &&
                        listView.label != recentListViewLabel) {
                        //FIXME: temp dedup
                        listViewsData[listView.key] = listView;
                    }
                });
                listViewsData["All"] = {
                    label: allListViewLabel,
                    key: "All",
                    describeUrl: null,
                    query: `SELECT ${searchField}, Id, LastModifiedDate FROM ${recordType}`,
                    id: "All",
                };
                return listViewsData;
            });
    }

    fetchRecordsDataByQuery_(query, recordType, searchTerm = null) {
        if (searchTerm) {
            query = this.reformatQuery_(query, recordType, searchTerm);
        }
        // FIXME
        query = query + " LIMIT 200";
        return this.getClient()
            .fetchSoqlQuery(query)
            .then(response => parseSoqlRecords(response, getSearchField));
    }

    //TODO: move to util.js
    reformatQuery_(query, recordType, searchTerm) {
        if (!query) return;
        query = query.toLowerCase();

        const searchField = getSearchField(recordType);
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

    fetchRecordDataForListView(recordType, listViewKey, searchTerm = null) {
        const listViewsData = this.pickerData[recordType].listViewsData;
        if (listViewsData[listViewKey] !== undefined &&
            Object.keys(listViewsData[listViewKey]).length > 0 &&
            listViewsData[listViewKey].records &&
            !searchTerm) {
            const recordsData = listViewsData[listViewKey].records;
            return Promise.resolve(recordsData);
        }
        return this.fetchDescribeQuery_(recordType, listViewKey)
            .then(query =>
                this.fetchRecordsDataByQuery_(query, recordType, searchTerm)
            )
            .then(recordsData => {
                if (searchTerm == null || searchTerm.length == 0) {
                    const data = listViewsData[listViewKey];
                    data.records = recordsData;
                    data.lastFetchedTime = Date.now();
                    this.pickerData[recordType].listViewsData[
                        listViewKey
                    ] = data;
                }
                const retRecordsData = recordsData;
                return retRecordsData;
            });
    }

    fetchDescribeQuery_(recordType, listViewKey) {
        const targetQuery = this.pickerData[recordType].listViewsData[
            listViewKey
        ].query;
        if (targetQuery) {
            return Promise.resolve(targetQuery);
        }
        const describeUrl = this.pickerData[recordType].listViewsData[
            listViewKey
        ].describeUrl;
        return this.getClient()
            .fetchApiLink(describeUrl)
            .then(response => {
                const query = response.query;
                this.pickerData[recordType].listViewsData[
                    listViewKey
                ].query = query;
                return query;
            });
    }

    shouldOverwriteSchema_() {
        const selectedRecord = this.getSelectedRecord();
        const isRealRecord = selectedRecord && !selectedRecord.isPlaceholder();
        if (!isRealRecord) {
            return false;
        }
        const ownerId = selectedRecord.getOwnerId();
        const viewerId =
            quip.apps.getViewingUser() !== null
                ? quip.apps.getViewingUser().getId()
                : null;
        const isCurrentUserOwner = !!ownerId && viewerId === ownerId;
        return isCurrentUserOwner;
    }

    isRecent(data) {
        const recencyThreshold = 1000 * 60 * 5;
        const now = Date.now();
        return data.lastFetchedTime + recencyThreshold > now;
    }

    isExpired() {
        const everySchemaIsRecent = Object.values(this.pickerData).every(
            ({schema}) => this.isRecent(schema));
        return !everySchemaIsRecent;
    }

    getRecordTypes() {
        return this.get("recordTypes");
    }

    setRecordTypes(recordTypes) {
        return this.set("recordTypes", recordTypes);
    }

    useSandbox() {
        return this.hasSandboxAuth() && this.get("useSandbox");
    }

    hasSandboxAuth() {
        return !!quip.apps.auth(AUTH_CONFIG_NAMES.SANDBOX);
    }

    setUseSandbox(useSandbox) {
        return this.set("useSandbox", useSandbox);
    }

    getInstanceUrl() {
        return this.get("instanceUrl");
    }

    setInstanceUrl(instanceUrl) {
        return this.set("instanceUrl", instanceUrl);
    }

    getListViewsForType(recordType) {
        return Object.values(this.pickerData[recordType].listViewsData);
    }

    getSchemaForType(recordType) {
        const storedSchema = this.getRecordTypes()[recordType].schema;
        if (Object.keys(storedSchema).length !== 0) {
            return storedSchema;
        }

        return this.pickerData[recordType].schema;
    }

    /**
     * @return {SalesforceRecordEntity}
     */
    getSelectedRecord() {
        return this.get("selectedRecord");
    }

    setSelectedRecord(recordId) {
        this.clearSelectedRecord();
        // Update the schema and owner based on the current user's view.
        const recordTypes = this.getRecordTypes();
        const ownerId = quip.apps.getViewingUser().getId();
        for (const recordType of SUPPORTED_OBJECT_TYPE_KEYS) {
            recordTypes[recordType].schema = this.pickerData[recordType].schema;
            recordTypes[recordType].ownerId = ownerId;
        }
        this.setRecordTypes(recordTypes);
        this.set("selectedRecord", {
            recordId: recordId,
            ownerId: ownerId,
        });
        this.getSelectedRecord().fetchData();
        const metricArgs = {
            action: "selected_record",
            record_type: this.getSelectedRecord().getType(),
        };
        const metricName = this.getSelectedRecord().getMetricName();
        quip.apps.recordQuipMetric(metricName, metricArgs);
    }

    clearSelectedRecord() {
        if (this.getSelectedRecord()) {
            this.getSelectedRecord().clear();
        }
        this.clear("selectedRecord");
    }

    loadPlaceholderData(placeholerData) {
        const recordTypes = this.getRecordTypes();
        recordTypes[placeholerData.type].schema = placeholerData.schema;
        this.setRecordTypes(recordTypes);
        this.set("selectedRecord", {
            recordId: placeholerData.recordId,
            isPlaceholder: true,
        });
        this.getSelectedRecord().loadPlaceholderData(placeholerData);
    }

    setDom(node) {
        this.domNode = node;
    }

    getDom() {
        return this.domNode;
    }

    getHostname() {
        const instanceUrl = this.getInstanceUrl();
        if (instanceUrl && instanceUrl.includes("://")) {
            const segs = instanceUrl.split("://");
            return segs[1];
        }
        return this.instanceUrl;
    }

    getSupportedRecordTypes() {
        return Object.keys(this.pickerData);
    }
}
