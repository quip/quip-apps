// Copyright 2017 Quip

import quip from "quip-apps-api";
import quiptext from "quiptext";
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
} from "../../../shared/table-view/model.js";
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

    private domNode: Node = undefined;

    initialize() {
        this.updateChangeListeners_();
    }

    changeListeners_: quip.apps.Record[] = [];
    updateChangeListeners_ = () => {
        this.changeListeners_.forEach(listener => {
            listener.unlisten(this.setStatePayload_);
        });
        this.changeListeners_ = [];
        this.getRows().forEach(row => {
            row.listen(this.setStatePayload_);
            this.changeListeners_.push(row);
        });
        this.getColumns().forEach(column => {
            column.listen(this.setStatePayload_);
            this.changeListeners_.push(column);
        });
    };

    setStatePayload_ = debounce(() => {
        // @ts-ignore TODO remove ignore with quip-apps-private
        if (typeof quip.apps.setPayload === "function") {
            // @ts-ignore
            quip.apps.setPayload(this.getExportState());
        }
    }, 2000);

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

    addColumn(
        data,
        index?,
        shouldNotSeed = false,
        content = null,
        isFirstColumn = false
    ) {
        if (typeof data === "string") {
            data = {
                type: COLUMN_TYPE[data],
                contents: {
                    RichText_defaultText: content,
                    RichText_placeholderText:
                        COLUMN_TYPE_LABELS[COLUMN_TYPE[data]],
                },
                draggable: !isFirstColumn,
                deletable: !isFirstColumn,
            };
        }
        const column = this.get("columns").add(data, index);
        if (!shouldNotSeed) {
            column.seed();
            this.getRows().forEach(row => row.addCell(column));
        }
        this.updateChangeListeners_();
        return column;
    }

    addRow(data = DEFAULT_ROW) {
        const row = this.get("rows").add({});
        this.getColumns().forEach(column => {
            const columnName = column.get("name");
            const cellData = data[columnName] || {};
            row.addCell(column, cellData);
        });
        this.updateChangeListeners_();
        return row;
    }

    setDom(node) {
        if (!node) return;
        this.domNode = node;
    }

    getDom() {
        return this.domNode;
    }

    getExportState(): String {
        const columns2IdMap = this.getColumns().reduce(
            (obj, column, index) => ({
                ...obj,
                [column.getId()]: index.toString(),
            }),
            {});

        const statusId2DevName = new Map();
        const statusDevName2Count = new Map();
        /**
         * Returns the status results given a column.
         * eg. {
         *     label: "Needs work",
         *     devName: "needs_work_2",
         *     color: "BLUE",
         * }
         * @param status - status Record
         */
        const getStatusJSON_ = (status: StatusTypeRecord) => {
            const label = status.getText();

            let devName = label.toLowerCase().replace(" ", "_");
            if (statusDevName2Count.has(devName)) {
                // If a duplicate exists, increment counter and append a number
                // to the end of the devName
                // eg. "label", "label_1", "label_2", "label_3"
                const newCount = statusDevName2Count.get(devName) + 1;
                statusDevName2Count.set(devName, newCount);
                devName = devName + "_" + newCount.toString();
            } else {
                statusDevName2Count.set(devName, 0);
            }

            // Store devName to id mapping to help export rows information
            statusId2DevName.set(status.getId(), devName);

            return {
                label,
                devName,
                color: status.getColor().KEY,
            };
        };

        const columns = this.getColumns().map((column, index) => {
            const columnMap: {
                content: any;
                type: string;
                id: any;
                options?: any;
            } = {
                content: column.getContents().getTextContent(),
                // We pass the key as the type.
                type: Object.keys(COLUMN_TYPE).find(
                    key => COLUMN_TYPE[key] === column.getType()),
                id: index.toString(),
            };
            // Add the "options" value if the column type is "status"
            if (column.getType() === COLUMN_TYPE.STATUS) {
                columnMap.options = column
                    .get("statusTypes")
                    .getRecords()
                    .map(getStatusJSON_);
            }
            return columnMap;
        });
        const rows = this.getRows().map(row =>
            row.getJSON(columns2IdMap, statusId2DevName)
        );
        return JSON.stringify({
            columns,
            rows,
        });
    }

    populateFromState(state) {
        const id2ColumnRecord = new Map();
        const devName2StatusId = new Map();
        if (state.columns && state.rows) {
            state.columns.forEach(column => {
                const columnRecord = this.addColumn(
                    column.type,
                    null,
                    true,
                    column.content,
                    column === state.columns[0]);
                id2ColumnRecord.set(column.id, columnRecord);
                // note: column.type stores the key rather than the value of columnType
                if (column.type === "STATUS" &&
                    column.options &&
                    column.options.length) {
                    column.options.forEach(option => {
                        const statusId = columnRecord.addStatusType(
                            option.label,
                            colors[option.color]);
                        devName2StatusId.set(option.devName, statusId.getId());
                    });
                }
            });
            state.rows.forEach(row => {
                const rowRecord = this.get("rows").add({});
                const columnsFilled = new Set();
                for (const [key, value] of Object.entries(row)) {
                    if (!id2ColumnRecord.has(key)) {
                        console.error("Cannot find column with id: " + key);
                        continue;
                    }
                    const columnRecord = id2ColumnRecord.get(key);
                    columnsFilled.add(columnRecord);
                    let cellRecord;
                    switch (columnRecord.getType()) {
                        case COLUMN_TYPE.TEXT:
                            cellRecord = rowRecord.addCell(columnRecord, {
                                contents: {
                                    RichText_defaultText: value,
                                    RichText_placeholderText:
                                        COLUMN_TYPE_LABELS[COLUMN_TYPE.TEXT],
                                },
                            });
                            break;
                        case COLUMN_TYPE.PERSON:
                            cellRecord = rowRecord.addCell(columnRecord);
                            if (Array.isArray(value)) {
                                new Set(value).forEach(personId => {
                                    cellRecord.addUserById(personId);
                                });
                            } else {
                                console.error("Failed to parse " + value);
                            }
                            break;
                        case COLUMN_TYPE.DATE:
                            cellRecord = rowRecord.addCell(columnRecord);
                            cellRecord.setDate(Number(value));
                            break;
                        case COLUMN_TYPE.STATUS:
                            cellRecord = rowRecord.addCell(columnRecord);
                            if (devName2StatusId.has(value)) {
                                cellRecord.setStatus(
                                    devName2StatusId.get(value));
                            }
                            break;
                        case COLUMN_TYPE.FILE:
                            // TODO: Support file blob importing
                            cellRecord = rowRecord.addCell(columnRecord);
                            break;
                    }
                }
                if (columnsFilled.size < id2ColumnRecord.size) {
                    // If not all columns were populated, populate the rest
                    // with empty values.
                    id2ColumnRecord.forEach(value => {
                        if (!columnsFilled.has(value)) {
                            rowRecord.addCell(value);
                        }
                    });
                }
            });

            this.updateChangeListeners_();
        }
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
