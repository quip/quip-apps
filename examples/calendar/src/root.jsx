import React from "react";
import ReactDOM from "react-dom";
import quip from "quip";

import App from "./App.jsx";

import { allMenuCommands } from "./menus";

import "./root.less";

quip.apps.initialize({
    menuCommands: allMenuCommands(),
    toolbarCommandIds: ["set-display-month"],

    initializationCallback: function(root, { isCreation }) {
        const rootRecord = quip.apps.getRootRecord();

        if (isCreation) {
            rootRecord.setDisplayMonth(new Date());
            //quip.apps.sendMessage("created a Calendar");
        }

        ReactDOM.render(<App rootNode={root} rootRecord={rootRecord} />, root);
    },
});
