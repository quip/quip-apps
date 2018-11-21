// Copyright 2017 Quip

import {JiraRecentEntity} from "./jira-recent-record.js";
import {
    BLANK_STATE_FIELDS,
    PLACEHOLDER_STATE_FIELDS,
    JiraRecordEntity,
} from "./jira-record.js";
import {COLUMN_TYPE, ColumnRecord} from "../../../shared/table-view/model.js";

const READ_ONLY_INSTANCE = [
    "jira-legacy-dev.airbnb.biz",
    "jira-dev.airbnb.biz",
];

export class JiraRootEntity extends quip.apps.RootRecord {
    static ID = "jiraRoot";

    static getProperties() {
        return {
            instanceUrl: "string",
            selectedRecord: JiraRecordEntity,
            recentRecords: quip.apps.RecordList.Type(JiraRecentEntity),
            isPlaceholder: "boolean",
            filterId: "string",
            filterName: "string",
            filterLastFetchedTime: "number",
            ownerId: "string",
            // List records. Eventually we should remove both columns and rows.
            // However it requires further refactoring.
            columns: quip.apps.RecordList.Type(ColumnRecord),
            records: quip.apps.RecordList.Type(JiraRecordEntity),
            cachedRecords: quip.apps.RecordList.Type(JiraRecordEntity),
            widths: "object",
            // Very stupid, but the syncing and racing of placeholder / regular
            // data is causing all sorts of problems.
            placeholderColumns: quip.apps.RecordList.Type(ColumnRecord),
            placeholderRecords: quip.apps.RecordList.Type(JiraRecordEntity),
            placeholderWidths: "object",
        };
    }

    static getDefaultProperties() {
        return {
            cachedRecords: [],
            isPlaceholder: true,
            records: [],
            recentRecords: [],
            columns: this.createColumns_(BLANK_STATE_FIELDS.slice()),
            widths: {},
            placeholderColumns: this.createColumns_(
                PLACEHOLDER_STATE_FIELDS.slice()),
            placeholderRecords: [],
            placeholderWidths: {},
        };
    }

    static createColumns_(columns) {
        columns.splice(0, 0, {key: "key", name: quiptext("Key")});
        columns = columns.map(field => {
            return {
                name: field.key,
                type: COLUMN_TYPE.CUSTOM,
                contents: {
                    RichText_defaultText: field.name,
                },
                deletable: field.key != "key",
                draggable: field.key != "key",
                titleEditable: false,
                visible: true,
            };
        });
        return columns;
    }

    initialize() {
        this.get("columns");
        this.get("records");
    }

    getFilterId() {
        return this.get("filterId");
    }

    setFilterId(filterId) {
        this.set("filterId", filterId);
        this.set("ownerId", quip.apps.getViewingUser().id());
    }

    getInstanceUrl() {
        return this.get("instanceUrl");
    }

    getAlternativeOAuthBaseUrl() {
        return `${this.getInstanceUrl()}/secure`;
    }

    setInstanceUrl(instanceUrl) {
        this.set("instanceUrl", instanceUrl);
    }

    clearInstanceUrl() {
        this.epicLinkOptions_ = null;
        this.sprintOptions_ = null;
        this.issueLinkTypes_ = null;

        this.clear("instanceUrl");
    }

    isReadOnlyInstance() {
        return !!READ_ONLY_INSTANCE.find(
            item =>
                this.getInstanceUrl() && this.getInstanceUrl().includes(item));
    }

    isOwner() {
        return this.get("ownerId") === quip.apps.getViewingUser().getId();
    }

    setOwnerId(ownerId) {
        this.set("ownerId", ownerId);
    }

    getRecords() {
        let records;
        if (this.isPlaceholder()) {
            records = this.get("placeholderRecords");
        } else {
            records = this.get("records");
        }
        return records ? records.getRecords() : [];
    }

    addRecord(recordId, isPlaceholder = false) {
        const cachedRecord = this.get("cachedRecords")
            .getRecords()
            .find(cachedRecord => cachedRecord.getRecordId() === recordId);
        let record;
        if (cachedRecord) {
            this.get("records").move(cachedRecord);
            record = cachedRecord;
        } else {
            const object = {
                recordId: recordId,
                isPlaceholder: isPlaceholder,
            };
            if (isPlaceholder) {
                record = this.get("placeholderRecords").add(object);
            } else {
                record = this.get("records").add(object);
            }
        }
        if (!isPlaceholder) {
            record.setOwnerId(quip.apps.getViewingUser().getId());
        }
        this.set("ownerId", quip.apps.getViewingUser().id());
        return record;
    }

    isPlaceholder() {
        return this.get("isPlaceholder");
    }

    hasListRecords() {
        return (
            this.getFilterId() ||
            (this.getRecords().length != 0 && !this.isPlaceholder())
        );
    }

    clearRecords() {
        this.clearStaleRecords();
        this.clear("filterId");
    }

    clearStaleRecords() {
        this.getRecords().forEach(record => {
            if (!record.isPlaceholder()) {
                this.get("cachedRecords").move(record);
            }
        });
    }

    addRecentRecord(id, key, summary) {
        let record = this.getRecentRecords().find(
            record => record.getJiraId() === id);
        if (record) {
            this.get("recentRecords").move(record, 0);
        } else {
            this.get("recentRecords").add(
                {recordId: id, key: key, summary: summary},
                0);
        }
    }

    getRecentRecords() {
        let records = this.get("recentRecords");
        return records ? records.getRecords() : [];
    }

    getSelectedRecord() {
        return this.get("selectedRecord");
    }

    setSelectedRecord(recordId) {
        const cachedRecord = this.get("cachedRecords")
            .getRecords()
            .find(cachedRecord => cachedRecord.getRecordId() === recordId);
        let record;
        if (cachedRecord) {
            this.get("cachedRecords").remove(cachedRecord, true);
            record = this.set("selectedRecord", cachedRecord);
        } else {
            record = this.set("selectedRecord", {
                recordId: recordId,
            });
        }
        const ownerId = quip.apps.getViewingUser().getId();
        this.getSelectedRecord().setOwnerId(ownerId);
        this.setOwnerId(ownerId);
    }

    clearSelectedRecord() {
        const record = this.get("selectedRecord");
        this.clear("selectedRecord", true);
        if (record && !record.isPlaceholder()) {
            this.get("cachedRecords").move(record);
        }
    }

    getColumns() {
        return this.getColumnsList().getRecords();
    }

    getColumnsList() {
        if (this.isPlaceholder()) {
            return this.get("placeholderColumns");
        } else {
            return this.get("columns");
        }
    }

    loadPlaceholderData(placeholderData) {
        this.set("isPlaceholder", true);
        placeholderData.records.forEach(record => {
            const result = this.addRecord(record.recordId, true);
            result.loadPlaceholderData(record, placeholderData.schema);
            this.get("placeholderColumns")
                .getRecords()
                .forEach(column => {
                    if (column.getName() !== "key") {
                        result.addField(column.getName());
                    }
                });
        });
    }

    setDom(node) {
        this.domNode = node;
    }

    getDom() {
        return this.domNode;
    }

    setFetching(fetching) {
        this.fetching = fetching;
    }

    isFetching() {
        return this.fetching;
    }

    fetchOptions(client, field) {
        if (field.getKey() === "epicLink") {
            if (!this.epicLinkOptions_) {
                this.epicLinkOptions_ = client.fetchEpicLinkOptions(field);
            }
            return Promise.resolve(this.epicLinkOptions_);
        } else if (field.getKey() === "sprint") {
            if (!this.sprintOptions_) {
                this.sprintOptions_ = client.fetchSprintOptions(field);
            }
            return Promise.resolve(this.sprintOptions_);
        } else {
            return Promise.resolve([]);
        }
    }

    fetchIssueLinkTypes(client) {
        if (!this.issueLinkTypes_) {
            this.issueLinkTypes_ = client.fetchIssueLinkTypes();
        }
        return Promise.resolve(this.issueLinkTypes_);
    }
}
