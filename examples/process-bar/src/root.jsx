// Copyright 2017 Quip
/* @flow */

import quip from "quip";
import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App.jsx";

import connectRecord from "./connectRecord";
import {allMenuCommands, getToolbarCommandIds} from "./menus";
import registerModels from "./model";

registerModels();

quip.apps.initialize({
    initializationCallback: function(rootNode, {isCreation}) {
        const rootRecord = quip.apps.getRootRecord();
        if (isCreation) {
            rootRecord.seed();
            //quip.apps.sendMessage("added a Process Bar");
        }

        quip.apps.updateToolbarCommandsState([], [rootRecord.get("color")]);
        const ConnectedApp = connectRecord(rootRecord, App);
        ReactDOM.render(<ConnectedApp/>, rootNode, () => {
            isCreation &&
                rootRecord
                    .get("steps")
                    .getRecords()[0]
                    .focus();
        });
    },
    menuCommands: allMenuCommands(),
    toolbarCommandIds: getToolbarCommandIds(),
});
