// Copyright 2017 Quip
/* @flow */

import quip from "quip";
import React from "react";
import ReactDOM from "react-dom";

import App from "./components/App.jsx";

import connectEntity from "./lib/connectEntity";
import { allMenuCommands, getToolbarCommandIds } from "./menus";
import registerModels from "./model";

registerModels();

quip.elements.initialize({
    initializationCallback: function(rootNode, { isCreation }) {
        const rootRecord = quip.elements.getRootRecord();
        if (isCreation) {
            rootRecord.seed();
            //quip.elements.sendMessage("added a Process Bar");
        }

        quip.elements.updateToolbarCommandsState([], [rootRecord.get("color")]);
        const ConnectedApp = connectEntity(rootRecord, App);
        ReactDOM.render(<ConnectedApp />, rootNode, () => {
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
