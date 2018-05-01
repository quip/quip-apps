// Copyright 2017 Quip

import React from "react";
import ReactDOM from "react-dom";
import quip from "quip";
import {localizedColorLabel} from "quip-apps-compat";

import Connect from "./connectRecord";
import registerModels from "./model";

import App from "./components/App.jsx";

registerModels();

const colors = [
    quip.apps.ui.ColorMap.RED.KEY,
    quip.apps.ui.ColorMap.ORANGE.KEY,
    quip.apps.ui.ColorMap.YELLOW.KEY,
    quip.apps.ui.ColorMap.GREEN.KEY,
    quip.apps.ui.ColorMap.BLUE.KEY,
    quip.apps.ui.ColorMap.VIOLET.KEY,
];

quip.apps.initialize({
    initializationCallback: function(rootNode, {isCreation}) {
        const rootRecord = quip.apps.getRootRecord();
        if (isCreation) {
            rootRecord.seed();
            //quip.apps.sendMessage("added a Poll");
        } else if (typeof rootRecord.get("color") !== "string") {
            // backwards compat for prior version that stored color
            // objects in rootRecord
            rootRecord.set(
                "color",
                rootRecord.constructor.getDefaultProperties().color);
        }

        const ConnectedApp = Connect(rootRecord, App);
        ReactDOM.render(<ConnectedApp/>, rootNode, () => {
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
            id: quip.apps.DocumentMenuCommands.MENU_MAIN,
            subCommands: ["allowMultiple", "allowSingle"],
        },
        {
            id: "addOption",
            label: quiptext("Add Option"),
            handler: () => {
                quip.apps.getRootRecord().addOption();
            },
        },
        {
            id: "settings",
            label: quiptext("Color"),
            subCommands: colors,
        },
        {
            id: "allowMultiple",
            label: quiptext("Multiple Votes"),
            handler: () => {
                quip.apps.getRootRecord().setAllowMultiple(true);
                quip.apps.updateToolbarCommandsState([], ["allowMultiple"]);
            },
        },
        {
            id: "allowSingle",
            label: quiptext("Single Vote"),
            handler: () => {
                quip.apps.getRootRecord().setAllowMultiple(false);
                quip.apps.updateToolbarCommandsState([], ["allowSingle"]);
            },
        },
        {
            id: "comment",
            label: quiptext("Comment"),
            handler: (name, context) => {
                quip.apps.showComments(context["record"].getId());
            },
        },
        {
            id: "delete",
            label: quiptext("Delete"),
            handler: (name, context) => context[name](),
        },
        ...colors.map(color => ({
            id: color,
            label: localizedColorLabel(color),
            handler: () => {
                quip.apps.getRootRecord().set("color", color);
                quip.apps.updateToolbarCommandsState([], [color]);
                quip.apps.recordQuipMetric("set_color");
            },
            isHeader: false,
        })),
    ],
    toolbarCommandIds: [
        quip.apps.DocumentMenuCommands.MENU_MAIN,
        "settings",
        "addOption",
    ],
});
