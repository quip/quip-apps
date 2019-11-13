// Copyright 2017 Quip

import {JiraDatasource} from "../datasource.js";
import {RecordEntity} from "../../../shared/base-field-builder/model/record.js";
import {
    parseFieldsData,
    parseFieldValue,
} from "../../../shared/base-field-builder/response-handler.js";
import {
    DefaultError,
    BadRequestError,
    InvalidValueError,
} from "../../../shared/base-field-builder/error.js";

import moment from "moment";

export const BLANK_STATE_FIELDS = [
    {key: "issuetype", name: quiptext("Issue Type")},
    {key: "summary", name: quiptext("Summary")},
    {key: "assignee", name: quiptext("Assignee")},
    {key: "priority", name: quiptext("Priority")},
    {key: "status", name: quiptext("Status")},
    {key: "updated", name: quiptext("Updated")},
];
export const PLACEHOLDER_STATE_FIELDS = [
    {key: "issuetype", name: quiptext("Issue Type")},
    {key: "summary", name: quiptext("Summary")},
    {key: "priority", name: quiptext("Priority")},
    {key: "status", name: quiptext("Status")},
];
const WHITELISTED_FIELDS = {
    "assignee": "Picklist",
    "components": "Token",
    "created": "Date",
    "creator": "Picklist",
    "description": "String",
    "environment": "String",
    "epicLink": "Picklist",
    "fixVersions": "Token",
    "issuelinks": "Token",
    "issuetype": "Picklist",
    "labels": "Token",
    "lastViewed": "Date",
    "priority": "Picklist",
    "reporter": "Picklist",
    "resolution": "Picklist",
    "resolutiondate": "Date",
    "sprint": "Picklist",
    "status": "Picklist",
    "summary": "String",
    "updated": "Date",
    "versions": "Token",
};

const WHITELISTED_CUSTOM_FIELDS = {
    "com.pyxis.greenhopper.jira:gh-epic-link": "epicLink",
    "com.pyxis.greenhopper.jira:gh-sprint": "sprint",
};

const SUPPORTED_FIELD_TYPES = [
    "Boolean",
    "Currency",
    "Date",
    "Double",
    "Picklist",
    "Int",
    "Percent",
    "Phone",
    "String",
    "TextArea",
    "Token",
    "Url",
];

const PERSISTED_KEYS = new Set(["key", "issuetype"]);

const DATE_FORMAT = "MM/D/YYYY, h:mm A";

export class JiraRecordEntity extends RecordEntity {
    static ID = "jiraRecord";

    static getProperties() {
        const fieldProperties = super.getProperties();
        const ownProperties = {
            schema: "object",
            firstLoad: "boolean",
        };
        return Object.assign(ownProperties, fieldProperties);
    }

    initialize() {
        this.domNode = undefined;
        this.jiraClient_ = new JiraDatasource(quip.apps.auth("jira-oauth1"));
        this.cachedFieldsDataArray_ = [];
        this.saveInProgress_ = false;
        this.error_ = null;
        this.showError_ = false;
    }

    getSource() {
        return "Jira";
    }

    getMetricName() {
        return "jira";
    }

    getHeaderName() {
        if (this.hasLoaded()) {
            return this.getFieldData("key").value || "";
        } else {
            return "";
        }
    }

    getType() {
        if (this.hasLoaded()) {
            return this.getFieldData("issuetype").value.name;
        } else {
            return "";
        }
    }

    getSchema() {
        return this.get("schema");
    }

    isOwner() {
        return this.getOwnerId() === quip.apps.getViewingUser().getId();
    }

    fetchData(isInitialMount) {
        if (!this.isPlaceholder()) {
            return super.fetchData();
        } else {
            return Promise.resolve();
        }
    }

    fetchRecordId_(recordId) {
        const recordPromise = this.jiraClient_.fetchRecord(recordId, {
            expand: "editmeta,names,schema,transitions",
        });

        const isReadOnlyInstance = this.getParentRecord().isReadOnlyInstance();

        const issueLinkPromise = this.getParentRecord().fetchIssueLinkTypes(
            this.jiraClient_);

        return Promise.all([recordPromise, issueLinkPromise])
            .then(responses => {
                const response = responses[0];
                if (this.isOwner()) {
                    let schema = {fields: {}};
                    for (let key in response.schema) {
                        // Populated if the custom field has a type that matches
                        // one of our supported types.
                        const customType = response.schema[key]["custom"];
                        const customKey =
                            customType && WHITELISTED_CUSTOM_FIELDS[customType];
                        // Internal key is what we want to call this field. For
                        // most types it is the same as the server. For custom
                        // types we assign a custom name in order to identify
                        // it.
                        const internalKey = customKey || key;
                        if (internalKey in WHITELISTED_FIELDS) {
                            const updateable =
                                !isReadOnlyInstance &&
                                (key in response.editmeta.fields ||
                                    key === "status");
                            schema.fields[internalKey] = {
                                calculated: false,
                                dataType: WHITELISTED_FIELDS[internalKey],
                                label: response.names[key],
                                apiName: internalKey,
                                originalKey: customKey ? key : null,
                                updateable: updateable,
                                wrappedType: response.schema[key].items,
                            };
                        }
                    }
                    this.set("schema", schema);
                }
                const schemaFields = this.getSchema().fields;
                const fieldsDataArray = [];
                fieldsDataArray.push({key: "key", value: response.key});
                for (let key in schemaFields) {
                    if (key.startsWith("issuelinks") && key !== "issuelinks") {
                        // These keys aren't really part of the schema. They are
                        // artificially created by us. Don't process them.
                        continue;
                    }

                    let value;
                    let extras = {};
                    switch (schemaFields[key].dataType) {
                        case "Date":
                            value = response.fields[key];
                            value = value
                                ? moment(value).format(DATE_FORMAT)
                                : value;
                            break;
                        case "Token":
                            value = this.parseArray_(
                                response.fields[key],
                                schemaFields[key].wrappedType);
                            this.updateOptions(
                                recordId,
                                schemaFields,
                                response.editmeta,
                                response.transitions,
                                key,
                                extras);
                            break;
                        case "Picklist":
                            const originalKey = schemaFields[key].originalKey;
                            if (originalKey) {
                                switch (response.schema[originalKey].custom) {
                                    case "com.pyxis.greenhopper.jira:gh-epic-link":
                                        value = this.parseEpicLink_(
                                            response.fields[originalKey]);
                                        extras["options"] = null;
                                        extras["serverKey"] = originalKey;
                                        break;
                                    case "com.pyxis.greenhopper.jira:gh-sprint":
                                        value = this.parseSprint_(
                                            response.fields[originalKey]);
                                        extras["options"] = null;
                                        extras["serverKey"] = originalKey;
                                        break;
                                }
                            } else {
                                switch (response.schema[key].type) {
                                    case "user":
                                        value = this.parseUserObject_(
                                            response.fields[key]);
                                        break;
                                    default:
                                        value = this.parseGenericObject_(
                                            response.fields[key]);
                                        break;
                                }
                                this.updateOptions(
                                    recordId,
                                    schemaFields,
                                    response.editmeta,
                                    response.transitions,
                                    key,
                                    extras);
                            }
                            break;
                        default:
                            value = response.fields[key];
                            break;
                    }
                    const createFieldData = (key, value) => {
                        const fieldData = {key: key, value: value};
                        Object.assign(fieldData, extras);
                        fieldsDataArray.push(fieldData);
                    };
                    if (key === "issuelinks") {
                        // Issue links are a special type that need to be broken
                        // up into separate fields due to our design.
                        responses[1].forEach(type => {
                            const createLinkData = (key, value, label, all) => {
                                const pieces = key.split("_");
                                const items = value.items.filter(item => {
                                    const outward = pieces[2] === "outward";
                                    return (
                                        pieces[1] === item.type &&
                                        (all || outward === item.outward)
                                    );
                                });
                                // We create a new copy entry in the schema for
                                // each new field we create.
                                schemaFields[key] = Object.assign(
                                    {},
                                    schemaFields["issuelinks"]);
                                schemaFields[key]["label"] = `${
                                    response.names["issuelinks"]
                                } - ${label}`;
                                schemaFields[key]["shortLabel"] = `${label} - ${
                                    response.names["issuelinks"]
                                }`;
                                createFieldData(key, {items: items});
                            };
                            const all = type.inward === type.outward;
                            // In the case of "relates to", inward and outward
                            // are not differentiated.
                            let updatedKey = `${key}_${type.id}_inward`;
                            createLinkData(updatedKey, value, type.inward, all);
                            if (!all) {
                                updatedKey = `${key}_${type.id}_outward`;
                                createLinkData(
                                    updatedKey,
                                    value,
                                    type.outward,
                                    all);
                            }
                        });
                    } else {
                        createFieldData(key, value);
                    }
                }
                this.setLastFetchedTime(Date.now());
                this.setFieldsDataArray(fieldsDataArray);
                if (!this.get("firstLoad")) {
                    BLANK_STATE_FIELDS.forEach(field => {
                        this.addField(field.key);
                    });
                    this.set("firstLoad", true);
                }
                return fieldsDataArray;
            })
            .then(fieldsDataArray => {
                if (this.isOwner()) {
                    // Fetch additional agile information.
                    for (let fieldData of fieldsDataArray) {
                        if (fieldData.key === "epicLink") {
                            const fieldEntity = this.getField(fieldData.key);
                            if (fieldEntity) {
                                // Clear out options because they may have
                                // changed. Remounting will refetch them.
                                fieldEntity.set("options", null);
                            }
                            if (fieldData.value.id !== "none") {
                                this.jiraClient_
                                    .fetchEpic(fieldData.value.id)
                                    .then(response => {
                                        // Update name and save the changes.
                                        fieldData.value.name =
                                            response.name ||
                                            fieldData.value.name;
                                        const schema = this.getSchema();
                                        this.updateField_(
                                            fieldEntity,
                                            fieldData,
                                            schema);
                                    });
                            }
                        } else if (fieldData.key === "sprint") {
                            const fieldEntity = this.getField(fieldData.key);
                            if (fieldEntity) {
                                // Clear out options because they may have
                                // changed. Remounting will refetch them.
                                fieldEntity.set("options", null);
                            }
                        }
                    }
                }
                return fieldsDataArray;
            });
    }

    updateOptions(recordId, schemaFields, editmeta, transitions, key, extras) {
        if (schemaFields[key].updateable) {
            let options;
            if (key === "status") {
                // Status is an awkward parameter that is updated in a different
                // way. It does not show up in the editmeta payload.
                options = transitions;
            } else {
                if (editmeta.fields[key]) {
                    options = editmeta.fields[key].allowedValues || [];
                } else {
                    options = [];
                }
            }
            options = options.map(option =>
                key === "status"
                    ? this.parseTransitionObject_(option)
                    : this.parseGenericObject_(option)
            );
            extras.options = options;
            if (key in editmeta.fields) {
                extras.autoCompleteUrl = editmeta.fields[key].autoCompleteUrl;
                if (key === "labels") {
                    extras.autoCompleteUrl = extras.autoCompleteUrl.replace(
                        "labels/suggest?",
                        `labels/${recordId}/suggest.json?`);
                }
            }
        }
    }

    parseTransitionObject_(field) {
        // Transition ids are different from the
        // actual id of the status.
        return {
            id: field && field.to ? field.to.id : "",
            name: field ? field.name : "",
            serverValue: {id: field ? field.id : ""},
        };
    }

    parseEpicLink_(field) {
        return {
            id: field ? field : "none",
            name: field ? field : quiptext("None"),
            serverValue: field,
        };
    }

    parseSprint_(field) {
        let content = {};
        if (field && field.length > 0) {
            const start = field[0].indexOf("[");
            const end = field[0].lastIndexOf("]");
            if (start !== -1 && end !== -1 && end > start + 1) {
                field[0]
                    .substring(start + 1, end)
                    .split(",")
                    .forEach(item => {
                        const pair = item.split("=");
                        content[pair[0]] = pair[1];
                    });
            }
        }
        return {
            id: content["id"] || "none",
            name: content["name"] || quiptext("None"),
            serverValue: content["id"],
        };
    }

    parseUserObject_(field) {
        return {
            id: field ? field.name : "",
            name: field ? field.displayName : "",
            serverValue: {name: field ? field.name : ""},
        };
    }

    parseIssueLinks_(field) {
        const outward = field.outwardIssue;
        const inward = field.inwardIssue;
        return {
            id: field.id,
            name: outward ? outward.key : inward.key,
            outward: outward ? true : false,
            serverValue: outward ? outward.key : inward.key,
            type: field.type.id,
        };
    }

    parseLabelObject_(field) {
        return {
            id: field,
            name: field,
            serverValue: field,
        };
    }

    parseGenericObject_(field) {
        return {
            id: field ? field.id : "",
            name: field ? field.name : "",
            serverValue: {id: field ? field.id : ""},
        };
    }

    parseArray_(field, type) {
        return {
            items: field.map(item => {
                switch (type) {
                    case "string":
                        return this.parseLabelObject_(item);
                    case "issuelinks":
                        return this.parseIssueLinks_(item);
                    default:
                        return this.parseGenericObject_(item);
                }
            }),
        };
    }

    clearSavedValueForFields() {
        this.getFields().map(field => {
            field.clearSavedValue();
            field.setHasSavedValue(false);
        });
    }

    save(fields = this.getFields()) {
        this.clearError();
        const updatedFields = {};
        let epicLink;
        let sprint;
        let issueLinks = [];
        fields.forEach(field => {
            if (field.isDirty()) {
                if (field.getKey() === "epicLink" && !field.getServerValue()) {
                    epicLink = field;
                } else if (field.getKey() === "sprint" &&
                    !field.getServerValue()) {
                    sprint = field;
                } else if (field.getKey().startsWith("issuelinks")) {
                    const pieces = field.getKey().split("_");
                    const updatedLinks = field.getServerValue().map(value => {
                        const outward = pieces[2] === "outward";
                        return {
                            type: {id: pieces[1]},
                            inwardIssue: {
                                key: outward ? this.getHeaderName() : value,
                            },
                            outwardIssue: {
                                key: outward ? value : this.getHeaderName(),
                            },
                        };
                    });
                    const originalLinks = field.getOriginalValue();
                    const key = field.getKey();
                    issueLinks.push({updatedLinks, originalLinks, key});
                } else {
                    updatedFields[
                        field.getServerKey()
                    ] = field.getServerValue();
                }
            }
            field.setSavedValue(field.getValue());
            field.setHasSavedValue(true);
        });

        let promises = [];
        if (epicLink) {
            this.saveInProgress_ = true;
            promises.push(this.clearEpicLink_());
        }
        if (sprint) {
            this.saveInProgress_ = true;
            promises.push(this.clearSprint_());
        }
        if (issueLinks.length > 0) {
            this.saveInProgress_ = true;
            promises = promises.concat(
                issueLinks.map(issueLink => this.linkIssues_(issueLink)));
        }

        if ("status" in updatedFields) {
            this.saveInProgress_ = true;
            promises.push(this.updateTransition_(updatedFields["status"]));
            delete updatedFields["status"];
        }

        if (Object.keys(updatedFields).length > 0) {
            this.saveInProgress_ = true;
            promises.push(this.updateFields_(updatedFields));
        }
        return Promise.all(promises)
            .then(() => {
                if (this.saveInProgress_) {
                    this.reloadAndUpdateFields();
                }
                this.saveInProgress_ = false;
            })
            .catch(error => {
                if (error instanceof BadRequestError) {
                    this.setError(
                        new InvalidValueError(
                            quiptext("Invalid value provided")));
                } else {
                    this.setError(error);
                }
                this.saveInProgress_ = false;
            });
    }

    setError(error) {
        if (error && !(error instanceof DefaultError)) {
            this.error_ = new DefaultError(quiptext("Could Not Connect."));
        } else {
            this.error_ = error;
        }
    }

    getError() {
        if (this.error_ && !(this.error_ instanceof DefaultError)) {
            this.error_ = new DefaultError(quiptext("Could Not Connect."));
        }
        return this.error_;
    }

    clearError() {
        this.error_ = null;
        this.showError_ = false;
    }

    // In record list, either global error or record errors will be shown
    // If this.showError_ == true, the global error will be suppressed
    // and record error will be shown
    setShowError(showError) {
        this.showError_ = showError;
    }

    getShowError() {
        return this.showError_;
    }

    saveInProgress() {
        return this.saveInProgress_;
    }

    clearSprint_() {
        return this.jiraClient_
            .clearSprint(this.getRecordId())
            .then(response => {
                this.replaceField("sprint");
            });
    }

    clearEpicLink_() {
        return this.jiraClient_
            .clearEpicLink(this.getRecordId())
            .then(response => {
                this.replaceField("epicLink");
            });
    }

    linkIssues_(issueLinks) {
        const originalLinks = issueLinks.originalLinks;
        const updatedLinks = issueLinks.updatedLinks;
        const linking = Promise.all(
            updatedLinks
                .filter(
                    updatedLink =>
                        !originalLinks.items.find(
                            item => item.name === updatedLink.outwardIssue.key))
                .map(issueLink => this.jiraClient_.linkIssues(issueLink)));

        const deleting = Promise.all(
            originalLinks.items
                .filter(
                    originalLink =>
                        !updatedLinks.find(
                            updatedLink =>
                                updatedLink.outwardIssue.key ===
                                originalLink.name))
                .map(originalLink =>
                    this.jiraClient_.deleteLink(originalLink.id)
                ));

        return Promise.all([linking, deleting]).then(response => {
            this.replaceField(issueLinks.key);
        });
    }

    updateTransition_(value) {
        return this.jiraClient_
            .transitionRecord(this.getRecordId(), value)
            .then(response => {
                this.replaceField("status");
            });
    }

    replaceField(key) {
        if (this.isOwner()) {
            const fieldEntity = this.getField(key);
            const fieldData = this.getFieldData(key);
            fieldData.value = fieldEntity.getValue();
            fieldEntity.setOriginalValue(fieldData.value);
        } else {
            const fieldEntity = this.getField(key);
            fieldEntity.setOriginalValue(fieldEntity.getValue());
        }
    }

    updateFields_(updatedFields) {
        return this.jiraClient_
            .updateRecord(this.getRecordId(), updatedFields)
            .then(response => {
                // Jira returns us a 204 response code with no body. If there is
                // no error, we assume all fields have been saved.
                if (this.isOwner()) {
                    for (let fieldData of this.getFieldsDataArray()) {
                        const fieldEntity = this.getField(fieldData.key);
                        if (fieldEntity &&
                            fieldEntity.isDirty() &&
                            fieldData.key in updatedFields) {
                            fieldData.value = fieldEntity.getValue();
                            fieldEntity.setOriginalValue(fieldData.value);
                        }
                    }
                } else {
                    for (let fieldEntity of this.getFields()) {
                        if (fieldEntity &&
                            fieldEntity.isDirty() &&
                            fieldEntity.getKey() in updatedFields) {
                            fieldEntity.setOriginalValue(
                                fieldEntity.getValue());
                        }
                    }
                }
            });
    }

    reloadAndUpdateFields() {
        return this.fetchRecordId_(this.getRecordId()).then(fieldsDataArray => {
            for (let fieldData of fieldsDataArray) {
                const fieldEntity = this.getField(fieldData.key);
                const schema = this.getSchema();
                this.updateField_(fieldEntity, fieldData, schema);
                if (fieldEntity) {
                    // When refreshing, it is possible that the options have
                    // updated, we need to clear any existing options or
                    // autocomplete.
                    if (fieldData.autoCompleteUrl) {
                        fieldEntity.set(
                            "autoCompleteUrl",
                            fieldData.autoCompleteUrl);
                    }
                    if (fieldData.options) {
                        fieldEntity.set("options", fieldData.options);
                    }
                }
            }
        });
    }

    updateField_(fieldEntity, fieldData, schema) {
        if (fieldEntity) {
            const type = schema.fields[fieldData.key].dataType;
            const parsedValue = parseFieldValue(fieldData.value, type);
            if (!fieldEntity.isDirty()) {
                fieldEntity.setValue(parsedValue);
            }
            fieldEntity.setOriginalValue(parsedValue);
        }
    }

    isDirty() {
        return this.hasSchemaLoaded() && super.isDirty();
    }

    isLoading() {
        return false;
    }

    hasLoaded() {
        if (this.isPlaceholder()) {
            return this.getFields().length === PLACEHOLDER_STATE_FIELDS.length;
        } else {
            return (
                this.hasSchemaLoaded() &&
                ((Boolean(this.getFieldsDataArray()) &&
                    this.getFieldsDataArray().length != 0) ||
                    (Boolean(this.getSharedFieldsDataArray_()) &&
                        this.getSharedFieldsDataArray_().length != 0))
            );
        }
    }

    hasSchemaLoaded() {
        return (
            this.getSchema() &&
            this.getSchema().fields &&
            Object.keys(this.getSchema().fields).length > 0
        );
    }

    getClient() {
        return this.jiraClient_;
    }

    isLoggedIn() {
        return this.getClient().isLoggedIn();
    }

    getPersistedKeys() {
        return PERSISTED_KEYS;
    }

    fieldSupported(field) {
        if (!SUPPORTED_FIELD_TYPES.includes(field.dataType)) {
            return false;
        }

        if (field.dataType === "TextArea") {
            return field.extraTypeInfo === "PlainTextArea";
        }

        return true;
    }

    openLink() {
        const issueId = this.getHeaderName();
        const url = this.getClient().getIssueUrl(issueId);
        quip.apps.openLink(url);
    }

    loadPlaceholderData(record, schema) {
        this.set("schema", schema);
        const fieldsDataArray = parseFieldsData(record.fieldsData, schema);
        fieldsDataArray.forEach(fieldsData => {
            if (schema.fields[fieldsData.key].dataType === "Picklist") {
                // Add dummy options
                fieldsData.options = [""];
            }
        });
        this.setFieldsDataArray(fieldsDataArray);
    }

    supportsComments() {
        return true;
    }

    getDom() {
        return this.domNode;
    }

    fetchOptions(field) {
        return this.getParentRecord().fetchOptions(this.jiraClient_, field);
    }
}
