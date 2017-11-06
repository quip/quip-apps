// Copyright 2017 Quip
/* @flow */

import quip from "quip";

const colors = [
    quip.apps.ui.ColorMap.RED.KEY,
    quip.apps.ui.ColorMap.ORANGE.KEY,
    quip.apps.ui.ColorMap.YELLOW.KEY,
    quip.apps.ui.ColorMap.GREEN.KEY,
    quip.apps.ui.ColorMap.BLUE.KEY,
    quip.apps.ui.ColorMap.VIOLET.KEY,
];

let focusedStepId;
export function setFocusedStep(id) {
    focusedStepId = id;
    refreshToolbar();
}

export function allMenuCommands() {
    return [
        {
            id: "color",
            label: "Color",
            subCommands: colors,
        },
        ...colors.map(color => ({
            id: color,
            label: quip.apps.ui.ColorMap[color].LABEL,
            handler: () => {
                quip.apps.getRootRecord().set("color", color);
                refreshToolbar();
            },
            isHeader: false,
        })),
        {
            id: "addStep",
            label: "Add Step",
            handler: () => {
                quip.apps
                    .getRootRecord()
                    .get("steps")
                    .add({});
                quip.apps.recordQuipMetric("add_step");
            }
        },
        {
            id: "selectStep",
            label: "Select Step",
            handler: () => {
                quip.apps.getRootRecord().set("selected", focusedStepId);
                refreshToolbar();
                quip.apps.recordQuipMetric("set_selected_step");
            },
        },
        {
            id: "selectStepFromMenu",
            label: "Select Step",
            handler: (name, context) => {
                quip.apps
                    .getRootRecord()
                    .set("selected", context["record"].getId());
                refreshToolbar();
                quip.apps.recordQuipMetric("set_selected_step");
            },
        },
        {
            id: "comment",
            label: "Comment",
            handler: (name, context) => {
                quip.apps.showComments(context["record"].getId());
            },
        },
        {
            id: "deleteStep",
            label: "Delete",
            handler: (name, context) => {
                context[name]();
                refreshToolbar();
            },
        },
    ];
}

export function getToolbarCommandIds() {
    let toolbarCommandIds = ["color", "addStep"];
    return toolbarCommandIds;
}

function getHighlightedCommandIds() {
    return [quip.apps.getRootRecord().get("color")];
}

function refreshToolbar() {
    quip.apps.updateToolbar({
        menuCommands: allMenuCommands(),
        toolbarCommandIds: getToolbarCommandIds(),
        highlightedCommandIds: getHighlightedCommandIds(),
    });
}
