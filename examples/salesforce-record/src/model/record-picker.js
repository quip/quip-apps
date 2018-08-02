// Copyright 2017 Quip
import {SalesforceRecordEntity} from "./salesforce-record.js";
import {AUTH_CONFIG_NAMES} from "../config.js";
import {SalesforceClient} from "../client.js";
import PlaceholderData from "../placeholder-data.js";

/** @typedef {{schema: Object, listViewsData: Object}} RecordTypeData */

const OBJECT_PREFERENCES_KEY = "insertedObjectTypes";

export class RecordPickerEntity extends quip.apps.RootRecord {
    static ID = "recordPicker";
    static DATA_VERSION = 1;

    static getProperties() {
        return {
            lastFetchedTime: "number",
            selectedRecord: SalesforceRecordEntity,
            useSandbox: "boolean",
            instanceUrl: "string",
        };
    }

    static getDefaultProperties() {
        return {useSandbox: false};
    }

    initialize() {}

    ensureCurrentDataVersion() {
        const dataVersion = this.getDataVersion();
        if (dataVersion === RecordPickerEntity.DATA_VERSION) {
            return;
        }

        const selectedRecord = this.getSelectedRecord();
        if (!selectedRecord) {
            return;
        }

        const recordId = selectedRecord.get("recordId");
        if (recordId === PlaceholderData.recordId) {
            // If no record was selected, just blow away and re-initialized with
            // placeholder data.
            this.loadPlaceholderData();
            return;
        }

        if (dataVersion === 0) {
            // Upgrade 0 -> 1
            const recordTypes = this.get("recordTypes");
            const recordType = selectedRecord.get("type");
            const schema = recordTypes[recordType].schema;
            schema.apiName = recordType;
            schema.label = recordType;
            schema.nameFields = selectedRecord
                .getFields()
                .map(fieldEntity => fieldEntity.getKey());

            this.setDataVersion(RecordPickerEntity.DATA_VERSION);
            selectedRecord.set("schema", schema);
            selectedRecord.clear("type");
            this.clear("recordTypes");
            return;
        }

        throw Error("Not reached");
    }

    setClient(client) {
        this.salesforceClient_ = client;
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
        this.loadPlaceholderData();
    }

    ensureLoggedIn() {
        const client = this.getClient();
        return client.ensureLoggedIn();
    }

    logout() {
        return this.getClient().logout();
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

    /**
     * @return {SalesforceRecordEntity}
     */
    getSelectedRecord() {
        return this.get("selectedRecord");
    }

    setSelectedRecord(recordId, schema) {
        this.clearSelectedRecord();
        // Update the schema and owner based on the current user's view.
        const ownerId = quip.apps.getViewingUser().getId();
        this.set("instanceUrl", this.getClient().getInstanceUrl());
        this.set("selectedRecord", {
            recordId: recordId,
            ownerId: ownerId,
        });
        this.setDataVersion(RecordPickerEntity.DATA_VERSION);
        this.getSelectedRecord().setSchema(schema);
        this.getSelectedRecord().fetchData();
        const metricArgs = {
            action: "selected_record",
            record_type: this.getSelectedRecord().getType(),
            custom: String(schema.custom),
        };

        Object.values(schema.unsupportedFields).forEach(field => {
            const key = `unsupported_data_type_${field.dataType}`;
            metricArgs[key] = String(
                parseInt((metricArgs[key] || "0") + 1, 10));
        });

        const metricName = this.getSelectedRecord().getMetricName();
        quip.apps.recordQuipMetric(metricName, metricArgs);
        this.recordRecordTypeSelection(schema.apiName);
    }

    clearSelectedRecord() {
        if (this.getSelectedRecord()) {
            this.getSelectedRecord().clearRecord();
        }
        this.clear("instanceUrl");
        this.clear("selectedRecord");
    }

    loadPlaceholderData() {
        const selectedRecord = this.getSelectedRecord();
        if (selectedRecord) {
            selectedRecord.clearData();
        }

        this.clearData();
        this.set("selectedRecord", {
            recordId: PlaceholderData.recordId,
            isPlaceholder: true,
        });
        this.setDataVersion(RecordPickerEntity.DATA_VERSION);
        this.getSelectedRecord().loadPlaceholderData(PlaceholderData);
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

    getPreviouslySelectedObjectTypes() {
        const preferences = quip.apps.getUserPreferences();
        const objectStr = preferences.getForKey(OBJECT_PREFERENCES_KEY);
        if (!objectStr) {
            return [];
        }
        return JSON.parse(objectStr);
    }

    recordRecordTypeSelection(apiName) {
        const types = this.getPreviouslySelectedObjectTypes();
        if (types.includes(apiName)) {
            return;
        }

        types.push(apiName);
        const preferences = quip.apps.getUserPreferences();
        preferences.save({[OBJECT_PREFERENCES_KEY]: JSON.stringify(types)});
    }
}
