import React from "react";
import ReactDOM from "react-dom";
import quip from "quip";

import App from "./App.jsx";

import { allMenuCommands } from "./menus";

import "./root.less";

if (quip.elements.enableDataModelV2) {
    quip.elements.enableDataModelV2();
}
if (quip.elements.enableSizingV2) {
    quip.elements.enableSizingV2();
}

quip.elements.initialize({
    menuCommands: allMenuCommands(),
    toolbarCommandIds: ["set-display-month"],

    initializationCallback: function(root, { isCreation }) {
        const rootRecord = quip.elements.getRootRecord();

        if (isCreation) {
            rootRecord.setDisplayMonth(new Date());
            //quip.elements.sendMessage("created a Calendar");
        }

        ReactDOM.render(<App rootNode={root} rootRecord={rootRecord} />, root);
    },
});
