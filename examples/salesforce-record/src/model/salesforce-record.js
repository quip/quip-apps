// Copyright 2017 Quip

import {RecordEntity} from "../../../shared/base-field-builder/model/record.js";
import {
    parseFieldsData,
    parseFieldValue,
} from "../../../shared/base-field-builder/response-handler.js";
import {
    DefaultError,
    FieldsCannotBeUpdatedError,
    InvalidValueError,
    BadRequestError,
} from "../../../shared/base-field-builder/error.js";

const FIELD_PREFERENCES_KEY = "initByFields";
const PERSISTED_KEYS = new Set(["Name", "FirstName", "LastName"]);
const SUPPORTED_FIELD_TYPES = [
    "Boolean",
    "Currency",
    "Date",
    "DateTime",
    "Double",
    "Int",
    "MultiPicklist",
    "Percent",
    "Picklist",
    "Phone",
    "Reference",
    "String",
    "TextArea",
    "Url",
];

export function fieldSupportedFn(field) {
    if (!SUPPORTED_FIELD_TYPES.includes(field.dataType)) {
        return false;
    }

    if (field.dataType === "TextArea") {
        return field.extraTypeInfo === "PlainTextArea";
    }

    return true;
}

export const SUPPORTED_NAME_FIELD_TYPES = ["String"];

export function nameFieldSupportedFn(field) {
    return SUPPORTED_NAME_FIELD_TYPES.includes(field.dataType);
}

export class SalesforceRecordEntity extends RecordEntity {
    static ID = "salesforceRecord";

    static getProperties() {
        const recordProperties = super.getProperties();
        const ownProperties = {
            schema: "object",
            typesToFields: "string",
        };
        return Object.assign(ownProperties, recordProperties);
    }

    initialize() {
        this.saveInProgress_ = false;
        this.error_ = null;
        this.cachedFieldsDataArray_ = [];
    }

    getDemoText() {
        const useSandbox = this.getParentRecord().useSandbox();
        if (useSandbox) {
            return quiptext("Using Sandbox");
        }
        return null;
    }

    saveFieldPreferences() {
        if (this.isPlaceholder()) {
            return;
        }
        const preferences = quip.apps.getUserPreferences();
        const initFieldsMap = JSON.parse(
            preferences.getForKey(FIELD_PREFERENCES_KEY) || "{}");
        const fieldKeys = this.getFields().map(field => {
            return field.getKey();
        });
        initFieldsMap[this.getType()] = fieldKeys;
        const newPreferences = {};
        const stringifiedFieldPreferences = JSON.stringify(initFieldsMap);
        newPreferences[FIELD_PREFERENCES_KEY] = stringifiedFieldPreferences;
        preferences.save(newPreferences);
        this.setTypesToFields(stringifiedFieldPreferences);
    }

    getSource() {
        return "Salesforce";
    }

    getMetricName() {
        return "salesforce_record";
    }

    getHeaderField() {
        const schema = this.getSchema();
        if (schema.nameFields.includes("Name")) {
            return "Name";
        }
        return schema.nameFields[0];
    }

    getHeaderName() {
        const field = this.getFieldData(this.getHeaderField());
        return (field && field.value) || quiptext("Unknown");
    }

    getLabelSingular() {
        return this.getSchema().label;
    }

    getType() {
        return this.getSchema().apiName;
    }

    setSchema(schema) {
        this.set("schema", schema);
    }

    getSchema() {
        return this.get("schema");
    }

    setTypesToFields(typesToFields) {
        this.set("typesToFields", typesToFields);
    }

    getTypesToFields() {
        return this.get("typesToFields");
    }

    getClient() {
        return this.getParentRecord().getClient();
    }

    isLoggedIn() {
        return this.getClient().isLoggedIn();
    }

    save() {
        this.clearError();
        this.saveInProgress_ = true;
        const updatedFields = {};

        let hasInvalidFields = false;
        this.getFields().forEach(field => {
            if (field.isDirty()) {
                if (!field.isValid()) {
                    hasInvalidFields = true;
                    field.setError(
                        new InvalidValueError(quiptext("Invalid Value")));
                }
                updatedFields[field.getKey()] = field.getServerValue();
            }
            field.setError(null);
        });

        if (hasInvalidFields) {
            this.saveInProgress_ = false;
            this.error_ = new InvalidValueError(
                quiptext("Some fields have invalid values"));
            return Promise.reject(this.error_);
        }

        return this.getClient()
            .updateRecord(this.getRecordId(), this.getSchema(), {
                fields: updatedFields,
            })
            .then(([fieldsDataArray, schema]) => {
                const metricArgs = {
                    action: "saved_record",
                    record_type: this.getType(),
                    fields_count: String(Object.keys(updatedFields).length),
                };
                const metricName = this.getMetricName();
                quip.apps.recordQuipMetric(metricName, metricArgs);

                this.error_ = null;
                this.saveInProgress_ = false;
                this.setSchema(schema);
                this.setFieldsDataArray(fieldsDataArray);
                this.setLastFetchedTime(Date.now());
                const failedFieldKeys = [];
                for (let fieldData of fieldsDataArray) {
                    const fieldEntity = this.getField(fieldData.key);
                    const type = schema.fields[fieldData.key].dataType;
                    const parsedValue = parseFieldValue(fieldData.value, type);

                    if (fieldEntity) {
                        if (fieldEntity.isDirty()) {
                            if (!fieldEntity.isEqualToObject(parsedValue)) {
                                fieldEntity.setError(
                                    new InvalidValueError(
                                        quiptext("Field Save Error")));
                                failedFieldKeys.push(fieldData.key);
                            }
                        } else {
                            fieldEntity.setValue(parsedValue);
                        }
                        fieldEntity.setOriginalValue(
                            parsedValue,
                            fieldData.displayValue);
                        if (fieldEntity.format) {
                            fieldEntity.format();
                        }
                    }
                }
                if (failedFieldKeys.length !== 0) {
                    throw new FieldsCannotBeUpdatedError(
                        quiptext("Some fields can not be updated"));
                }
            })
            .catch(error => {
                this.saveInProgress_ = false;
                if (error instanceof BadRequestError) {
                    this.setError(
                        new InvalidValueError(
                            quiptext("Invalid Value Provided")));
                } else {
                    this.setError(error);
                }
                throw this.getError();
            });
    }

    clearError() {
        this.error_ = null;
    }

    saveInProgress() {
        return this.saveInProgress_;
    }

    setError(error) {
        if (error && !(error instanceof DefaultError)) {
            this.error_ = new DefaultError(quiptext("Could Not Connect."));
        } else {
            this.error_ = error;
        }
    }

    clearCachedData() {
        this.error_ = null;
        this.saveInProgress_ = false;
        this.cachedFieldsDataArray_ = [];
    }

    getError() {
        if (this.error_ && !(this.error_ instanceof DefaultError)) {
            this.error_ = new DefaultError(quiptext("Could Not Connect."));
        }
        return this.error_;
    }

    fetchData(isInitialMount, isCreation) {
        if (!this.isPlaceholder()) {
            return this.fetchRecordId_(this.getRecordId()).then(
                fieldsDataArray => {
                    this.initFieldsFromPreferences_(isCreation).then(() => {
                        if (isInitialMount) {
                            // On initial mount, update the stored fields in case the data
                            // has been updated on the Salesforce end.
                            const fieldsDataArray = this.getFieldsDataArray();
                            this.updateFields_(fieldsDataArray);
                        }
                    });
                });
        }
        return Promise.resolve();
    }

    fetchRecordId_(recordId) {
        return this.getClient()
            .fetchRecordAndSchema(recordId, this.getSchema())
            .then(([fieldsDataArray, schema]) => {
                this.setSchema(schema);
                this.setFieldsDataArray(fieldsDataArray);
                this.setLastFetchedTime(Date.now());
                return fieldsDataArray;
            });
    }

    initFieldsFromPreferences_(isCreation) {
        let initFieldsMap;
        if (isCreation) {
            const preferences = quip.apps.getUserPreferences();
            initFieldsMap = JSON.parse(
                preferences.getForKey(FIELD_PREFERENCES_KEY) || "{}");
        } else {
            initFieldsMap = JSON.parse(this.getTypesToFields() || "{}");
        }
        let initFieldKeysP;
        if (initFieldsMap[this.getType()]) {
            initFieldKeysP = Promise.resolve(initFieldsMap[this.getType()]);
        } else {
            initFieldKeysP = this.getClient()
                .fetchLayoutFields(this.getType(), false)
                .catch(e => {
                    return [];
                });
        }

        return initFieldKeysP.then(initFieldKeys => {
            if (initFieldKeys.length === 0) {
                initFieldKeys.push(this.getHeaderField());
            }
            initFieldKeys.map(fieldKey => {
                this.addField(fieldKey);
            });
        });
    }

    updateFields_(fieldsDataArray) {
        const schema = this.getSchema();
        for (const fieldData of fieldsDataArray) {
            const fieldEntity = this.getField(fieldData.key);
            if (!fieldEntity) {
                continue;
            }
            const type = schema.fields[fieldData.key].dataType;
            const parsedValue = parseFieldValue(fieldData.value, type);
            if (!fieldEntity.isDirty()) {
                fieldEntity.setValue(parsedValue);
            }
            fieldEntity.setOriginalValue(parsedValue, fieldData.displayValue);
            if (fieldEntity.format) {
                fieldEntity.format();
            }
        }
    }

    hasLoaded() {
        return (
            (Boolean(this.getFieldsDataArray()) &&
                this.getFieldsDataArray().length != 0) ||
            (Boolean(this.getSharedFieldsDataArray_()) &&
                this.getSharedFieldsDataArray_().length != 0)
        );
    }

    updateOwnerIdWithCurrentViewerId() {
        const currentViewerId = quip.apps.getViewingUser().getId();
        this.setOwnerId(currentViewerId);
    }

    loadPlaceholderData(placeholderData) {
        const schema = placeholderData.schema;
        this.setSchema(schema);
        const fieldsDataArray = parseFieldsData(
            placeholderData.fieldsData,
            schema);

        this.setFieldsDataArray(fieldsDataArray);
        for (let key of placeholderData.fieldsOrder) {
            this.addField(key);
        }
    }

    openLink() {
        const recordId = this.getRecordId();
        const instanceUrl = this.getParentRecord().getInstanceUrl();
        const url = this.getClient().salesforceUrl(instanceUrl, recordId);
        quip.apps.openLink(url);
    }

    getPersistedKeys() {
        return PERSISTED_KEYS;
    }

    fieldSupported(field) {
        return fieldSupportedFn(field);
    }

    fetchOptions(field) {
        if (!this.getSchema().fields[field.getKey()].picklistOptions) {
            const recordType = this.getType();
            const recordTypeId = this.getSchema().recordTypeId;
            const fieldApiName = field.getKey();
            return this.getClient()
                .fetchPicklistOptions(recordType, recordTypeId, fieldApiName)
                .then(values => {
                    let retValues;
                    if (field.isRequired() ||
                        field.getType() === "MultiPicklist") {
                        retValues = values;
                    } else {
                        retValues = [
                            {
                                id: "Select…",
                                name: quiptext("Select…"),
                                serverValue: "",
                                isEmpty: true,
                            },
                            ...values,
                        ];
                    }
                    this.getSchema().fields[
                        field.getKey()
                    ].picklistOptions = retValues;
                    return retValues;
                });
        }

        return Promise.resolve(
            this.getSchema().fields[field.getKey()].picklistOptions);
    }
}
