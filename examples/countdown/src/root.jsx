// Copyright 2017 Quip

import quip from "quip";
import ReactDOM from "react-dom";

import connectEntity from "./connectEntity";
import { formatDate } from "./humanTime";

import App from "./components/App.jsx";

const colors = [
    quip.apps.ui.ColorMap.RED.KEY,
    quip.apps.ui.ColorMap.ORANGE.KEY,
    quip.apps.ui.ColorMap.YELLOW.KEY,
    quip.apps.ui.ColorMap.GREEN.KEY,
    quip.apps.ui.ColorMap.BLUE.KEY,
    quip.apps.ui.ColorMap.VIOLET.KEY,
];

let rootInstance = null;
const setRootInstance = val => (rootInstance = val);

export function updateToolbar() {
    const rootEntity = quip.apps.getRootRecord();
    const deadline = rootEntity && rootEntity.get("deadline");
    quip.apps.updateToolbar({
        menuCommands: allMenuCommands(new Date(deadline)),
    });
}

function allMenuCommands(deadlineDate) {
    return [
        {
            id: "date",
            label: deadlineDate ? formatDate(deadlineDate) : "Date",
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
                quip.apps.getRootRecord().set("color", color);
                quip.apps.updateToolbarCommandsState([], [color]);
                quip.apps.recordQuipMetric("set_color");
            },
            isHeader: false,
        })),
    ];
}

quip.apps.initialize({
    menuCommands: allMenuCommands(),
    toolbarCommandIds: ["color", "date"],
    initializationCallback: function(rootNode, params) {
        const rootEntity = quip.apps.getRootRecord();

        if (params.isCreation) {
            rootEntity.set("color", quip.apps.ui.ColorMap.YELLOW.KEY);
            const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            rootEntity.set("deadline", tomorrowDate.getTime());
        } else if (colors.indexOf(rootEntity.get("color")) === -1) {
            // backwards compat for timers < 9-20-2017
            rootEntity.set("color", quip.apps.ui.ColorMap.YELLOW.KEY);
        }
        updateToolbar(rootEntity.get("deadline"));
        quip.apps.updateToolbarCommandsState([], [rootEntity.get("color")]);

        const ConnectedApp = connectEntity(rootEntity, App);
        ReactDOM.render(
            <ConnectedApp setRootInstance={setRootInstance} />,
            rootNode,
        );
    },
});
