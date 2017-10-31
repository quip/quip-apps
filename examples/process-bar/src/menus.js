// Copyright 2017 Quip
/* @flow */

import quip from "quip";

const colors = [
    quip.elements.ui.ColorMap.RED.KEY,
    quip.elements.ui.ColorMap.ORANGE.KEY,
    quip.elements.ui.ColorMap.YELLOW.KEY,
    quip.elements.ui.ColorMap.GREEN.KEY,
    quip.elements.ui.ColorMap.BLUE.KEY,
    quip.elements.ui.ColorMap.VIOLET.KEY,
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
            label: quip.elements.ui.ColorMap[color].LABEL,
            handler: () => {
                quip.elements.getRootEntity().set("color", color);
                refreshToolbar();
            },
            isHeader: false,
        })),
        {
            id: "addStep",
            label: "Add Step",
            handler: () => {
                quip.elements
                    .getRootEntity()
                    .get("steps")
                    .add({});
                quip.elements.recordQuipMetric("add_step");
            }
        },
        {
            id: "selectStep",
            label: "Select Step",
            handler: () => {
                quip.elements.getRootEntity().set("selected", focusedStepId);
                refreshToolbar();
                quip.elements.recordQuipMetric("set_selected_step");
            },
        },
        {
            id: "selectStepFromMenu",
            label: "Select Step",
            handler: (name, context) => {
                quip.elements
                    .getRootEntity()
                    .set("selected", context["record"].getId());
                refreshToolbar();
                quip.elements.recordQuipMetric("set_selected_step");
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
    return [quip.elements.getRootRecord().get("color")];
}

function refreshToolbar() {
    quip.elements.updateToolbar({
        menuCommands: allMenuCommands(),
        toolbarCommandIds: getToolbarCommandIds(),
        highlightedCommandIds: getHighlightedCommandIds(),
    });
}
