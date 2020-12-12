/* @flow */
// Copyright 2017 Quip

import {EventRecord, RootRecord} from "./model";
import {setMenuDisplayMonth} from "./menus";

import {getMovingEventRectMap} from "./util";

import type {
    MouseCoordinates,
    MouseStartCoordinates,
    MovingEventOrder,
    MovingEventRectMap,
} from "./types";

export const setFocusedEvent = (
    focusedEvent: ?EventRecord,
    focusedEventTimestamp: ?Date
) => ({
    type: "SET_FOCUSED_EVENT",
    focusedEvent,
    focusedEventTimestamp,
});

export const setResizingEvent = (resizingEvent: ?EventRecord) => ({
    type: "SET_RESIZING_EVENT",
    movingEvent: null,
    mouseStartCoordinates: {
        offsetX: 0,
        offsetY: 0,
        date: null,
    },
    resizingEvent,
});

export const setMovingEvent = (
    movingEvent: ?EventRecord,
    mouseStartCoordinates?: MouseStartCoordinates
) => ({
    type: "SET_MOVING_EVENT",
    mouseStartCoordinates,
    movingEvent,
    movingEventRectMap:
        movingEvent && mouseStartCoordinates
            ? getMovingEventRectMap(movingEvent, mouseStartCoordinates)
            : {},
    resizingEvent: null,
});

export const setMovingEventOrder = (movingEventOrder: ?MovingEventOrder) => ({
    type: "SET_MOVING_EVENT_ORDER",
    movingEventOrder,
});

export const setMovingEventRectMap = (
    movingEventRectMap: ?MovingEventRectMap
) => ({
    type: "SET_MOVING_EVENT_RECT_MAP",
    movingEventRectMap,
});

export const setMouseCoordinates = (
    mouseCoordinates: MouseCoordinates,
    draggingEventDateRange?: Object
) => ({
    type: "SET_MOUSE_COORDINATES",
    mouseCoordinates,
    draggingEventDateRange,
});

export const setSelectedEvent = (selectedEvent: ?EventRecord) => ({
    type: "SET_SELECTED_EVENT",
    selectedEvent,
});

export const setDisplayMonth = (displayMonth: Date) => {
    setMenuDisplayMonth(displayMonth);
    return {
        type: "SET_DISPLAY_MONTH",
        displayMonth,
    };
};

export const refreshEvents = (rootRecord: RootRecord) => ({
    type: "SET_EVENTS",
    events: rootRecord.getEvents(),
});

export const setIsSmallScreen = (isSmallScreen: boolean) => ({
    type: "SET_SMALL_SCREEN",
    isSmallScreen,
});

export const setMenuOpenRecord = (menuOpenRecord: EventRecord) => ({
    type: "SET_MENU_OPEN_RECORD",
    menuOpenRecord,
});

export const setDebugProp = (payload: Object) => ({
    type: "SET_DEBUG_PROP",
    payload,
});
