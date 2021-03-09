// Copyright 2017 Quip

import React from "react";
import ReactDOM from "react-dom";
import quip from "quip-apps-api";
import quiptext from "quiptext";
import connectEntity from "./lib/connectEntity";
import timePerf from "./lib/timePerf";
import {
    COLUMN_TYPE as TABLE_VIEW_COLUMN_TYPE,
    COLUMN_TYPE_LABELS,
} from "../../shared/table-view/model.js";
import registerModels, {COLUMN_TYPE, RootRecord} from "./model/root";
import {Main} from "./components/main.jsx";

registerModels();

const menuCommands = [
    {
        id: "sortAscending",
        label: quiptext("Sort Ascending"),
        handler: (name, context) => context[name](),
    },
    {
        id: "sortDescending",
        label: quiptext("Sort Descending"),
        handler: (name, context) => context[name](),
    },
    {
        id: "addColumn",
        label: quiptext("Add Column"),
        subCommands: Object.keys(COLUMN_TYPE).map(type => type + "AddColumn"),
    },
    {
        id: "addRow",
        label: quiptext("Add Row"),
        handler: () => (quip.apps.getRootRecord() as RootRecord).addRow(),
    },
    {
        id: "deleteColumn",
        label: quiptext("Delete Column"),
        handler: (name, context) => context[name](),
    },
    {
        id: "deleteRow",
        label: quiptext("Delete Row"),
        handler: (name, context) => context[name](),
    },
    ...Object.keys(COLUMN_TYPE).map(type => ({
        id: type + "AddColumn",
        label: COLUMN_TYPE_LABELS[TABLE_VIEW_COLUMN_TYPE[type]],
        isHeader: false,
        handler: (name, context) => context["addColumn"](type),
    })),
];
const toolbarCommandIds = ["addRow"];
const initializationOptions: quip.InitOptions = {
    // @ts-ignore: used for 'payload' remove after moving to quip-apps-private
    initializationCallback: async (root, {isCreation, payload}) => {
        const rootRecord = quip.apps.getRootRecord() as RootRecord;

        // Render performance timer
        timePerf("Init To Render", () => rootRecord.getDom());

        // Populating project tracker from payload.
        // We assume that if rootRecord doesn't have any columns, we should read
        // from the payload (if present). This is to support creation from API.
        if (!rootRecord.getColumns().length && payload) {
            let importState: {[key: string]: any} | null = null;
            try {
                importState = JSON.parse(payload);
            } catch (e) {
                // Ignore parse errors here. Presumably the metrics and local
                // logs are enough to debug.
                console.error(`Invalid JSON in payload: ${payload}`);
            }

            if (importState) {
                if (!importState["columns"]) {
                    console.error(
                        "Invalid payload: 'columns' property not set");
                } else {
                    rootRecord.populateFromState(importState);
                }
            }
            quip.apps.getRootRecord().setDataVersion(RootRecord.DATA_VERSION);
        } else if (isCreation) {
            rootRecord.seed();
        } else {
            if (rootRecord.getDataVersion() < RootRecord.DATA_VERSION) {
                // Migrate data to new format
                const columns = rootRecord.getColumns();
                const statusTypes = rootRecord.get("statusTypes").getRecords();
                /** @private {Map<string, string>} */
                const migrationMap = new Map();
                columns.forEach(function (col) {
                    if (col.getType() == "status") {
                        let record;
                        statusTypes.forEach(function (status) {
                            record = col.addStatusType(
                                status.getText(),
                                status.getColor());
                            migrationMap.set(status.getId(), record.getId());
                        });
                        const cells = col.getCells();
                        cells.forEach(function (cell) {
                            const status = cell.getStatus();
                            const newStatus = migrationMap.get(status);
                            if (status && newStatus) {
                                cell.setStatus(newStatus);
                            }
                        });
                    }
                });
                rootRecord.setDataVersion(RootRecord.DATA_VERSION);
            }
            rootRecord.checkAndRepairNullCells();
        }

        const Connected = connectEntity(rootRecord, Main, {
            isV2: true,
            // @ts-ignore Remove after adding types ro connectEntity
            mapStateToProps: state => ({
                rowCount: state.rows.count(),
                columnCount: state.columns.count(),
            }),
        });

        ReactDOM.render(<Connected/>, root);
    },
    // TODO: Remove toolbarCommandIds and menuCommands if minApiVersion is at least 0.1.053
    //       Use toolbarState instead.
    toolbarCommandIds,
    menuCommands,
};

if (quip.apps.isApiVersionAtLeast("0.1.053")) {
    initializationOptions.toolbarState = {
        menuCommands,
        toolbarCommandIds,
        mobileToolbarCommandIds: toolbarCommandIds,
    };
}
quip.apps.initialize(initializationOptions);
