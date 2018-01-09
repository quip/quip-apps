// Copyright 2017 Quip

import {DATE_FORMAT} from "./model/field.js";
import {unescapeHTML} from "./utils.jsx";
import moment from "moment";
import IntlPolyfill from "intl";
import en from "intl/locale-data/jsonp/en.js";

if (!global.Intl) {
    global.Intl = IntlPolyfill;
}

export class ResponseHandler {
    static parsePicklistOptions(response) {
        return new Promise(function(resolve, reject) {
            if (response && response.values && response.values.length > 0) {
                const values = response.values.map(item => {
                    const label = unescapeHTML(item.label);
                    return {
                        id: item.value,
                        name: label,
                        serverValue: item.value,
                    };
                });
                resolve(values);
            } else {
                reject(new Error()); // Add Error
            }
        });
    }

    static parseFieldsData(response, schema) {
        return new Promise(function(resolve, reject) {
            const fields = response.fields;
            const schemaFields = schema.fields;
            const fieldsDataArray = [];
            let hasParseError = false;
            let errorMessage;
            for (let key in schemaFields) {
                if (!fields[key]) {
                    continue;
                }
                let value = fields[key].value
                    ? unescapeHTML(fields[key].value)
                    : null;
                if (schemaFields[key].dataType === "Picklist") {
                    if (value) {
                        value = {id: value, name: value, serverValue: value};
                    } else {
                        value = {
                            id: "Select…",
                            name: "Select…",
                            serverValue: "",
                            isEmpty: true,
                        };
                    }
                }
                const fieldData = {
                    key: key,
                    value: value,
                    displayValue: fields[key].displayValue,
                };
                fieldsDataArray.push(fieldData);
                if (hasParseError) {
                    reject(errorMessage);
                }
            }
            resolve(fieldsDataArray);
        });
    }

    static parseBatchFieldsData(response, schema) {
        // TODO handle actual batch response
        return this.parseFieldsData(response.results[0].result, schema);
    }

    static parseListViews(response, recordType) {
        return new Promise(function(resolve, reject) {
            if (!response || !response.records) {
                reject();
            } else {
                const listViews = response.records;
                const result = listViews.map(listView => {
                    return {
                        label: listView.Name,
                        key: listView.DeveloperName,
                        describeUrl: `sobjects/${recordType}/listviews/${listView.Id}/describe`,
                        id: listView.Id,
                    };
                });
                resolve(result);
            }
        });
    }

    static parseListViewsDescribe(response) {
        return new Promise(function(resolve, reject) {
            resolve(response.query);
        });
    }

    static parseSchema(response) {
        return new Promise(function(resolve, reject) {
            const keys = new Set([
                "calculated",
                "dataType",
                "label",
                "length",
                "precision",
                "scale",
                "updateable",
                "required",
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
            resolve(schema);
        });
    }

    static parseRelatedLists(response) {
        return new Promise(function(resolve, reject) {
            if (response.layouts && response.layouts.length > 0) {
                const relatedLists = response.layouts[0].relatedLists;
                const result = relatedLists.map(relatedList => {
                    return {
                        label: relatedList.label,
                        key: relatedList.sobject,
                    };
                });
                resolve(result);
            } else {
                reject(response);
            }
        });
    }

    static parseSoqlRecords(response) {
        return new Promise(function(resolve, reject) {
            if (response.records) {
                const result = response.records.map(record => {
                    const recordType = record.attributes.type;
                    let name;
                    if (recordType === "Case") {
                        name = record.Subject;
                    } else {
                        name = record.Name;
                    }
                    return {
                        name: name,
                        id: record.Id,
                    };
                });
                resolve(result);
            } else {
                reject(response);
            }
        });
    }

    static parseFloatWithLocale(value, locale = "en-US") {
        const example = Intl.NumberFormat(locale).format("1.1");
        const cleanPattern = new RegExp(`[^-+0-9${example.charAt(1)}]`, "g");
        const cleaned = value.replace(cleanPattern, "");
        const normalized = cleaned.replace(example.charAt(1), ".");
        return parseFloat(normalized);
    }

    static parseFieldValue(value, type) {
        switch (type) {
            case "Int": {
                if (value === null) {
                    return null;
                } else {
                    const parsedValue = this.parseFloatWithLocale(value);
                    return Number.parseInt(parsedValue, 10) || null;
                }
            }
            case "Currency":
            case "Double": {
                if (value === null) {
                    return null;
                } else {
                    return this.parseFloatWithLocale(value) || null;
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
                return value || false;
            }
            case "Date": {
                return value ? moment(value).format(DATE_FORMAT) : "";
            }
            default: {
                return value || null;
            }
        }
    }
}
