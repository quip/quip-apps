// Copyright 2017 Quip

import quip from "quip";
import ReactDOM from "react-dom";

import connectEntity from "./connectEntity";

import App from "./components/App.jsx";

if (quip.elements.enableDataModelV2) {
    quip.elements.enableDataModelV2();
}
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

let rootInstance = null;
const setRootInstance = val => (rootInstance = val);

quip.elements.initialize({
    menuCommands: [
        {
            id: "date",
            label: "Date",
            handler: () => {
                rootInstance && rootInstance.toggleCalendar();
            },
        },
        {
            id: "color",
            label: "Color",
            subCommands: colors,
        },
        ...colors.map(color => ({
            id: color,
            label: color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
            handler: () => {
                quip.elements.getRootEntity().setProperty("color", color);
                quip.elements.updateToolbarCommandsState([], [color]);
                quip.elements.recordQuipMetric("set_color");
            },
            isHeader: false,
        })),
    ],
    toolbarCommandIds: ["color", "date"],
    initializationCallback: function(rootNode, params) {
        const rootEntity = quip.elements.getRootEntity();

        if (params.isCreation) {
            rootEntity.setProperty("color",
                quip.elements.ui.ColorMap.YELLOW.KEY);
            const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            rootEntity.setProperty("deadline", tomorrowDate.getTime());
        } else if (colors.indexOf(rootEntity.getProperty("color")) === -1) {
            // backwards compat for timers < 9-20-2017
            rootEntity.setProperty("color",
                quip.elements.ui.ColorMap.YELLOW.KEY);
        }

        quip.elements.updateToolbarCommandsState(
            [],
            [rootEntity.getProperty("color")],
        );

        const ConnectedApp = connectEntity(rootEntity, App);
        ReactDOM.render(
            <ConnectedApp setRootInstance={setRootInstance} />,
            rootNode,
        );
    },
});
