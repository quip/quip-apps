// Copyright 2019 Quip

import Record from "./record";

export default class RichTextRecord extends Record {
    public emptyValue: boolean = false;
    public placeholderTextValue: string = "";
    public textContentValue: string = "";

    static InlineStyle = {
        BOLD: 1,
        ITALIC: 2,
        UNDERLINE: 3,
        STRIKETHROUGH: 4,
        CODE: 5,
    };

    static Style = {
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

    clearContent() {}
    delete() {
        this.setDeleted();
    }
    empty() {
        return this.emptyValue;
    }
    focus(fromPrevious?: boolean) {}
    getPlaceholderText() {
        return this.placeholderTextValue;
    }
    getTextContent() {
        return this.textContentValue;
    }
    insertText(text: string) {}
    listenToContent(listener: (record: Record) => void) {}
    unlistenToContent(listener: (record: Record) => void) {}
    listenToSave(listener: (record: Record) => void) {}
    unlistenToSave(listener: (record: Record) => void) {}
    replaceContent(text: string) {}
    selectAll() {}
    setDeleted() {
        this.isDeletedValue = true;
    }
}
