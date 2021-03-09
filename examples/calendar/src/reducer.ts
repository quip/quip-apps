// Copyright 2017 Quip
import {EventRecord, RootRecord} from "./model";
import {
    DateRange,
    MouseCoordinates,
    MouseStartCoordinates,
    MovingEventOrder,
    MovingEventRectMap,
} from "./types";
type AppState = {
    displayMonth: Date;
    draggingEventDateRange: DateRange;
    events: Array<EventRecord>;
    focusedEvent: EventRecord | undefined | null;
    isMobileApp: boolean;
    isSmallScreen: boolean;
    menuOpenRecord: EventRecord | undefined | null;
    mouseCoordinates: MouseCoordinates;
    mouseStartCoordinates: MouseStartCoordinates;
    movingEventOrder: MovingEventOrder | undefined | null;
    movingEventRectMap: MovingEventRectMap | undefined | null;
    resizingEvent: EventRecord | undefined | null;
    rootNode: Element;
    rootRecord: RootRecord;
    selectedEvent: EventRecord | undefined | null;
};

function appReducer(state: AppState, action: any) {
    switch (action.type) {
        case "SET_SMALL_SCREEN":
            return {...state, isSmallScreen: action.isSmallScreen};

        case "SET_DISPLAY_MONTH":
            return {...state, displayMonth: action.displayMonth};

        case "SET_EVENTS":
            return {
                ...state,
                events: action.events,
            };

        case "SET_FOCUSED_EVENT":
            return {
                ...state,
                focusedEvent: action.focusedEvent,
                focusedEventTimestamp: action.focusedEventTimestamp,
                selectedEvent:
                    action.focusedEvent || state.isMobileApp
                        ? null
                        : state.selectedEvent,
            };

        case "SET_RESIZING_EVENT":
            return {
                ...state,
                resizingEvent: action.resizingEvent,
                selectedEvent: action.resizingEvent
                    ? null
                    : state.selectedEvent,
            };

        case "SET_MOVING_EVENT":
            return {
                ...state,
                mouseStartCoordinates: action.mouseStartCoordinates,
                movingEvent: action.movingEvent,
                movingEventRectMap: action.movingEventRectMap,
                selectedEvent: action.movingEvent
                    ? action.movingEvent
                    : state.selectedEvent,
            };

        case "SET_MOVING_EVENT_ORDER":
            return {...state, movingEventOrder: action.movingEventOrder};

        case "SET_MOVING_EVENT_RECT_MAP":
            return {...state, movingEventRectMap: action.movingEventRectMap};

        case "SET_MOUSE_COORDINATES":
            return {
                ...state,
                draggingEventDateRange: action.draggingEventDateRange,
                mouseCoordinates: action.mouseCoordinates,
            };

        case "SET_SELECTED_EVENT":
            return {...state, selectedEvent: action.selectedEvent};

        case "SET_MENU_OPEN_RECORD":
            return {
                ...state,
                menuOpenRecord: action.menuOpenRecord,
                selectedEvent: action.menuOpenRecord
                    ? null
                    : state.selectedEvent,
            };

        case "SET_DEBUG_PROP":
            return {...state, ...action.payload};

        default:
            return {...state};
    }
}

export default appReducer;
