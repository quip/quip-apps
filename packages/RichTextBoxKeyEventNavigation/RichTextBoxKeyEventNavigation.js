// Copyright 2017 Quip

const TAB = 9;

export default function(e, record) {
    let next;

    if (e.keyCode === TAB) {
        if (e.shiftKey) {
            next = record.getPreviousSibling();
            if (!next) {
                const records = record.getContainingList().getRecords();
                next = records[records.length - 1];
            }
        } else {
            next = record.getNextSibling();
            if (!next) {
                next = record.getContainingList().getRecords()[0];
            }
        }
    }

    if (next) {
        e.preventDefault();
        if (next.getRichTextRecord) {
            next = next.getRichTextRecord();
        }
        next.focus();
        return true;
    }
    return false;
}
