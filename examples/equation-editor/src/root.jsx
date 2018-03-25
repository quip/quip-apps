// Copyright 2018 Quip

import App from "./App.jsx";
import RootRecord from "./RootRecord.js";
import menu from "./menu.js";

quip.apps.registerClass(RootRecord, "root");

quip.apps.initialize({
    menuCommands: menu.getMenuCommands(),
    toolbarCommandIds: menu.getToolbarCommandIds(),
    initializationCallback: (rootNode, params) => {
        const rootRecord = quip.apps.getRootRecord();
        const equationRecord = rootRecord.get("equation");
        if (params.isCreation) {
            // We don't set this as the default text via getDefaultProperties
            // on the root record because that does not end up respecting the
            // code style only restriction on the rich text box.
            equationRecord.set(
                "RichText_defaultText", "c = \\pm\\sqrt{a^2 + b^2}");
        }
        ReactDOM.render(
            <App rootRecord={rootRecord} equationRecord={equationRecord}/>,
            rootNode);
    },
});
