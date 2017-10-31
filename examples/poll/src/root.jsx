// Copyright 2017 Quip

import React from "react";
import ReactDOM from "react-dom";
import quip from "quip";

import Connect from "./connectEntity";
import registerModels from "./model";

import App from "./components/App.jsx";

registerModels();
if (quip.elements.enableSizingV2) {
    quip.elements.enableSizingV2();
}

const colors = [
    quip.elements.ui.ColorMap.RED.KEY,
    quip.elements.ui.ColorMap.ORANGE.KEY,
    quip.elements.ui.ColorMap.YELLOW.KEY,
    quip.elements.ui.ColorMap.GREEN.KEY,
    quip.elements.ui.ColorMap.BLUE.KEY,
    quip.elements.ui.ColorMap.VIOLET.KEY,
];

quip.elements.initialize({
    initializationCallback: function(rootNode, { isCreation }) {
        const rootRecord = quip.elements.getRootRecord();
        if (isCreation) {
            rootRecord.seed();
            //quip.elements.sendMessage("added a Poll");
        } else if (typeof rootRecord.get("color") !== "string") {
            // backwards compat for prior version that stored color
            // objects in rootRecord
            rootRecord.set(
                "color",
                rootRecord.constructor.getDefaultProperties().color,
            );
        }

        const ConnectedApp = Connect(rootRecord, App);
        ReactDOM.render(<ConnectedApp />, rootNode, () => {
            isCreation &&
                rootRecord
                    .get("options")
                    .getRecords()[0]
                    .get("text")
                    .focus();
        });
    },
    menuCommands: [
        {
            id: "addOption",
            label: "Add Option",
            handler: () => {
                quip.elements.getRootRecord().addOption();
            },
        },
        {
            id: "settings",
            label: "Settings",
            subCommands: [
                ...colors,
                quip.elements.DocumentMenuCommands.SEPARATOR,
                "allowMultiple",
                "allowSingle",
            ],
        },
        {
            id: "allowMultiple",
            label: "Multiple Votes",
            handler: () => {
                quip.elements.getRootRecord().setAllowMultiple(true);
                quip.elements.updateToolbarCommandsState([], ["allowMultiple"]);
            },
        },
        {
            id: "allowSingle",
            label: "Single Vote",
            handler: () => {
                quip.elements.getRootRecord().setAllowMultiple(false);
                quip.elements.updateToolbarCommandsState([], ["allowSingle"]);
            },
        },
        {
            id: "comment",
            label: "Comment",
            handler: (name, context) => {
                quip.elements.showComments(context["record"].getId());
            },
        },
        {
            id: "delete",
            label: "Delete",
            handler: (name, context) => context[name](),
        },
        ...colors.map(color => ({
            id: color,
            label: color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
            handler: () => {
                quip.elements.getRootEntity().set("color", color);
                quip.elements.updateToolbarCommandsState([], [color]);
                quip.elements.recordQuipMetric("set_color");
            },
            isHeader: false,
        })),
    ],
    toolbarCommandIds: ["settings", "addOption"],
});
