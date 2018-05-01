// Copyright 2017 Quip

import {RecordEntity} from "../../../shared/base-field-builder/model/record.js";
import {ResponseHandler} from "../../../shared/base-field-builder/response-handler.js";
import {
    DefaultError,
    TypeNotSupportedError,
    FieldsCannotBeUpdatedError,
    InvalidValueError,
    BadRequestError,
} from "../../../shared/base-field-builder/error.js";

// Source:
// http://www.fishofprey.com/2011/09/obscure-salesforce-object-key-prefixes.html
export const RECORD_PREFIX_TYPE = {
    "001": "Account",
    "500": "Case",
    "003": "Contact",
    "00Q": "Lead",
    "006": "Opportunity",
};

const FIELD_PREFERENCES_KEY = "initByFields";
const BLANK_STATE_FIELDS = {
    "Account": [
        "Name",
        "Combo Sector",
        "BillingCity",
        "Employees",
        "edw_num_licenses__c",
    ],
    "Opportunity": ["Name", "CloseDate"],
    "Contact": ["Title", "FirstName", "LastName", "PhoneExtension__c"],
    "Lead": ["Trial_Expiry__c", "FirstName", "LastName"],
};
const PERSISTED_KEYS = new Set(["Name", "FirstName", "LastName"]);

const SUPPORTED_FIELD_TYPES = [
    "Boolean",
    "Currency",
    "Date",
    "DateTime",
    "Double",
    "Int",
    "Percent",
    "Picklist",
    "Phone",
    "Reference",
    "String",
    "TextArea",
    "Url",
];

export class SalesforceRecordEntity extends RecordEntity {
    static ID = "salesforceRecord";

    static getProperties() {
        const recordProperties = super.getProperties();
        const ownProperties = {
            type: "string",
        };
        return Object.assign(ownProperties, recordProperties);
    }

    initialize() {
        // On record creation
        if (this.getType() === undefined) {
            try {
                this.initTypeFromRecordId_(this.getRecordId());
            } catch (e) {
                // Show record type not supported in the UI
                return;
            }
            if (!this.isPlaceholder()) {
                const preferences = quip.apps.getUserPreferences();
                const initFieldsMap = JSON.parse(
                    preferences.getForKey(FIELD_PREFERENCES_KEY) || "{}");
                const initFieldKeys =
                    initFieldsMap[this.getType()] ||
                    BLANK_STATE_FIELDS[this.getType()];
                this.fetchData().then(() => {
                    initFieldKeys.map(fieldKey => {
                        this.addField(fieldKey);
                    });
                });
            }
        }
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
        newPreferences[FIELD_PREFERENCES_KEY] = JSON.stringify(initFieldsMap);
        preferences.save(newPreferences);
    }

    getSource() {
        return "Salesforce";
    }

    getMetricName() {
        return "salesforce_record";
    }

    getHeaderName() {
        const type = this.getType();
        if (type == "Account" || type == "Opportunity") {
            return this.getFieldData("Name").value || "";
        } else if (type == "Contact" || type == "Lead") {
            return (
                (this.getFieldData("FirstName").value || "") +
                " " +
                (this.getFieldData("LastName").value || "")
            );
        }
        return "Unknown";
    }

    getType() {
        return this.get("type");
    }

    setType(type) {
        this.set("type", type);
    }

    getSchema() {
        return this.getParentRecord().getSchemaForType(this.getType());
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
            .updateRecord(this.getRecordId(), {fields: updatedFields})
            .then(response => {
                const schema = this.getSchema();
                return ResponseHandler.parseFieldsData(response, schema);
            })
            .then(fieldsDataArray => {
                const metricArgs = {
                    action: "saved_record",
                    record_type: this.getType(),
                    fields_count: String(Object.keys(updatedFields).length),
                };
                const metricName = this.getMetricName();
                quip.apps.recordQuipMetric(metricName, metricArgs);

                this.setLastFetchedTime(Date.now());
                this.error_ = null;
                this.saveInProgress_ = false;
                this.setFieldsDataArray(fieldsDataArray);
                const schema = this.getSchema();
                const failedFieldKeys = [];
                for (let fieldData of fieldsDataArray) {
                    const fieldEntity = this.getField(fieldData.key);
                    const type = schema.fields[fieldData.key].dataType;
                    const parsedValue = ResponseHandler.parseFieldValue(
                        fieldData.value,
                        type);

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

    updateFields_(fieldsDataArray) {
        const schema = this.getSchema();
        for (let fieldData of fieldsDataArray) {
            const fieldEntity = this.getField(fieldData.key);
            if (!fieldEntity) {
                continue;
            }
            const type = schema.fields[fieldData.key].dataType;
            const parsedValue = ResponseHandler.parseFieldValue(
                fieldData.value,
                type);
            if (!fieldEntity.isDirty()) {
                fieldEntity.setValue(parsedValue);
            }
            fieldEntity.setOriginalValue(parsedValue, fieldData.displayValue);
            if (fieldEntity.format) {
                fieldEntity.format();
            }
        }
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

    initTypeFromRecordId_(recordId) {
        const recordIdPrefix = recordId.substring(0, 3);
        const type = RECORD_PREFIX_TYPE[recordIdPrefix];
        if (type) {
            this.setType(type);
        } else {
            this.error_ = new TypeNotSupportedError(
                quiptext("Record type not supported"),
                recordId);
            throw this.error_;
        }
    }

    fetchData() {
        if (!this.isPlaceholder()) {
            return this.fetchRecordId_(this.getRecordId());
        } else {
            return Promise.resolve();
        }
    }

    fetchRecordId_(recordId) {
        return this.getClient()
            .fetchRecord(recordId)
            .then(response => {
                const schema = this.getSchema();
                return ResponseHandler.parseFieldsData(response, schema);
            })
            .then(fieldsDataArray => {
                this.setFieldsDataArray(fieldsDataArray);
                this.setLastFetchedTime(Date.now());
                this.updateFields_(fieldsDataArray);
            });
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

    loadPlaceholderData(placeholerData) {
        const schema = this.getSchema();
        const fieldsDataArray = ResponseHandler.parseFieldsData(
            placeholerData.fieldsData,
            schema).then(fieldsDataArray => {
            this.setFieldsDataArray(fieldsDataArray);
            for (let key of placeholerData.fieldsOrder) {
                this.addField(key);
            }
        });
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

    suppertedFieldTypes() {
        return SUPPORTED_FIELD_TYPES;
    }

    fetchOptions(field) {
        if (!this.getSchema().fields[field.getKey()].picklistOptions) {
            const recordType = this.getType();
            const recordTypeId = this.getSchema().recordTypeId;
            const fieldApiName = field.getKey();
            return this.getClient()
                .fetchPicklistOptions(recordType, recordTypeId, fieldApiName)
                .then(response =>
                    ResponseHandler.parsePicklistOptions(response)
                )
                .then(values => {
                    let retValues;
                    if (field.isRequired()) {
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
        } else {
            return Promise.resolve(
                this.getSchema().fields[field.getKey()].picklistOptions);
        }
    }
}
