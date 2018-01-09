// Copyright 2017 Quip
import {
    COLUMN_TYPE as TABLE_VIEW_COLUMN_TYPE,
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

const titleCase = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const COLUMN_TYPE = (({ PERSON, STATUS, DATE, FILE, TEXT }) => ({
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
        contents: { RichText_placeholderText: "New Project" },
    },
};

export class RootRecord extends quip.apps.RootRecord {
    static CONSTRUCTOR_KEY = "Root";

    static getProperties = () => ({
        columns: quip.apps.RecordList.Type(ColumnRecord),
        statusTypes: quip.apps.RecordList.Type(StatusTypeRecord),
        rows: quip.apps.RecordList.Type(RowRecord),
        widths: "object",
    });

    static getDefaultProperties = () => ({
        columns: [],
        statusTypes: [],
        rows: [],
        widths: {},
    });

    constructor(...args) {
        super(...args);
        const _notifyListeners = this.notifyListeners;
        this.notifyListeners = debounce(() => _notifyListeners.call(this), 50);
    }

    seed() {
        this.addStatusType("Upcoming", colors.BLUE);
        this.addStatusType("In Progress", colors.YELLOW);
        this.addStatusType("Complete", colors.GREEN);

        const seedColumns = [
            {
                name: COLUMN_NAME.PROJECT,
                type: COLUMN_TYPE.TEXT,
                contents: {
                    RichText_defaultText: "Project",
                    RichText_placeholderText: titleCase(COLUMN_TYPE.TEXT),
                },
                draggable: false,
                deletable: false,
            },
            {
                type: COLUMN_TYPE.PERSON,
                contents: {
                    RichText_defaultText: "Owner",
                    RichText_placeholderText: titleCase(COLUMN_TYPE.PERSON),
                },
            },
            {
                type: COLUMN_TYPE.STATUS,
                contents: {
                    RichText_defaultText: "Status",
                    RichText_placeholderText: titleCase(COLUMN_TYPE.STATUS),
                },
            },
            {
                type: COLUMN_TYPE.DATE,
                contents: {
                    RichText_defaultText: "Deadline",
                    RichText_placeholderText: titleCase(COLUMN_TYPE.DATE),
                },
            },
            {
                type: COLUMN_TYPE.FILE,
                contents: {
                    RichText_defaultText: "Attachment",
                    RichText_placeholderText: titleCase(COLUMN_TYPE.FILE),
                },
            },
        ];

        seedColumns.forEach(column => this.addColumn(column));
        [...Array(3)].forEach(() => this.addRow());
    }

    getColumns() {
        return this.get("columns").getRecords();
    }

    getRows() {
        return this.get("rows").getRecords();
    }

    addColumn(data, index) {
        if (typeof data === "string") {
            data = {
                type: COLUMN_TYPE[data],
                contents: {
                    RichText_placeholderText: titleCase(data),
                },
            };
        }
        const column = this.get("columns").add(data, index);
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

    addStatusType(text, color) {
        return this.get("statusTypes").add({ text, color });
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

    getStatuses() {
        return this.get("statusTypes").getRecords();
    }

    getStatusById(id) {
        return this.getStatuses().find(s => s.getId() === id);
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
