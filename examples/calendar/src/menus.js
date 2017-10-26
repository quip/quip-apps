/* @flow */
// Copyright 2017 Quip

// $FlowIssueQuipModule
import quip from "quip";
import isEqual from "date-fns/is_equal";

import { EventRecord, colors } from "./model";

let selectedEvent: EventRecord;

let displayMonth: Date;
export function setMenuDisplayMonth(d: Date) {
    displayMonth = d;
    refreshToolbar();
}

export function allMenuCommands() {
    return [
        {
            id: "set-display-month",
            label: "Set Default Month",
            handler: () => {
                quip.elements.getRootRecord().setDisplayMonth(displayMonth);
                refreshToolbar();
            },
        },
        {
            id: "delete-event",
            label: "Delete",
            handler: () => {
                selectedEvent.delete();
            },
        },
        {
            id: "comment",
            label: "Comment",
            handler: () => {
                quip.elements.showComments(selectedEvent.id());
            },
        },
        ...colors.map(color => ({
            id: color,
            label: color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
            handler: () => {
                selectedEvent.setColor(color);
                refreshToolbar();
            },
        })),
    ];
}

export function refreshToolbar() {
    quip.elements.updateToolbar({
        menuCommands: allMenuCommands(),
        toolbarCommandIds: getToolbarComandIds(),
        disabledCommands: getDisabledCommands(),
        highlightedCommands: getHighlightedCommands(),
    });
}

export function showEventContextMenu(
    e: Event,
    eventRecord: EventRecord,
    onDismiss: Function,
) {
    selectedEvent = eventRecord;

    const commands = [
        ...colors,
        quip.elements.DocumentMenuCommands.SEPARATOR,
        "comment",
        "delete-event",
    ];

    quip.elements.showContextMenuFromButton(
        e,
        commands,
        getHighlightedCommands(),
        [],
        onDismiss,
    );
}

function getHighlightedCommands() {
    if (!selectedEvent) {
        return [];
    } else {
        return [selectedEvent.getColor()];
    }
}

function getDisabledCommands() {
    let disabledCommandIds = [];
    return disabledCommandIds;
}

function getToolbarComandIds() {
    let toolbarCommandIds = [];
    if (
        !isEqual(displayMonth, quip.elements.getRootRecord().getDisplayMonth())
    ) {
        toolbarCommandIds.push("set-display-month");
    }
    return toolbarCommandIds;
}
