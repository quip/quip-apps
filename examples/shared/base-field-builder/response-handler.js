// Copyright 2017 Quip

import {unescapeHTML} from "./utils.jsx";
import IntlPolyfill from "intl";

if (!global.Intl) {
    global.Intl = IntlPolyfill;
}

export function parsePicklistOptions(response) {
    if (response && response.values && response.values.length > 0) {
        const values = response.values.map(item => {
            const label = unescapeHTML(item.label);
            return {
                id: item.value,
                name: label,
                serverValue: item.value,
            };
        });
        return values;
    }

    throw new Error(); // Add Error
}

export function parseFieldsData(response, schema) {
    const fields = response.fields;
    const schemaFields = schema.fields;
    const fieldsDataArray = [];
    let fieldData;
    for (let key in schemaFields) {
        if (!fields[key]) {
            continue;
        }
        if (schemaFields[key].dataType === "Reference") {
            const relationshipName = schemaFields[key].relationshipName;
            if (relationshipName) {
                if (!fields[relationshipName]) {
                    continue;
                }
            }
            fieldData = {
                key: key,
                value: fields[key].value || null,
                displayValue:
                    unescapeHTML(fields[relationshipName].displayValue) ||
                    fields[relationshipName].value,
            };
        } else {
            let value = fields[key].value
                ? unescapeHTML(fields[key].value)
                : null;
            if (typeof fields[key].value == typeof true) {
                value = fields[key].value;
            }
            if (schemaFields[key].dataType === "Picklist") {
                if (value) {
                    value = {
                        id: value,
                        name: value,
                        serverValue: value,
                    };
                } else {
                    value = {
                        id: "Select…",
                        name: quiptext("Select…"),
                        serverValue: "",
                        isEmpty: true,
                    };
                }
            }
            fieldData = {
                key: key,
                value: value,
                displayValue: fields[key].displayValue,
            };
        }
        fieldsDataArray.push(fieldData);
    }

    return fieldsDataArray;
}

export function parseListViews(response, recordType) {
    if (!response || !response.records) {
        throw new Error();
    }

    return response.records.map(listView => ({
        label: listView.Name,
        key: listView.DeveloperName,
        describeUrl: `sobjects/${recordType}/listviews/${listView.Id}/describe`,
        id: listView.Id,
    }));
}

export function parseSchema(response) {
    const keys = new Set([
        "calculated",
        "dataType",
        // Extra type info is required for differentiating between
        // TextArea types
        "extraTypeInfo",
        "label",
        "length",
        "precision",
        "referenceToInfos",
        "relationshipName",
        "required",
        "scale",
        "updateable",
    ]);
    const schema = {};
    schema.themeInfo = response.themeInfo;
    const fields = {};
    for (let fieldKey in response.fields) {
        const field = {};
        for (let metadataKey in response.fields[fieldKey]) {
            if (keys.has(metadataKey)) {
                field[metadataKey] =
                    response.fields[fieldKey][metadataKey] || null;
            }
        }
        fields[fieldKey] = field;
    }
    schema.fields = fields;
    if (response.defaultRecordTypeId) {
        schema.recordTypeId = response.defaultRecordTypeId;
    } else {
        schema.recordTypeId = Object.keys(response.recordTypeInfos)[0];
    }

    return schema;
}

export function parseSoqlRecords(response, getNameField) {
    if (!response.records) {
        throw response;
    }

    return response.records.map(record => {
        const recordType = record.attributes.type;
        const nameField = getNameField(recordType);
        return {
            name: record[nameField],
            id: record.Id,
        };
    });
}

function parseFloatWithLocale(value, locale = "en-US") {
    const example = Intl.NumberFormat(locale).format("1.1");
    const cleanPattern = new RegExp(`[^-+0-9${example.charAt(1)}]`, "g");
    const cleaned = value.replace(cleanPattern, "");
    const normalized = cleaned.replace(example.charAt(1), ".");
    return parseFloat(normalized);
}

export function parseFieldValue(value, type) {
    switch (type) {
        case "Int": {
            if (value === null) {
                return null;
            } else {
                const parsedValue = parseFloatWithLocale(value);
                return Number.parseInt(parsedValue, 10) || null;
            }
        }
        case "Currency":
        case "Double": {
            if (value === null) {
                return null;
            } else {
                return parseFloatWithLocale(value) || null;
            }
        }
        case "Percent": {
            if (value === null) {
                return null;
            } else {
                let percentValue = value;
                if (value.slice(-1) === "%") {
                    percentValue = value.slice(0, -1);
                }
                return Number.parseInt(percentValue, 10) || null;
            }
        }
        case "String": {
            if (value) {
                return unescapeHTML(value);
            } else {
                return "";
            }
        }
        case "Boolean": {
            if (typeof value == typeof true) {
                return value;
            } else {
                return value === "true";
            }
        }
        default: {
            return value || null;
        }
    }
}
