// Copyright 2017 Quip
import {
    COLUMN_TYPE as TABLE_VIEW_COLUMN_TYPE,
    COLUMN_TYPE_LABELS,
    ColumnRecord,
    DateRecord,
    FileRecord,
    PersonRecord,
    RowRecord,
    StatusRecord,
    StatusTypeRecord,
    TextRecord,
    UserRecord,
} from "../../shared/table-view/model.js";
import debounce from "lodash.debounce";
const colors = quip.apps.ui.ColorMap;

export const COLUMN_TYPE = (({PERSON, STATUS, DATE, FILE, TEXT}) => ({
    PERSON,
    STATUS,
    DATE,
    FILE,
    TEXT,
}))(TABLE_VIEW_COLUMN_TYPE);

const COLUMN_NAME = {
    PROJECT: "project",
};

const DEFAULT_ROW = {
    [COLUMN_NAME.PROJECT]: {
        contents: {RichText_placeholderText: quiptext("New Project")},
    },
};

export class RootRecord extends quip.apps.RootRecord {
    static CONSTRUCTOR_KEY = "Root";
    static DATA_VERSION = 2;

    static getProperties = () => ({
        columns: quip.apps.RecordList.Type(ColumnRecord),
        rows: quip.apps.RecordList.Type(RowRecord),
        widths: "object",
    });

    static getDefaultProperties = () => ({
        columns: [],
        rows: [],
        widths: {},
    });

    constructor(...args) {
        super(...args);
        const _notifyListeners = this.notifyListeners;
        this.notifyListeners = debounce(() => _notifyListeners.call(this), 50);
    }

    seed() {
        const seedColumns = [
            {
                name: COLUMN_NAME.PROJECT,
                type: COLUMN_TYPE.TEXT,
                contents: {
                    RichText_defaultText: quiptext("Project"),
                    RichText_placeholderText:
                        COLUMN_TYPE_LABELS[COLUMN_TYPE.TEXT],
                },
                draggable: false,
                deletable: false,
            },
            {
                type: COLUMN_TYPE.PERSON,
                contents: {
                    RichText_defaultText: quiptext("Owner"),
                    RichText_placeholderText:
                        COLUMN_TYPE_LABELS[COLUMN_TYPE.PERSON],
                },
            },
            {
                type: COLUMN_TYPE.STATUS,
                contents: {
                    RichText_defaultText: quiptext("Status"),
                    RichText_placeholderText:
                        COLUMN_TYPE_LABELS[COLUMN_TYPE.STATUS],
                },
            },
            {
                type: COLUMN_TYPE.DATE,
                contents: {
                    RichText_defaultText: quiptext("Deadline"),
                    RichText_placeholderText:
                        COLUMN_TYPE_LABELS[COLUMN_TYPE.DATE],
                },
            },
            {
                type: COLUMN_TYPE.FILE,
                contents: {
                    RichText_defaultText: quiptext("Attachment"),
                    RichText_placeholderText:
                        COLUMN_TYPE_LABELS[COLUMN_TYPE.FILE],
                },
            },
        ];

        seedColumns.forEach(column => this.addColumn(column));
        [...Array(3)].forEach(() => this.addRow());

        this.setDataVersion(RootRecord.DATA_VERSION);
    }

    // We found a case where a Project Tracker had null value where one
    // of it's cells should have been which was causing it to fail to
    // initialize. This function scans the RootRecord looking for cases
    // where cells or missing and replaces them.
    checkAndRepairNullCells() {
        this.getColumns().map((col, ci) => {
            col.getCells().map((cell, ri) => {
                if (!cell) {
                    this.getRows()[ri].addCell(
                        col,
                        Object.assign({columnId: col.getId()}));
                }
            });
        });
    }

    getColumns() {
        return this.get("columns").getRecords();
    }

    getColumnById(id) {
        return this.getColumns().find(s => s.getId() === id);
    }

    getRows() {
        return this.get("rows").getRecords();
    }

    addColumn(data, index) {
        if (typeof data === "string") {
            data = {
                type: COLUMN_TYPE[data],
                contents: {
                    RichText_placeholderText:
                        COLUMN_TYPE_LABELS[COLUMN_TYPE[data]],
                },
            };
        }
        const column = this.get("columns").add(data, index);
        column.seed();
        this.getRows().forEach(row => row.addCell(column));
        return column;
    }

    addRow(data = DEFAULT_ROW) {
        const row = this.get("rows").add({});
        this.getColumns().forEach(column => {
            const columnName = column.get("name");
            const cellData = data[columnName] || {};
            row.addCell(column, cellData);
        });
        return row;
    }

    setDom(node) {
        if (!node) return;
        this.domNode = node;
    }

    getDom() {
        return this.domNode;
    }
}

export default () => {
    [
        RootRecord,
        StatusTypeRecord,
        ColumnRecord,
        RowRecord,
        TextRecord,
        PersonRecord,
        StatusRecord,
        DateRecord,
        FileRecord,
        UserRecord,
    ].forEach(c => quip.apps.registerClass(c, c.CONSTRUCTOR_KEY));
};
