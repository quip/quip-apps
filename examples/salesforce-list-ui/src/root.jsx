import quip from "quip";
import App from "./App.jsx";
import Connect from "./connectRecord";
import "./record";

import React from "react";
import ReactDOM from "react-dom";

import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import "./dsr-quip-mods.css";

import {getAllMenuCommands, updateToolbar} from "./menus";

// This is a hardcoded object ID for the TrailheaDX19 demo.
const DEFAULT_RECORD_ID = "00B5E000001vOcBUAU";

quip.apps.initialize({
    initializationCallback: function(rootNode, {creationUrl, isCreation}) {
        const rootRecord = quip.apps.getRootRecord();
        const ConnectedApp = Connect(rootRecord, App);
        console.debug("initializationCallback", {
            creationUrl,
            isCreation,
            rootRecord: rootRecord.getData(),
        });

        if (isCreation) {
            let recordId = DEFAULT_RECORD_ID;
            if (creationUrl) {
                console.debug("got creationUrl", {creationUrl});
                rootRecord.set("creationUrl", creationUrl);
                // TODO: parse out info from creationUrl
            }
            rootRecord.set("recordId", recordId);
        }
        ReactDOM.render(<ConnectedApp />, rootNode);
        updateToolbar();
    },
    menuCommands: getAllMenuCommands(),
    toolbarCommandIds: [],
});
