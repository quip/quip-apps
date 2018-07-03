// Copyright 2017 Quip

import ListenerRecord from "./lib/listenerRecord";
import {PropTypes} from "react";
const colors = quip.apps.ui.ColorMap;

export const COLUMN_TYPE = {
    PERSON: "person",
    STATUS: "status",
    DATE: "date",
    FILE: "file",
    TEXT: "text",
    CUSTOM: "custom",
};

export const COLUMN_TYPE_LABELS = {
    [COLUMN_TYPE.PERSON]: quiptext("Person"),
    [COLUMN_TYPE.STATUS]: quiptext("Status"),
    [COLUMN_TYPE.DATE]: quiptext("Date"),
    [COLUMN_TYPE.FILE]: quiptext("File"),
    [COLUMN_TYPE.TEXT]: quiptext("Text"),
    [COLUMN_TYPE.CUSTOM]: quiptext("Custom"),
};

export const toJSONPropTypeShape = arrayOrObj => {
    return PropTypes.shape({
        id: PropTypes.number.isRequired,
        data: PropTypes[arrayOrObj].isRequired,
    }).isRequired;
};

export const X_DELETE_MARGIN = 8;
export const X_SIZE = 8;
export const COMMENT_TRIGGER_MAKEUP = 20;
export const CARD_HORIZONTAL_PADDING = 12;

export class StatusTypeRecord extends ListenerRecord {
    static CONSTRUCTOR_KEY = "table-view-status-type";

    static getProperties = () => ({
        text: "string",
        color: "object",
    });

    getText() {
        return this.get("text");
    }

    getColor() {
        return this.get("color");
    }
}

export class ColumnRecord extends ListenerRecord {
    static CONSTRUCTOR_KEY = "table-view-column";

    static getProperties = () => ({
        name: "string",
        type: "string",
        contents: quip.apps.RichTextRecord,
        visible: "boolean",
        draggable: "boolean",
        titleEditable: "boolean",
        deletable: "boolean",
        statusTypes: quip.apps.RecordList.Type(StatusTypeRecord),
    });

    static getDefaultProperties = () => ({
        visible: true,
        draggable: true,
        titleEditable: true,
        deletable: true,
        statusTypes: [],
    });

    toJSON() {
        return {
            name: this.getName(),
            type: this.getType(),
            contents: this.getContents(),
            visible: this.isVisible(),
            draggable: this.isDraggable(),
            titleEditable: this.isTitleEditable(),
            deletable: this.isDeletable(),
            statusTypes: this.getStatusTypes(),
        };
    }

    seed() {
        this.addStatusType(quiptext("Upcoming"), colors.BLUE);
        this.addStatusType(quiptext("In Progress"), colors.YELLOW);
        this.addStatusType(quiptext("Complete"), colors.GREEN);
    }

    removeStatusType(id) {
        this.getStatusById(id).delete();
    }

    changeStatusText(id, text) {
        this.getStatusById(id).set("text", text);
    }

    changeStatusColor(id, color) {
        this.getStatusById(id).set("color", color);
    }

    addStatusType(text, color) {
        return this.get("statusTypes").add({text, color});
    }

    getStatusTypes() {
        return this.get("statusTypes");
    }

    getStatuses() {
        return this.get("statusTypes").getRecords();
    }

    getStatusById(id) {
        return this.getStatuses().find(s => s.getId() === id);
    }

    getContents() {
        return this.get("contents");
    }

    getName() {
        return this.get("name");
    }

    getType() {
        return this.get("type");
    }

    isVisible() {
        return this.get("visible");
    }

    isDraggable() {
        return this.get("draggable");
    }

    isTitleEditable() {
        return this.get("titleEditable");
    }

    isDeletable() {
        return this.get("deletable");
    }

    getCells() {
        return this.getParentRecord()
            .getRows()
            .map(row => {
                return row.getCell(this);
            });
    }
}

export class RowRecord extends ListenerRecord {
    static CONSTRUCTOR_KEY = "table-view-row";

    static getProperties = () => ({
        // Theres no polymorphism so each type needs to be its own record list
        // that are tracked by a combination of column id and type
        [COLUMN_TYPE.TEXT]: quip.apps.RecordList.Type(TextRecord),
        [COLUMN_TYPE.PERSON]: quip.apps.RecordList.Type(PersonRecord),
        [COLUMN_TYPE.STATUS]: quip.apps.RecordList.Type(StatusRecord),
        [COLUMN_TYPE.DATE]: quip.apps.RecordList.Type(DateRecord),
        [COLUMN_TYPE.FILE]: quip.apps.RecordList.Type(FileRecord),
        [COLUMN_TYPE.CUSTOM]: quip.apps.RecordList.Type(CustomRecord),
    });

    static getDefaultProperties = () => ({
        [COLUMN_TYPE.TEXT]: [],
        [COLUMN_TYPE.PERSON]: [],
        [COLUMN_TYPE.STATUS]: [],
        [COLUMN_TYPE.DATE]: [],
        [COLUMN_TYPE.FILE]: [],
        [COLUMN_TYPE.CUSTOM]: [],
    });

    getCell(column) {
        return this.get(column.get("type"))
            .getRecords()
            .find(cell => cell.get("columnId") === column.getId());
    }

    addCell(column, data) {
        return this.get(column.get("type")).add(
            Object.assign({}, data, {
                columnId: column.getId(),
            }));
    }
}

export class CellRecord extends ListenerRecord {
    getColumn() {
        const columnId = this.get("columnId");
        return this.getParentRecord()
            .getParentRecord()
            .getColumns()
            .find(c => c.getId() === columnId);
    }

    supportsComments() {
        return true;
    }

    setDom(node) {
        this.domNode = node;
    }

    getDom() {
        return this.domNode;
    }
}

export class CustomRecord extends CellRecord {
    static CONSTRUCTOR_KEY = "table-view-custom";

    static getProperties = () => ({
        columnId: "string",
        contents: "object",
    });
}

export class TextRecord extends CellRecord {
    static CONSTRUCTOR_KEY = "table-view-text";

    static getProperties = () => ({
        columnId: "string",
        contents: quip.apps.RichTextRecord,
    });

    static getDefaultProperties = () => ({
        contents: {},
    });
}

export class PersonRecord extends CellRecord {
    static CONSTRUCTOR_KEY = "table-view-owner";

    static getProperties = () => ({
        columnId: "string",
        // This is a record list so that we can handle different users adding
        // and removing people simultaneously
        users: quip.apps.RecordList.Type(UserRecord),
    });

    static getDefaultProperties = () => ({
        users: [],
    });

    addUser(user) {
        if (!quip.apps.getUserById(user.id())) {
            quip.apps.addWhitelistedUser(user.getId());
            const callback = () => {
                this.get("users").add({user: user.getId()});
                quip.apps.removeEventListener(
                    quip.apps.EventType.WHITELISTED_USERS_LOADED,
                    callback);
            };
            quip.apps.addEventListener(
                quip.apps.EventType.WHITELISTED_USERS_LOADED,
                callback);
        } else {
            this.get("users").add({user: user.getId()});
        }
    }

    removeUser(user) {
        const userRecord = this.get("users")
            .getRecords()
            .find(u => u.getUserId() === user.getId());
        if (userRecord) {
            userRecord.delete();
        }
    }

    getUsers() {
        return this.get("users")
            .getRecords()
            .map(user => user.getUser());
    }
}

export class StatusRecord extends CellRecord {
    static CONSTRUCTOR_KEY = "table-view-status";

    static getProperties = () => ({
        columnId: "string",
        currentStatusId: "string",
    });

    setStatus(id) {
        this.set("currentStatusId", id);
    }

    getColumnId() {
        return this.get("columnId");
    }

    getStatus() {
        return this.get("currentStatusId");
    }

    clearStatus() {
        this.clear("currentStatusId");
    }
}

export class DateRecord extends CellRecord {
    static CONSTRUCTOR_KEY = "table-view-date";

    static getProperties = () => ({
        columnId: "string",
        date: "number",
    });

    getDate() {
        return this.get("date");
    }

    setDate(ms) {
        this.set("date", ms);
    }

    clearDate() {
        this.clear("date");
    }
}

export class FileRecord extends CellRecord {
    static CONSTRUCTOR_KEY = "table-view-file";

    static getProperties = () => ({
        columnId: "string",
        blobId: "string",
    });

    setBlob(id) {
        this.set("blobId", id);
    }

    getBlob() {
        return this.get("blobId");
    }

    removeBlob() {
        this.clear("blobId");
    }
}

// This is not a cell but is used by the PersonRecord
export class UserRecord extends ListenerRecord {
    static CONSTRUCTOR_KEY = "table-view-user";

    static getProperties = () => ({
        user: "string",
    });

    getUserId() {
        return this.get("user");
    }

    getUser() {
        return quip.apps.getUserById(this.getUserId());
    }
}

export const toJSON = record => {
    const acc = {};
    if (!record.getData && !record.getRecords) return record;
    acc.id = record.getId();
    if (record.toJSON) {
        // Defer to the custom serialize function.
        Object.assign(acc, record.toJSON());
    } else if (record.getData) {
        const data = record.getData();
        Object.keys(data).forEach(key => {
            acc[key] = toJSON(data[key]);
        });
    } else if (record.getRecords) {
        const records = record.getRecords();
        acc.data = records.map(r => toJSON(r));
    }
    return acc;
};
