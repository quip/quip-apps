// Copyright 2017 Quip

import React from "react";
import ReactDOM from "react-dom";
import quip from "quip";
import {localizedColorLabel} from "quip-apps-compat";

import Connect from "./connectRecord";
import registerModels from "./model";

import App from "./components/App.jsx";

registerModels();

let selectedRowIds = [];
export function setSelectedRowIds(rowIds) {
    selectedRowIds = rowIds;
    let toolbarCommandIds = ["addRow"];
    if (selectedRowIds.length) {
        toolbarCommandIds.push("deleteRow");
    }
    quip.apps.updateToolbar({toolbarCommandIds});
}

quip.apps.initialize({
    initializationCallback: function(rootNode, {isCreation}) {
        const rootRecord = quip.apps.getRootRecord();
        if (isCreation) {
            rootRecord.seed();
        }

        const ConnectedApp = Connect(rootRecord, App);
        ReactDOM.render(<ConnectedApp />, rootNode);
    },
    menuCommands: [
        {
            id: "addRow",
            label: quiptext("Add Row"),
            handler: () => {
                quip.apps.getRootRecord().addRow();
            },
        },
        {
            id: "deleteRow",
            label: quiptext("Delete Row"),
            handler: () => {
                console.log("deleteRow", {selectedRowIds});
                quip.apps.getRootRecord().deleteRows(selectedRowIds);
            },
        },
    ],
    toolbarCommandIds: ["addRow"],
});
