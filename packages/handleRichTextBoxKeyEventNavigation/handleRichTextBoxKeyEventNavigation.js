// Copyright 2017 Quip

const TAB = 9;
const ESCAPE = 27;

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
        // Clear the focus just in case it was focused before.
        next.clearFocus();
        next.focus();
        return true;
    }

    if (e.keyCode === ESCAPE) {
        for (var i = 0; i < e.path.length - 1; i++) {
            const node = e.path[i];
            const nextNode = e.path[i + 1];
            if (nextNode.id === "quip-element-root") {
                node.focus();
                return true;
            }
        }
    }
    return false;
}
