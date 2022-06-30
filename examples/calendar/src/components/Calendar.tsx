// Copyright 2017 Quip

import quip from "quip-apps-api";
import React from "react";
import {connect} from "react-redux";
import classNames from "classnames";
import chunk from "lodash.chunk";
import throttle from "lodash.throttle";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import Styles from "./Calendar.less";
import StylesCalendarEvent from "./CalendarEvent.less";
import {EventRecord, RootRecord} from "../model";
import {formatDate} from "../util";
import {
    refreshEvents,
    setDebugProp,
    setIsSmallScreen,
    setFocusedEvent,
    setResizingEvent,
    setMouseCoordinates,
    setMovingEvent,
    setMovingEventOrder,
    setMovingEventRectMap,
    setSelectedEvent,
} from "../actions";
import {
    areDateRangesEqual,
    isSameDay,
    dateAtPoint,
    getCalendarMonth,
    getIsSmallScreen,
    getMovingEventDateRange,
    getMovingEventRectMap,
    getResizingEventDateRange,
    isElAtPoint,
} from "../util";
import agendaForWeek from "../agendaForWeek";
import CalendarNavHeader from "./CalendarNavHeader";
import CalendarWeek from "./CalendarWeek";
import EventLegend from "./EventLegend";
import {
    MouseCoordinates,
    MouseStartCoordinates,
    MovingEventOrder,
} from "../types";
const {CONTAINER_SIZE_UPDATE, ELEMENT_BLUR} = quip.apps.EventType;
const BUTTON_RIGHT_CLICK = 2;
const BACKSPACE_KEY = 8;
const DELETE_KEY = 46;

const isClickOnCalendarEvent = (xy: MouseCoordinates) =>
    isElAtPoint(xy, StylesCalendarEvent.event);

type Props = {
    DEBUG_ORDER: boolean;
    displayMonth: Date;
    events: Array<EventRecord>;
    focusedEvent: EventRecord;
    isMobileApp: boolean;
    isSmallScreen: boolean;
    menuOpenRecord: EventRecord;
    mouseCoordinates: MouseCoordinates;
    mouseStartCoordinates: MouseStartCoordinates;
    movingEvent: EventRecord | undefined | null;
    movingEventOrder: MovingEventOrder | undefined | null;
    refreshEvents: Function;
    resizingEvent: EventRecord | undefined | null;
    rootRecord: RootRecord;
    selectedEvent: EventRecord;
    setDebugProp: Function;
    setFocusedEvent: Function;
    setMouseCoordinates: Function;
    setMovingEvent: Function;
    setMovingEventOrder: Function;
    setMovingEventRectMap: Function;
    setIsSmallScreen: Function;
    setResizingEvent: Function;
    setSelectedEvent: Function;
};

class Calendar extends React.Component<Props, null> {
    componentWillMount() {
        quip.apps.addEventListener(
            CONTAINER_SIZE_UPDATE,
            this.handleContainerResize);
        quip.apps.addEventListener(ELEMENT_BLUR, this.onElementBlur);
        window.addEventListener("keydown", this.onKeyDown);
        window.document.body.addEventListener("mouseout", this.onBodyMouseOut);
    }

    componentDidMount() {
        this.props.rootRecord.listen(this.refresh);
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(
            CONTAINER_SIZE_UPDATE,
            this.handleContainerResize);
        quip.apps.removeEventListener(ELEMENT_BLUR, this.onElementBlur);
        window.removeEventListener("keydown", this.onKeyDown);
        window.document.body.removeEventListener(
            "mouseout",
            this.onBodyMouseOut);
        this.props.rootRecord.unlisten(this.refresh);
    }

    refresh = () => {
        this.props.refreshEvents(this.props.rootRecord);
    };
    onElementBlur = () => {
        this.props.setFocusedEvent(null);
        this.props.setSelectedEvent(null);
    };
    handleContainerResize = () => {
        this.props.setIsSmallScreen(getIsSmallScreen());
    };
    onBodyMouseOut = e => {
        if (e.relatedTarget === window.document.querySelector("html")) {
            this.onMouseUp(e);
        }
    };
    onMouseDown = e => {
        const {
            isSmallScreen,
            menuOpenRecord,
            movingEvent,
            resizingEvent,
            rootRecord,
            selectedEvent,
            focusedEvent,
        } = this.props;

        if (e.button === BUTTON_RIGHT_CLICK) {
            return;
        }

        console.log(
            "Calendar onMouseDown",
            "resizing",
            resizingEvent,
            "moving",
            movingEvent,
            "selected",
            selectedEvent,
            "focused",
            focusedEvent,
            e.button,
            isSmallScreen);
        const mouseCoordinates = {
            x: e.pageX,
            y: e.pageY,
        };
        const dateUnderMouse = dateAtPoint(mouseCoordinates);
        const isClickOnEvent = isClickOnCalendarEvent(mouseCoordinates);

        if (dateUnderMouse && !menuOpenRecord && !isClickOnEvent) {
            if (selectedEvent || focusedEvent) {
                console.log(
                    "NOT CALLING addEvent b/c selectedEvent",
                    selectedEvent,
                    " || focusedEvent",
                    focusedEvent);
            } else {
                const newEvent = rootRecord.addEvent(
                    dateUnderMouse,
                    dateUnderMouse);
                console.log(
                    "^^^^^^ addEvent dateUnderMouse",
                    dateUnderMouse,
                    newEvent);
                this.props.setFocusedEvent(newEvent);
                this.refresh();
            }
        } else if (!isSmallScreen && !isClickOnEvent) {
            this.props.setFocusedEvent(null);
        }

        this.props.setSelectedEvent(null);
    };
    updateEventFromMouseCoordinates = throttle(
        mouseCoordinates => {
            const {
                mouseStartCoordinates,
                movingEvent,
                resizingEvent,
                setMouseCoordinates,
                setMovingEventOrder,
                setMovingEventRectMap,
            } = this.props;
            let draggingEventDateRange;

            if (resizingEvent) {
                draggingEventDateRange = getResizingEventDateRange(
                    resizingEvent,
                    mouseCoordinates);
            } else if (movingEvent) {
                draggingEventDateRange = getMovingEventDateRange(
                    movingEvent,
                    mouseCoordinates,
                    mouseStartCoordinates);
                const rectMap = getMovingEventRectMap(
                    movingEvent,
                    mouseStartCoordinates,
                    mouseCoordinates);
                setMovingEventRectMap(rectMap);

                // To figure out the new order position we use the start datetime
                const movingEventRect =
                    rectMap[
                        startOfWeek(movingEvent.getDateRange().start).getTime()
                    ];
                const newOrder = this.getMovingEventOrder(
                    movingEvent,
                    movingEventRect,
                    draggingEventDateRange);

                setMovingEventOrder(newOrder);
            }

            setMouseCoordinates(mouseCoordinates, draggingEventDateRange);
        },
        20,
        {
            trailing: true,
        });

    getMovingEventOrder(
        movingEvent,
        movingEventRect,
        draggingEventDateRange
    ): MovingEventOrder {
        const {rootRecord} = this.props;
        const movingEventId = movingEvent.id();
        const events = rootRecord
            .getEventsByStartDate(draggingEventDateRange.start)
            .filter(event => event.id() !== movingEventId);
        const isReOrderOnSameDay = isSameDay(
            movingEvent.getDateRange().start,
            draggingEventDateRange.start);
        const curIndex = movingEvent.getIndex();

        if (!events.length) {
            const index = isReOrderOnSameDay
                ? curIndex
                : rootRecord.getNextIndexForStartDate(
                      draggingEventDateRange.start,
                      movingEvent);
            return {
                closestEvent: null,
                index,
            };
        }

        let closestEvent;
        let isBefore = false;
        let distance;

        // This is the middle of the moving el
        const yMoving = movingEventRect.top + movingEventRect.height / 2;
        events.forEach(event => {
            const rect = event.getDomEvent().getBoundingClientRect();
            const yMid = rect.top + rect.height / 2;
            const yDistance = Math.abs(yMoving - yMid);

            if (!distance || yDistance < distance) {
                distance = yDistance;
                isBefore = yMoving <= yMid;
                closestEvent = event;
                /*
        console.log(
            "!winner!",
            closestEvent.getTitleText(),
            "yMoving",
            yMoving,
            "mid",
            yMid,
            "isBefore?",
            isBefore,
        );
        */
            }
        });
        let index = curIndex;

        if (closestEvent) {
            index = closestEvent.getIndex();

            if (index > curIndex) {
                index--;
            }

            if (!isBefore) {
                index++;
            }
        }

        return {
            closestEvent,
            index,
            // We need to preserve this info because we may have
            // mutated the index to account for the same day case.
            isBefore,
        };
    }

    onMouseMove = e => {
        const {movingEvent, resizingEvent} = this.props;

        if (!(resizingEvent || movingEvent)) {
            return;
        }

        let mouseCoordinates = {
            x: e.pageX,
            y: e.pageY,
        };
        this.updateEventFromMouseCoordinates(mouseCoordinates);
    };
    onMouseUp = e => {
        const {
            focusedEvent,
            mouseCoordinates,
            mouseStartCoordinates,
            movingEvent,
            movingEventOrder,
            resizingEvent,
            selectedEvent,
        } = this.props;

        if (e.button === BUTTON_RIGHT_CLICK) {
            return;
        }

        console.log(
            "Calendar onMouseUp",
            "mouseCoordinates",
            mouseCoordinates,
            "resizing",
            resizingEvent,
            "moving",
            !!movingEvent,
            "movingEventOrder",
            movingEventOrder,
            "selected",
            !!selectedEvent,
            "focused",
            !!focusedEvent);

        if (mouseCoordinates) {
            if (resizingEvent) {
                const newRange = getResizingEventDateRange(
                    resizingEvent,
                    mouseCoordinates);
                const curRange = resizingEvent.getDateRange();

                if (!areDateRangesEqual(curRange, newRange)) {
                    resizingEvent.setDateRange(newRange.start, newRange.end);
                    console.log(
                        "^^^^ set resizingEvent to newRange",
                        newRange,
                        "from",
                        curRange);
                } else {
                    console.log("^^^^ no change for resizingEvent range");
                }

                this.props.setResizingEvent(null);
            } else if (movingEvent) {
                const curRange = movingEvent.getDateRange();
                const newRange = getMovingEventDateRange(
                    movingEvent,
                    mouseCoordinates,
                    mouseStartCoordinates);

                if (!areDateRangesEqual(curRange, newRange)) {
                    movingEvent.setDateRange(newRange.start, newRange.end);
                    console.log("^^^^ set movingEvent to newRange", newRange);
                } else {
                    console.log("^^^^ no range change for movingEvent");
                }

                if (movingEventOrder) {
                    console.log(
                        "^^^^ setIndex for movingEvent",
                        movingEventOrder);
                    movingEvent.setIndex(movingEventOrder.index);
                }

                this.props.setMovingEvent(null);
                this.props.setSelectedEvent(null);
            }
        } else {
            this.props.setMovingEvent(null);
        }

        this.props.setMouseCoordinates(null);
    };
    onKeyDown = e => {
        if (e.ctrlKey && e.shiftKey && e.key === "D") {
            this.props.setDebugProp({
                DEBUG_ORDER: !this.props.DEBUG_ORDER,
            });
            return;
        }

        const {isSmallScreen, selectedEvent} = this.props;

        if (!selectedEvent || isSmallScreen) {
            return;
        }

        switch (e.keyCode) {
            case BACKSPACE_KEY:
            case DELETE_KEY:
                e.preventDefault();
                selectedEvent.delete();
                this.props.setSelectedEvent(null);
        }
    };

    render() {
        const {
            displayMonth,
            events,
            isSmallScreen,
            movingEvent,
            resizingEvent,
        } = this.props;
        const weekDays = eachDayOfInterval({
            start: startOfWeek(new Date()),
            end: endOfWeek(new Date()),
        }).map(date => formatDate(date, isSmallScreen ? "EEEEE" : "EEE"));
        const weeks = chunk(getCalendarMonth(displayMonth), 7);
        return <div
            onMouseUp={this.onMouseUp}
            onMouseMove={this.onMouseMove}
            onMouseDown={this.onMouseDown}
            className={classNames(Styles.Calendar, {
                [Styles.moving]: !!movingEvent,
                [Styles.resizing]: !!resizingEvent,
            })}>
            <CalendarNavHeader/>

            <div className={Styles.weekHeader}>
                {weekDays.map((title, i) => <div
                    key={`${title}-${i}`}
                    className={Styles.cell}>
                    {title}
                </div>)}
            </div>

            <div
                className={classNames(Styles.grid, {
                    [Styles.moving]: !!movingEvent,
                    [Styles.resizing]: !!resizingEvent,
                })}>
                {weeks.map((week, i) => <CalendarWeek
                    key={i}
                    agenda={agendaForWeek(week, events)}
                    week={week}/>)}
            </div>

            {isSmallScreen && <EventLegend/>}
        </div>;
    }
}

const mapStateToProps = state => ({
    DEBUG_ORDER: state.DEBUG_ORDER,
    displayMonth: state.displayMonth,
    events: state.events,
    focusedEvent: state.focusedEvent,
    isMobileApp: state.isMobileApp,
    isSmallScreen: state.isSmallScreen,
    menuOpenRecord: state.menuOpenRecord,
    mouseCoordinates: state.mouseCoordinates,
    mouseStartCoordinates: state.mouseStartCoordinates,
    movingEvent: state.movingEvent,
    movingEventOrder: state.movingEventOrder,
    resizingEvent: state.resizingEvent,
    rootRecord: state.rootRecord,
    selectedEvent: state.selectedEvent,
});

export default connect(mapStateToProps, {
    refreshEvents,
    setDebugProp,
    setFocusedEvent,
    setIsSmallScreen,
    setMouseCoordinates,
    setMovingEvent,
    setMovingEventOrder,
    setMovingEventRectMap,
    setResizingEvent,
    setSelectedEvent,
})(Calendar);
