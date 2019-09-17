// Copyright 2019 Quip
const React = require("react");

/**
 * @fileoverview This is a shim for quip's internal translation mechanism - this
 * file acts both as a shim in legacy production environments where the quiptext
 * global does not exist, and a shim in test environments. Instead of relying on
 * a global, import this library explicitly and it will handle shimming when needed.
 */

function quiptext(text, placeholders) {
    if (text[text.length - 1] == "]" && text.lastIndexOf(" [") != -1) {
        // Remove translation comments
        text = text.substr(0, text.lastIndexOf(" ["));
    }
    const replaceAll = function(str, substr, replacement) {
        return str.replace(
            new RegExp(
                substr.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"),
                "g"
            ),
            replacement
        );
    };
    const localeReplace = function(text, placeholders) {
        for (const key in placeholders) {
            text = replaceAll(text, "%(" + key + ")s", placeholders[key]);
        }
        return text;
    };
    const reactLocaleReplace = function(text, placeholders) {
        let start;
        let expanded = [text];
        for (const key in placeholders) {
            start = expanded;
            expanded = [];
            for (let i = 0; i < start.length; i++) {
                if (typeof start[i] == "string") {
                    const keyStr = "%(" + key + ")s";
                    const parts = start[i].split(keyStr);
                    let replaced = [];
                    for (let j = 0; j < parts.length - 1; j++) {
                        replaced.push(parts[j]);
                        replaced.push(placeholders[key]);
                    }
                    replaced.push(parts[parts.length - 1]);
                    replaced = replaced.filter(function(str) {
                        return str != "";
                    });
                    expanded.push.apply(expanded, replaced);
                } else {
                    expanded.push(start[i]);
                }
            }
        }
        return expanded;
    };
    if (placeholders) {
        let hasReactElements = false;
        for (const key in placeholders) {
            const val = placeholders[key];
            if (typeof val !== "string" && React.isValidElement(val)) {
                hasReactElements = true;
                break;
            }
        }
        return hasReactElements
            ? reactLocaleReplace(text, placeholders)
            : localeReplace(text, placeholders);
    }
    return text;
}

module.exports = quiptext;
