// Copyright 2019 Quip

const Record = require("./record");

class RichTextRecord extends Record {
    constructor(...args) {
        super(...args);
        this.values.empty = false;
        this.values.placeholderText = "";
        this.values.textContent = "";
    }
    clearContent() {}
    delete() {
        this.setDeleted();
    }
    empty() {
        return this.values.empty;
    }
    focus() {}
    getPlaceholderText() {
        return this.values.placeholderText;
    }
    getTextContent() {
        return this.values.textContent;
    }
    insertText() {}
    listenToContent() {}
    unlistenToContent() {}
    replaceContent() {}
    selectAll() {}
    setDeleted() {
        this.values.isDeleted = true;
    }
}

RichTextRecord.InlineStyle = {
    BOLD: 1,
    ITALIC: 2,
    UNDERLINE: 3,
    STRIKETHROUGH: 4,
    CODE: 5,
};

RichTextRecord.Style = {
    TEXT_PLAIN: 1,
    TEXT_H1: 2,
    TEXT_H2: 3,
    TEXT_H3: 4,
    TEXT_CODE: 5,
    TEXT_BLOCKQUOTE: 6,
    TEXT_PULL_QUOTE: 7,
    LIST_BULLET: 8,
    LIST_NUMBERED: 9,
    LIST_CHECKLIST: 10,
    HORIZONTAL_RULE: 11,
    IMAGE: 12,
};

module.exports = RichTextRecord;
