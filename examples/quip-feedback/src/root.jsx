// Copyright 2017 Quip

import React from "react";
import ReactDOM from "react-dom";
import quip from "quip";
import {localizedColorLabel} from "quip-apps-compat";

import Connect from "./connectRecord";
import registerModels, {login, logout} from "./model";

import App from "./components/App.jsx";

registerModels();

let selectedRowIds = [];
export function setSelectedRowIds(rowIds) {
    selectedRowIds = rowIds;
    updateToolbar();
}

function getToolbarCommandIds() {
    let toolbarCommandIds = [];
    const hasToken = !!quip.apps.getUserPreferences().getForKey("token");
    toolbarCommandIds.push(hasToken ? "logout" : "login");

    if (!hasToken) {
        return toolbarCommandIds;
    }

    toolbarCommandIds.push("addRow");
    if (selectedRowIds.length) {
        toolbarCommandIds.push("deleteRow");
    }
    return toolbarCommandIds;
}

export function updateToolbar() {
    const toolbarCommandIds = getToolbarCommandIds();
    quip.apps.updateToolbar({toolbarCommandIds});
}

quip.apps.initialize({
    initializationCallback: function(rootNode, {isCreation}) {
        const rootRecord = quip.apps.getRootRecord();
        if (isCreation) {
            rootRecord.seed();
        }
        updateToolbar();

        const ConnectedApp = Connect(rootRecord, App);
        ReactDOM.render(<ConnectedApp />, rootNode);

        setInterval(() => {
            console.debug("syncing title w/ threadId", quip.apps.getThreadId());
        }, 5000);
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
        {
            id: "login",
            label: quiptext("Login"),
            handler: () => {
                console.log("login");
                login();
            },
        },
        {
            id: "logout",
            label: quiptext("Logout"),
            handler: () => {
                console.log("logout");
                logout();
            },
        },
    ],
    toolbarCommandIds: [],
});
