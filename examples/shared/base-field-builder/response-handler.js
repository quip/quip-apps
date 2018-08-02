// Copyright 2017 Quip

import {unescapeHTML} from "./utils.jsx";
import IntlPolyfill from "intl";
import {TypeNotSupportedError} from "../../shared/base-field-builder/error.js";

if (!global.Intl) {
    global.Intl = IntlPolyfill;
}

// TODO: Really this entire file belongs in /salesforce-record. Jira only uses
// parseFieldsData to initialize its Placeholder data and parseFieldValue which
// should be broken out into a util file.

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
            const relatedField = fields[relationshipName];
            if (!relatedField) {
                continue;
            }
            fieldData = {
                key: key,
                value: fields[key].value || null,
                displayValue:
                    unescapeHTML(relatedField.displayValue) ||
                    relatedField.value,
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

export function parseSchema(
    schema,
    fullLayoutFields,
    fieldSupportedFn,
    nameFieldSupportedFn) {
    // Filter nameFields to supported dataTypes
    schema.nameFields = schema.nameFields.filter(f =>
        nameFieldSupportedFn(schema.fields[f])
    );
    if (schema.nameFields.length === 0) {
        throw new TypeNotSupportedError(
            `In order for the ${schema.label} object to be used, it must ` +
                `have at least one "name" field with a supported type.`);
    }

    schema.hasLastViewedDate =
        "LastViewedDate" in schema.fields &&
        schema.fields["LastViewedDate"].dataType == "DateTime";

    const fieldSet = new Set(fullLayoutFields);

    // Note which name fields aren't included in the full layout and must be
    // fetched optionally.
    schema.extraFields = schema.nameFields.filter(f => {
        if (fieldSet.has(f)) {
            return false;
        }
        fieldSet.add(f);
        return true;
    });

    schema.unsupportedFields = Object.values(schema.fields)
        .filter(f => fieldSet.has(f.apiName) && !fieldSupportedFn(f))
        .reduce((fields, f) => {
            fields[f.apiName] = f;
            return fields;
        }, {});

    // Filter fields to those in fullLayout or name fields which will be fetched
    // fetched optionally -- with a supported dataType.
    schema.fields = Object.values(schema.fields)
        .filter(f => fieldSet.has(f.apiName) && fieldSupportedFn(f))
        .reduce((fields, f) => {
            fields[f.apiName] = f;
            return fields;
        }, {});

    schema.recordTypeId = schema.defaultRecordTypeId
        ? schema.defaultRecordTypeId
        : Object.keys(schema.recordTypeInfos)[0];

    return schema;
}

export function parseSoqlRecords(response, nameField) {
    if (!response.records) {
        throw response;
    }

    return response.records.map(record => {
        return {
            name: record[nameField],
            id: record.Id,
        };
    });
}

export function parseLayout(layout) {
    const layoutFields = {};
    layout.sections.forEach(section =>
        section.layoutRows.forEach(row =>
            row.layoutItems.forEach(item =>
                item.layoutComponents.forEach(component => {
                    if (component.componentType === "Field") {
                        layoutFields[component.apiName] = true;
                    }
                })
            )
        )
    );

    return Object.keys(layoutFields);
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
