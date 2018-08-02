// Copyright 2017 Quip

import {parseFieldValue} from "../response-handler.js";
import {DefaultError, InvalidValueError} from "../error.js";
import {formatNumber, normalizeNewlines} from "../utils.jsx";

export class FieldEntity extends quip.apps.Record {
    static ID = "field";

    static getProperties() {
        return {
            key: "string",
            label: "string",
            serverKey: "string",
            type: "string",
        };
    }

    initialize() {
        this.domNode = undefined;
        this.listener_ = quip.apps
            .getRootEntity()
            .notifyListeners.bind(quip.apps.getRootEntity());
        this.listen(this.listener_);
        this.listenToComments(this.listener_);
        this.error_ = null;
        this.savedValue_ = null;
        this.hasSavedValue_ = false;
    }

    setSavedValue(savedValue) {
        this.savedValue_ = savedValue;
    }

    getSavedValue() {
        return this.savedValue_;
    }

    clearSavedValue() {
        this.savedValue_ = null;
    }

    hasSavedValue() {
        return this.hasSavedValue_;
    }

    setHasSavedValue(value) {
        this.hasSavedValue_ = value;
    }

    isModifiedAfterSaving() {
        if (this.isReadOnly()) {
            return false;
        }
        if (this.hasSavedValue()) {
            if (this.getValue() == null && this.savedValue_ == null)
                return true;
            else if (this.getValue() == null && this.savedValue_ != null)
                return false;
            else if (this.getValue() != null && this.savedValue_ == null)
                return false;
            else {
                if (typeof this.getValue() === "object" &&
                    typeof this.getSavedValue() === "object") {
                    return this.getValue().name != this.getSavedValue().name;
                } else {
                    return this.getValue() != this.getSavedValue();
                }
            }
        }
        return false;
    }

    getDom() {
        return this.domNode;
    }

    supportsComments() {
        return true;
    }

    isDirty() {
        if (this.isReadOnly()) {
            return false;
        }
        return !this.isValid();
    }

    getType() {
        return this.getSchema().dataType;
    }

    getKey() {
        return this.get("key");
    }

    getLabel() {
        return this.get("label");
    }

    getMaxLength() {
        return this.getSchema().length;
    }

    getOriginalValue() {
        throw Error("Unimplemented abstract method.");
    }

    setOriginalValue(originalValue) {
        throw Error("Unimplemented abstract method.");
    }

    getOriginalDisplayValue() {
        return this.getOriginalValue();
    }

    getSchema() {
        return this.getParentRecord().getSchema().fields[this.getKey()];
    }

    getValue() {
        throw Error("Unimplemented abstract method.");
    }

    setValue(value) {
        throw Error("Unimplemented abstract method.");
    }

    getDisplayValue() {
        return this.getValue();
    }

    getServerKey() {
        return this.get("serverKey") || this.getKey();
    }

    getServerValue() {
        return this.getValue();
    }

    isValid() {
        return true;
    }

    isReadOnly() {
        const fieldSchema = this.getSchema();
        if (fieldSchema === undefined) {
            throw "FieldSchema not loaded, key: " +
                this.getKey() +
                " type: " +
                this.getType();
        }
        return fieldSchema.calculated || !fieldSchema.updateable;
    }

    isRequired() {
        return this.getSchema().required;
    }

    hasSaveError() {
        return this.error_ !== null;
    }

    setError(error) {
        if (error && !(error instanceof DefaultError)) {
            this.error_ = new DefaultError("Could Not Connect.");
        } else {
            this.error_ = error;
        }
    }

    getError() {
        if (this.error_ && !(this.error_ instanceof DefaultError)) {
            this.error_ = new DefaultError("Could Not Connect.");
        }
        return this.error_;
    }

    clearFocus() {}

    focus() {}

    remove(recordMetric = true) {
        this.delete();
        if (recordMetric) {
            const record = this.getParentRecord();
            record.saveFieldPreferences();
            const metricArgs = {
                action: "removed_field",
                record_type: record.getType(),
                field_key: this.getKey(),
                fields_count: String(this.getParentRecord().getFields().length),
            };
            const metricName = record.getMetricName();
            quip.apps.recordQuipMetric(metricName, metricArgs);
        }
    }

    revertToOriginal() {
        this.setValue(this.getOriginalValue());
    }

    isEqualToObject(value) {
        return this.getValue() === value;
    }
}

export class TextFieldEntity extends FieldEntity {
    static ID = "textField";
    static PLACEHOLDER_TEXT = "Enter value";

    static getProperties() {
        const fieldProperties = super.getProperties();
        const ownProperties = {
            value: quip.apps.RichTextRecord,
            originalValue: "object",
        };
        return Object.assign(ownProperties, fieldProperties);
    }

    initialize() {
        super.initialize();
        if (this.get("value").listenToContent === undefined) {
            throw "listenToContent not defined. Is RichTextRecord: " +
                (this.get("value") instanceof quip.apps.RichTextRecord) +
                ", constructor.name: " +
                this.get("value").constructor.name;
        } else {
            this.get("value").listenToContent(() => {
                this.cachedRawValue_ = null;
                this.getRawValue();
            });
            this.get("value").listenToContent(this.listener_);
        }
    }

    getOriginalValue() {
        return this.get("originalValue").value;
    }

    getOriginalDisplayValue() {
        return this.get("originalValue").displayValue;
    }

    setOriginalValue(originalValue, originalDisplayValue) {
        this.set("originalValue", {
            value: originalValue,
            displayValue: originalDisplayValue || originalValue,
        });
    }

    getRawValue() {
        if (this.cachedRawValue_) {
            return this.cachedRawValue_;
        } else {
            let value = this.get("value")
                .getTextContent()
                .trimRight();
            // TODO just a hack since RichTextRecord doesn't return the
            // defaultText as its value until it's saved.
            if (value.includes("# Untitled")) {
                value = this.getOriginalValue();
            }
            // TODO, .getTextContent() returns placeholder value when set
            // remove when that's fixed.
            if (value === TextFieldEntity.PLACEHOLDER_TEXT) {
                value = "";
            }
            const type = this.getType();
            if (type === "Url") {
                const urlRegexp = /(?:\[.*\]\((.*?)\))/g;
                var matchedUrl = urlRegexp.exec(value);
                if (matchedUrl && matchedUrl[1]) {
                    // Strip http(s) protocol and trailing slash
                    value = matchedUrl[1]
                        .replace(/^https?:\/\//, "")
                        .replace(/\/$/, "");
                }
            }
            this.testing = value;
            return value;
        }
    }

    getValue() {
        return parseFieldValue(this.getRawValue(), this.getType());
    }

    setValue(value) {
        const richTextRecord = this.get("value");
        if (richTextRecord.replaceContent === undefined) {
            return;
        }
        const textValue = value !== null ? String(value) : "";
        richTextRecord.replaceContent(textValue);
    }

    clearFocus() {
        this.get("value").clearFocus();
    }

    focus() {
        this.get("value").focus();
    }

    isDirty() {
        if (super.isDirty()) {
            return true;
        }
        const originalValue = this.getOriginalValue();
        const currentValue = this.getValue();
        if (typeof originalValue === "string" &&
            typeof currentValue === "string") {
            return (
                normalizeNewlines(originalValue) !==
                normalizeNewlines(currentValue)
            );
        }
        return originalValue !== currentValue;
    }

    isValid() {
        const value = this.getRawValue();
        let valid;
        switch (this.getType()) {
            case "Phone":
            case "String":
            case "Url":
            case "Website":
            case "TextArea":
            case "Date": // For backwards compatibility where date was text.
                return true;
            default:
                valid = false;
                break;
        }

        if (!valid) {
            this.setError(new InvalidValueError("Invalid Value"));
        }
        return valid;
    }
}

export class NumericFieldEntity extends TextFieldEntity {
    static ID = "numericField";
    static PLACEHOLDER_TEXT = "Enter value";

    format() {
        const type = this.getType();
        if (type === "Percent") {
            const value = this.getValue() + "%";
            this.setValue(value);
        } else {
            const value = this.getValue();
            this.setValue(formatNumber(value));
        }
    }

    getCurrencySign() {
        if (this.getType() !== "Currency") {
            return null;
        }
        const displayValue = this.getOriginalDisplayValue();
        if (typeof displayValue === "string" && displayValue.length > 0) {
            return displayValue.charAt(0);
        }
        return null;
    }

    isValid() {
        const value = this.getValue();
        const valid = isFinite(value);
        if (!valid) {
            this.setError(new InvalidValueError("Invalid Value"));
        }
        return valid;
    }
}

export class BooleanFieldEntity extends FieldEntity {
    static ID = "booleanField";

    static getProperties() {
        const fieldProperties = super.getProperties();
        const ownProperties = {
            value: "boolean",
            originalValue: "object",
        };
        return Object.assign(ownProperties, fieldProperties);
    }

    getOriginalValue() {
        return this.get("originalValue").value;
    }

    setOriginalValue(originalValue) {
        this.set("originalValue", {value: originalValue});
    }

    getValue() {
        return this.get("value");
    }

    setValue(value) {
        this.set("value", value);
    }

    isDirty() {
        return super.isDirty() || this.getValue() !== this.getOriginalValue();
    }
}

export class EnumFieldEntity extends FieldEntity {
    static ID = "enumField";

    static getProperties() {
        const fieldProperties = super.getProperties();
        const ownProperties = {
            autoCompleteUrl: "string",
            options: "array",
            originalValue: "object",
            value: "object",
        };
        return Object.assign(fieldProperties, ownProperties);
    }

    getOriginalValue() {
        return this.get("originalValue").value;
    }

    getOriginalDisplayValue() {
        return this.getOriginalValue().name;
    }

    setOriginalValue(originalValue) {
        this.set("originalValue", {value: originalValue});
    }

    setValue(value) {
        this.set("value", value);
    }

    getValue() {
        return this.get("value");
    }

    getDisplayValue() {
        return this.getValue().name;
    }

    getServerValue() {
        return this.get("value").serverValue;
    }

    getOptions() {
        if (!this.optionsHasLoaded()) {
            return this.getParentRecord()
                .fetchOptions(this)
                .then(options => {
                    this.set("options", options);
                    return options;
                })
                .catch(error => {
                    // FIXME: setError here
                    throw error;
                });
        } else {
            return Promise.resolve(this.get("options"));
        }
    }

    getAutoCompleteUrl() {
        return this.get("autoCompleteUrl");
    }

    getTextRecord() {
        return this.get("textRecord");
    }

    optionsHasLoaded() {
        return !!this.get("options");
    }

    isDirty() {
        return (
            super.isDirty() ||
            this.getDisplayValue() !== this.getOriginalDisplayValue()
        );
    }

    isEqualToObject(value) {
        return this.getDisplayValue() === value.name;
    }
}

export class MultipicklistEntity extends FieldEntity {
    static ID = "multipicklist";

    static getProperties() {
        const fieldProperties = super.getProperties();
        const ownProperties = {
            originalValue: "object",
            value: "string",
            options: "array",
        };
        return Object.assign(fieldProperties, ownProperties);
    }

    getOriginalValue() {
        return this.get("originalValue").value;
    }

    getOriginalDisplayValue() {
        return this.getOriginalValue();
    }

    setOriginalValue(originalValue) {
        originalValue = {value: originalValue};
        this.set("originalValue", originalValue);
    }

    setValue(value) {
        this.set("value", value);
    }

    getValue() {
        return this.get("value");
    }

    getDisplayValue() {
        return this.getValue();
    }

    getOptions() {
        if (!this.optionsHasLoaded()) {
            return this.getParentRecord()
                .fetchOptions(this)
                .then(options => {
                    this.set("options", options);
                    return options;
                })
                .catch(error => {
                    // FIXME: setError here
                    throw error;
                });
        } else {
            return Promise.resolve(this.get("options"));
        }
    }

    optionsHasLoaded() {
        return !!this.get("options");
    }

    isDirty() {
        return this.getValue() != this.getOriginalValue();
    }
}

export class TokenFieldEntity extends EnumFieldEntity {
    static ID = "tokenField";

    getOriginalDisplayValue() {
        return this.getOriginalValue()
            .items.map(item => item.name)
            .sort()
            .join(", ");
    }

    getDisplayValue() {
        return this.getValue()
            .items.map(item => item.name)
            .sort()
            .join(", ");
    }

    getServerValue() {
        return this.get("value").items.map(item => item.serverValue);
    }
}

export class ReferenceFieldEntity extends FieldEntity {
    static ID = "referenceField";

    static getProperties() {
        const fieldProperties = super.getProperties();
        const ownProperties = {
            value: "string",
            originalValue: "object",
        };
        return Object.assign(ownProperties, fieldProperties);
    }

    getOriginalValue() {
        return this.get("originalValue").value;
    }

    setOriginalValue(originalValue, displayValue) {
        this.set("originalValue", {
            value: originalValue,
            displayValue: displayValue,
        });
    }

    getValue() {
        return this.get("value");
    }

    setValue(value) {
        this.set("value", value);
    }

    getDisplayValue() {
        return this.get("originalValue").displayValue;
    }

    isDirty() {
        return false;
    }
}

export class DateTimeFieldEntity extends FieldEntity {
    static ID = "dateTimeField";

    static getProperties() {
        const fieldProperties = super.getProperties();
        const ownProperties = {
            value: "string",
            originalValue: "object",
        };
        return Object.assign(ownProperties, fieldProperties);
    }

    getOriginalValue() {
        return this.get("originalValue").value;
    }

    setOriginalValue(originalValue, displayValue) {
        this.set("originalValue", {
            value: originalValue,
            displayValue: displayValue,
        });
    }

    getValue() {
        return this.get("value");
    }

    setValue(value) {
        this.set("value", value);
    }

    getDisplayValue() {
        return this.get("originalValue").displayValue;
    }

    isDirty() {
        return false;
    }
}

export class DateFieldEntity extends FieldEntity {
    static ID = "dateField";

    static getProperties() {
        const fieldProperties = super.getProperties();
        const ownProperties = {
            value: "string",
            originalValue: "object",
        };
        return Object.assign(ownProperties, fieldProperties);
    }

    getOriginalValue() {
        return this.get("originalValue").value;
    }

    setOriginalValue(originalValue, displayValue) {
        this.set("originalValue", {
            value: originalValue,
            displayValue: displayValue || originalValue,
        });
    }

    getValue() {
        return this.get("value");
    }

    setValue(value) {
        this.set("value", value);
    }

    getDisplayValue() {
        return this.get("originalValue").displayValue;
    }

    isDirty() {
        return false;
    }
}
