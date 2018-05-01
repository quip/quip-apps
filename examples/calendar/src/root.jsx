import React from "react";
import ReactDOM from "react-dom";
import quip from "quip";

import App from "./App.jsx";

import {allMenuCommands} from "./menus";

import "./root.less";

quip.apps.initialize({
    menuCommands: allMenuCommands(),
    toolbarCommandIds: ["set-display-month"],

    initializationCallback: function(root, {isCreation, creationSource}) {
        const rootRecord = quip.apps.getRootRecord();

        if (isCreation) {
            rootRecord.setDisplayMonth(new Date());
            //quip.apps.sendMessage("created a Calendar");
        } else if (quip.apps.CreationSource &&
            creationSource === quip.apps.CreationSource.TEMPLATE) {
            rootRecord.clearData();
            rootRecord.setDisplayMonth(new Date());
        }

        ReactDOM.render(<App rootNode={root} rootRecord={rootRecord}/>, root);
    },
});
