// Copyright 2017 Quip

const TAB = 9;
const ESCAPE = 27;

const TABBABLE_ELEMENT_SELECTOR = [
    "a[href]",
    "button",
    "[contenteditable]:not([contenteditable='false'])",
    "input",
    "select",
    "textarea",
]
    .map(
        tagName =>
            tagName + ":not([disabled]):not([tabindex^='-']):not(.a11y-skip)"
    )
    .concat(["[tabindex='0']:not([class*='a11y-hidden'])"])
    .join(", ");

export default function (e, record, tabToSiblingFocusableItem = false) {
    let next;

    if (e.keyCode === TAB) {
        if (e.shiftKey) {
            if (tabToSiblingFocusableItem) {
                next = findPrevFocusableElem_(record);
            }
            if (!next) {
                next = record.getPreviousSibling();
            }
            if (!next) {
                const records = record.getContainingList().getRecords();
                next = records[records.length - 1];
            }
        } else {
            if (tabToSiblingFocusableItem) {
                next = findNextFocusableElem_(record);
            }
            if (!next) {
                next = record.getNextSibling();
            }
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
        // Clear the focus of the record just in case it was focused before.
        if (next.clearFocus) {
            next.clearFocus();
        }
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

// Depends on implementation, sometimes there are nested div elements
// for a record's rich textbox DOMNode. However, record.focus()
// will only focus on one of them. When finding the previous focusable element,
// we need to skip all the elements for the rich textbox DOMNode.
function findPrevFocusableElem_(record) {
    const tabbableElems = [
        ...document.querySelectorAll(TABBABLE_ELEMENT_SELECTOR),
    ];
    const recordDom = record.getDom();
    if (!recordDom) {
        return null;
    }
    const recordElems = [
        ...recordDom.querySelectorAll(TABBABLE_ELEMENT_SELECTOR),
    ];
    for (let i = 0; i < tabbableElems.length; i++) {
        if (tabbableElems[i] === recordDom) {
            if (i > 0) {
                return tabbableElems[i - 1];
            }
        }
        if (recordElems.includes(tabbableElems[i])) {
            const index = tabbableElems.findIndex(
                item => item === recordElems[0]
            );
            if (index > 0) {
                return tabbableElems[index - 1];
            }
        }
    }

    return null;
}

function findNextFocusableElem_(record) {
    const tabbableElems = [
        ...document.querySelectorAll(TABBABLE_ELEMENT_SELECTOR),
    ];
    const recordDom = record.getDom();
    if (!recordDom) {
        return null;
    }
    const recordElems = [
        ...recordDom.querySelectorAll(TABBABLE_ELEMENT_SELECTOR),
    ];
    for (let i = 0; i < tabbableElems.length; i++) {
        if (tabbableElems[i] === recordDom) {
            if (i < tabbableElems.length - 1) {
                return tabbableElems[i + 1];
            }
        }
        if (recordElems.some(elem => elem === tabbableElems[i])) {
            const index = tabbableElems.findIndex(
                item => item === recordElems[recordElems.length - 1]
            );
            if (index < tabbableElems.length - 1) {
                return tabbableElems[index + 1];
            }
        }
    }

    return null;
}
