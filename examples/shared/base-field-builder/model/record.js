// Copyright 2017 Quip

import {
    BooleanFieldEntity,
    DateFieldEntity,
    DateTimeFieldEntity,
    EnumFieldEntity,
    FieldEntity,
    NumericFieldEntity,
    ReferenceFieldEntity,
    TextFieldEntity,
    TokenFieldEntity,
    MultipicklistEntity,
} from "./field.js";

import {unescapeHTML} from "../utils.jsx";
import {parseFieldValue} from "../response-handler.js";

export class RecordEntity extends quip.apps.Record {
    static ID = "record";

    static getProperties() {
        return {
            fields: quip.apps.RecordList.Type(FieldEntity),
            fieldsDataArray: "array",
            lastFetchedTime: "number",
            recordId: "string",
            isPlaceholder: "boolean",
            ownerId: "string",
        };
    }

    fieldSupported(field) {
        throw Error("Unimplemented abstract method.");
    }

    supportedFieldsDataArray() {
        const schema = this.getSchema();
        const visibleKeys = new Set(
            this.getFieldsDataArray().map(field => field.key));
        return Object.values(schema.fields)
            .filter(
                field =>
                    this.fieldSupported(field) &&
                    visibleKeys.has(field.apiName))
            .map(field => ({
                key: field.apiName,
                label: unescapeHTML(field.label),
                shortLabel: field.shortLabel
                    ? unescapeHTML(field.shortLabel)
                    : field.shortLabel,
            }));
    }

    static getDefaultProperties() {
        return {fields: []};
    }

    getSource() {
        throw Error("Unimplemented abstract method.");
    }

    getMetricName() {
        throw Error("Unimplemented abstract method.");
    }

    getField(key) {
        const fieldEntity = this.getFields().find(
            fieldEntity => fieldEntity.getKey() === key);
        return fieldEntity || null;
    }

    getFieldData(key) {
        let fieldData = this.getCachedFieldsDataArray_().find(
            fieldData => fieldData.key === key);
        if (!fieldData) {
            fieldData = this.getSharedFieldsDataArray_().find(
                fieldData => fieldData.key === key);
        }
        return fieldData || null;
    }

    getFields() {
        return this.getFieldsListEntity().getRecords();
    }

    getFieldsListEntity() {
        return this.get("fields");
    }

    getSharedFieldsDataArray_() {
        return this.get("fieldsDataArray");
    }

    setSharedFieldsDataArray_(data) {
        this.set("fieldsDataArray", data);
    }

    getCachedFieldsDataArray_() {
        return this.cachedFieldsDataArray_;
    }

    setCachedFieldsDataArray_(data) {
        this.cachedFieldsDataArray_ = data;
    }

    getFieldsDataArray() {
        return this.getCachedFieldsDataArray_();
    }

    getPersistedKeys() {
        throw Error("Unimplemented abstract method.");
    }

    setFieldsDataArray(data) {
        const sharedFieldsData = data.filter(fieldData => {
            return this.getPersistedKeys().has(fieldData.key);
        });
        this.setSharedFieldsDataArray_(sharedFieldsData);
        this.setCachedFieldsDataArray_(data);
    }

    getLastFetchedTime() {
        return this.get("lastFetchedTime");
    }

    setLastFetchedTime(lastFetchedTime) {
        return this.set("lastFetchedTime", lastFetchedTime);
    }

    isPlaceholder() {
        return Boolean(this.get("isPlaceholder"));
    }

    getHeaderName() {
        throw Error("Unimplemented abstract method.");
    }

    getOwner() {
        const ownerId = this.getOwnerId();
        return ownerId ? quip.apps.getUserById(ownerId) : null;
    }

    getOwnerId() {
        return this.get("ownerId");
    }

    setOwnerId(ownerId) {
        this.set("ownerId", ownerId);
    }

    getLabelSingular() {
        return this.getType();
    }

    getType() {
        // TODO: Remove type for Jira once we have an alternative.
        throw Error("Unimplemented abstract method.");
    }

    getRecordId() {
        return this.get("recordId");
    }

    getSchema() {
        throw Error("Unimplemented abstract method.");
    }

    getClient() {
        throw Error("Unimplemented abstract method.");
    }

    isLoggedIn() {
        throw Error("Unimplemented abstract method.");
    }

    addField(key) {
        var fieldEntity = this.getField(key);
        if (fieldEntity) {
            return fieldEntity;
        }
        const fieldData = this.getFieldData(key);
        const schema = this.getSchema().fields[key];
        if (!fieldData || !schema) {
            return;
        }
        const type = schema.dataType;
        const isReadOnly = schema.calculated || !schema.updateable;
        let initialValue = parseFieldValue(fieldData.value, type);
        let defaultText;
        let value = initialValue;
        let recordClass;
        let extras;
        switch (type) {
            case "Currency":
            case "Double":
            case "Int":
            case "Percent": {
                recordClass = NumericFieldEntity;
                defaultText = Number.isFinite(initialValue)
                    ? initialValue.toString()
                    : "";
                if (defaultText === "" && !isReadOnly) {
                    value = {
                        RichText_placeholderText:
                            NumericFieldEntity.PLACEHOLDER_TEXT,
                    };
                } else {
                    value = {RichText_defaultText: defaultText};
                }
                break;
            }
            case "Phone":
            case "String":
            case "TextArea":
            case "Url": {
                recordClass = TextFieldEntity;
                defaultText = initialValue || "";
                if (defaultText === "" && !isReadOnly) {
                    value = {
                        RichText_placeholderText:
                            TextFieldEntity.PLACEHOLDER_TEXT,
                    };
                } else {
                    value = {RichText_defaultText: defaultText};
                }
                break;
            }
            case "Boolean": {
                recordClass = BooleanFieldEntity;
                break;
            }
            case "Picklist": {
                recordClass = EnumFieldEntity;
                extras = {
                    autoCompleteUrl: fieldData.autoCompleteUrl,
                    options: fieldData.options,
                    serverKey: fieldData.serverKey,
                };
                break;
            }
            case "MultiPicklist": {
                recordClass = MultipicklistEntity;
                extras = {
                    options: fieldData.options,
                };
                break;
            }
            case "Token": {
                recordClass = TokenFieldEntity;
                extras = {
                    autoCompleteUrl: fieldData.autoCompleteUrl,
                    options: fieldData.options,
                };
                break;
            }
            case "Reference": {
                recordClass = ReferenceFieldEntity;
                break;
            }
            case "Date": {
                recordClass = DateFieldEntity;
                break;
            }
            case "DateTime": {
                recordClass = DateTimeFieldEntity;
                break;
            }
            default: {
                return null;
            }
        }
        let field = {
            Record_class: recordClass,
            key: key,
            label: unescapeHTML(schema.label),
            originalValue: {
                "value": initialValue,
                "displayValue": fieldData.displayValue || initialValue,
            },
            value: value,
            type: type,
        };
        Object.assign(field, extras);
        this.get("fields").add(field);
        this.saveFieldPreferences();
        const metricArgs = {
            action: "added_field",
            record_type: this.getType(),
            field_key: key,
            fields_count: String(this.getFields().length),
        };
        quip.apps.recordQuipMetric(this.getMetricName(), metricArgs);
    }

    fetchData(isInitialMount) {
        if (!this.isPlaceholder() && quip.apps.isDocumentEditable()) {
            return this.fetchRecordId_(this.getRecordId());
        } else {
            return Promise.resolve();
        }
    }

    isDirty() {
        return this.getFields().some(entity => entity.isDirty());
    }

    save() {
        throw Error("Unimplemented abstract method.");
    }

    saveInProgress() {
        return false;
    }

    getErrorMessage() {
        return "";
    }

    getDemoText() {
        return null;
    }

    saveFieldPreferences() {}

    reload() {
        this.fetchRecordId_(this.getRecordId());
    }

    hasLoaded() {
        throw Error("Unimplemented abstract method.");
    }

    loadPlaceholderData(placeholderData) {
        throw Error("Unimplemented abstract method.");
    }

    openLink() {
        throw Error("Unimplemented abstract method.");
    }

    clearRecord() {
        this.getFields().forEach(field => field.remove(false));
        this.delete();
    }
}
