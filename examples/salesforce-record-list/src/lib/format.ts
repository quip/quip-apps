// Copyright 2019 Quip
import {DateTime} from "luxon";

function parseDate(string: string, formats = ["M/d/yyyy h:mma", "M/d/yyyy"]) {
    for (let i = 0; i < formats.length; i++) {
        const date = DateTime.fromFormat(string, formats[i]);
        if (date.isValid) {
            return date;
        }
    }
    return null;
}

function parseTime(string: string, formats = ["HH:mm:ss"]) {
    return parseDate(string, formats);
}

/**
 * All supported types should have both a validator and parser, which will be
 * used when editing values in input.tsx (and cell.tsx for special types).
 * Types that have a displayValue that should be updated client-side should also
 * provide a formatter, which will automatically update the client-side
 * displayValue when editing. For more details about displayValue, see:
 * https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_field_value.htm#ui_api_responses_field_value
 */

export const validators: Map<
    string,
    (input: string, ...args: any[]) => boolean
> = new Map();
export const parsers: Map<string, (input: string) => any> = new Map();
export const formatters: Map<string, (input: any) => string> = new Map();

validators.set("Boolean", str => str === "true" || str === "false");
parsers.set("Boolean", str => (str === "true" ? true : false));

validators.set("Currency", str => !isNaN(parseFloat(str)));
parsers.set("Currency", str => parseFloat(str));

validators.set("Date", str => parseDate(str) !== null);
parsers.set("Date", str => parseDate(str));
formatters.set("Date", date => DateTime.fromJSDate(date).toLocaleString());

validators.set("Double", str => !isNaN(parseFloat(str)));
parsers.set("Double", str => parseFloat(str));

const emailPattern = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
validators.set("Email", str => emailPattern.test(str));
parsers.set("Email", str => str);

const intPattern = /^\d+$/;
validators.set("Int", str => intPattern.test(str));
parsers.set("Int", str => parseInt(str, 10));

validators.set("Percent", str => !isNaN(parseFloat(str)));
parsers.set("Percent", str => parseFloat(str));

// Not super precise, but since phone numbers are just stored as strings on the
// salesforce side, assume all patterns that contain at least 8 numbers and some
// normal separators are valid.
const phonePattern = /^\+?[\d -/().]+/;
validators.set(
    "Phone",
    str => phonePattern.test(str) && str.replace(/[^\d]/g, "").length > 8);
parsers.set("Phone", str => str);

// Not getting fancy here, we'll need a set of valid options to validate.
validators.set("Picklist", (str, options) => options.has(str));
parsers.set("Picklist", str => str);

validators.set("String", str => str && str.length > 0);
parsers.set("String", str => str);

validators.set("TextArea", str => str && str.length > 0);
parsers.set("TextArea", str => str);

const timePattern = /\d{1,2}:\d{1,2}:\d{1,2}/;
validators.set("Time", str => timePattern.test(str));
parsers.set("Time", str => parseTime(str));
formatters.set("Time", date =>
    DateTime.fromJSDate(date).toLocaleString(DateTime.TIME_24_WITH_SECONDS)
);

const urlPattern = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
validators.set("Url", str => urlPattern.test(str));
parsers.set("Url", str => str);
