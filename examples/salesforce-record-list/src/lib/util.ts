// Copyright 2019 Quip

import {DateTime} from "luxon";

// Utility for shuffling columns
export function immutableSwap(arr: any[], origin: number, destination: number) {
    arr = arr.slice();
    if (origin === destination) {
        return arr;
    }
    const item = arr[destination];
    arr[destination] = arr[origin];
    arr[origin] = item;
    return arr;
}

export function lastUpdatedString(time: number) {
    const lastFetchedTime = DateTime.fromMillis(time);
    let format = DateTime.DATETIME_SHORT;
    const yesterday = DateTime.local()
        .minus({days: 1})
        .endOf("day");
    if (lastFetchedTime > yesterday) {
        format = DateTime.TIME_SIMPLE;
    }
    return lastFetchedTime.toLocaleString(format);
}

/**
 * @type {RegExp}
 * @const
 */
const HTML_UNESCAPE_AMP_RE = /&amp;/g;
/**
 * @type {RegExp}
 * @const
 */
const HTML_UNESCAPE_LT_RE = /&lt;/g;
/**
 * @type {RegExp}
 * @const
 */
const HTML_UNESCAPE_GT_RE = /&gt;/g;

/**
 * Unescapes HTML entities in the input text.
 */
export function htmlUnescape(str: string) {
    if (str.indexOf("&") == -1) {
        return str;
    }
    str = str.replace(HTML_UNESCAPE_LT_RE, "<");
    str = str.replace(HTML_UNESCAPE_GT_RE, ">");
    str = str.replace(HTML_UNESCAPE_AMP_RE, "&");
    // can't const this since we're using exec
    const ascii_re = /&#(\d+);/;
    let match = null;
    // replace ascii char codes with matched characters
    while ((match = ascii_re.exec(str)) !== null) {
        str =
            str.slice(0, match.index) +
            String.fromCharCode(parseInt(match[1], 10)) +
            str.slice(match.index + match[0].length);
    }
    return str;
}

const listURLPattern = /https?:\/\/([^\.]+)\.lightning\.force\.com\/lightning\/o\/([^\/]+)\/list\b.*filterName=(\w+)/;

export function parseCreationUrl(url?: string) {
    if (!url) {
        return null;
    }
    const match = url.match(listURLPattern);
    if (!match) {
        return null;
    }
    return {site: match[1], type: match[2], id: match[3]};
}
