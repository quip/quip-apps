// Copyright 2017 Quip

import quip from "quip-apps-api";
import quiptext from "quiptext";
import {localizedColorLabel} from "quip-apps-compat";
import {EventRecord, colors, RootRecord} from "./model";
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
            label: quiptext("Set Default Month"),
            handler: () => {
                (quip.apps.getRootRecord() as RootRecord).setDisplayMonth(
                    displayMonth);
                refreshToolbar();
            },
        },
        {
            id: "delete-event",
            label: quiptext("Delete"),
            handler: () => {
                selectedEvent.delete();
            },
        },
        {
            id: "comment",
            label: quiptext("Comment"),
            handler: () => {
                quip.apps.showComments(selectedEvent.id());
            },
        },
        ...colors.map(color => ({
            id: color,
            label: localizedColorLabel(color),
            handler: () => {
                selectedEvent.setColor(color);
                refreshToolbar();
            },
        })),
    ];
}
export function refreshToolbar() {
    quip.apps.updateToolbar({
        menuCommands: allMenuCommands(),
        toolbarCommandIds: getToolbarComandIds(),
        disabledCommandIds: getDisabledCommands(),
        highlightedCommandIds: getHighlightedCommandIds(),
    });
}
export function showEventContextMenu(
    e: Element,
    eventRecord: EventRecord,
    onDismiss: () => void
) {
    selectedEvent = eventRecord;
    const commands = [...colors, quip.apps.DocumentMenuCommands.SEPARATOR];

    if (quip.apps.viewerCanSeeComments()) {
        commands.push("comment");
    }

    commands.push("delete-event");
    quip.apps.showContextMenuFromButton(
        e,
        commands,
        getHighlightedCommandIds(),
        [],
        onDismiss);
}

function getHighlightedCommandIds() {
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
    const rootRecord = quip.apps.getRootRecord() as RootRecord;
    const rootRecordDate = rootRecord.getDisplayMonth();

    if (displayMonth.getFullYear() !== rootRecordDate.getFullYear() ||
        displayMonth.getMonth() !== rootRecordDate.getMonth()) {
        toolbarCommandIds.push("set-display-month");
    }

    return toolbarCommandIds;
}
