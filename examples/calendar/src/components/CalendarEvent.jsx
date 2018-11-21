/* @flow */
// Copyright 2017 Quip

// $FlowIssueQuipModule
import quip from "quip";
import React from "react";
import {connect} from "react-redux";
import classNames from "classnames";
import isWithinRange from "date-fns/is_within_range";

import {setMovingEvent, setSelectedEvent} from "../actions";
import {dateAtPoint} from "../util";
import {EventRecord} from "../model";

import Styles from "./CalendarEvent.less";
import EventEndHandle from "./EventEndHandle.jsx";
import EventDropdown from "./EventDropdown.jsx";
import EventRichTextBox from "./EventRichTextBox.jsx";

type CalendarEventProps = {
    commentCount: number,
    eventRecord: EventRecord,
    isStartDateWithinThisWeek: boolean,
    isEndDateWithinThisWeek: boolean,
    isInMovingEventWrapper?: boolean,
    isMobileApp: boolean,
    isMoving: boolean,
    isSelected: boolean,
    isSmallScreen: boolean,
    setMovingEvent: Function,
    setSelectedEvent: Function,
    week: Array<Date>,
};

class CalendarEvent extends React.Component<CalendarEventProps, null> {
    el: ?HTMLDivElement;

    onMouseDownCommentBubble = e => {
        e.stopPropagation();
    };

    onMouseDownBottomRow = e => {
        if (e.button === 2 || this.props.isMobileApp) {
            return;
        }
        if (!this.el) {
            return;
        }
        const mouseStartCoordinates = {
            date: dateAtPoint({x: e.pageX, y: e.pageY}),
            x: e.pageX,
            y: e.pageY,
        };
        this.props.setMovingEvent(
            this.props.eventRecord,
            mouseStartCoordinates);
        e.stopPropagation();
    };

    render() {
        const {
            commentCount,
            eventRecord,
            isEndDateWithinThisWeek,
            isInMovingEventWrapper,
            isMobileApp,
            isMoving,
            isStartDateWithinThisWeek,
            isSmallScreen,
            isSelected,
            week,
        } = this.props;

        const color = eventRecord.getColor();
        const eventHandleFillColor = isSelected
            ? quip.apps.ui.ColorMap.WHITE.VALUE
            : quip.apps.ui.ColorMap[color].VALUE;
        const textColor = isSelected
            ? quip.apps.ui.ColorMap.WHITE.KEY
            : eventRecord.getColor();

        return <div
            className={classNames(Styles.event, {
                [Styles.extendLeft]: !isStartDateWithinThisWeek,
                [Styles.extendRight]: !isEndDateWithinThisWeek,
                [Styles.isMoving]: isMoving,
            })}
            ref={el => {
                this.el = el;
                if (!isInMovingEventWrapper && el) {
                    eventRecord.setDomEvent({
                        weekStartTime: week[0].getTime(),
                        el,
                    });
                }
                if (!isInMovingEventWrapper &&
                    !isSmallScreen &&
                    isStartDateWithinThisWeek) {
                    // Tells the quip comment UI to focus on this element.
                    eventRecord.setDom(el);
                }
            }}
            style={{
                backgroundColor: isSelected
                    ? quip.apps.ui.ColorMap[color].VALUE
                    : quip.apps.ui.ColorMap[color].VALUE_LIGHT,
                borderColor: quip.apps.ui.ColorMap[color].VALUE_STROKE,
                opacity: isInMovingEventWrapper ? 0.7 : null,
            }}>
            {!isSmallScreen && <div className={Styles.row}>
                <div
                    className={classNames(Styles.title, {
                        [Styles.titleContinuation]: !isStartDateWithinThisWeek,
                    })}>
                    <EventRichTextBox
                        eventRecord={eventRecord}
                        color={textColor}
                        week={week}/>
                </div>
                {isEndDateWithinThisWeek && <EventDropdown
                    color={
                        isSelected
                            ? quip.apps.ui.ColorMap.WHITE.KEY
                            : eventRecord.getColor()
                    }
                    eventRecord={eventRecord}
                    style={{
                        paddingLeft: 4,
                    }}/>}
            </div>}
            <div
                className={classNames(Styles.row, Styles.bottomRow)}
                onMouseDown={this.onMouseDownBottomRow}>
                <div
                    className={classNames(Styles.commentBubble, {
                        [Styles.commented]: commentCount > 0,
                    })}
                    onMouseDown={this.onMouseDownCommentBubble}>
                    {!isSmallScreen &&
                        isStartDateWithinThisWeek && <quip.apps.ui.CommentsTrigger
                            color={color}
                            invertColor={isSelected}
                            record={eventRecord}
                            showEmpty/>}
                </div>
                {isEndDateWithinThisWeek &&
                    !isMobileApp && <div className={Styles.handleContainer}>
                        <EventEndHandle
                            eventRecord={eventRecord}
                            fill={eventHandleFillColor}/>
                    </div>}
            </div>

            {!isStartDateWithinThisWeek && <div
                className={Styles.continueCircleStart}
                style={{
                    background: quip.apps.ui.ColorMap[textColor].VALUE,
                }}/>}
            {!isEndDateWithinThisWeek && <div
                className={Styles.continueCircleEnd}
                style={{
                    background: quip.apps.ui.ColorMap[textColor].VALUE,
                }}/>}
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    const eventRecord = ownProps.eventRecord;
    const week = ownProps.week;
    const {start, end} = eventRecord.getDateRange();
    return {
        commentCount: eventRecord.getCommentCount(),
        isStartDateWithinThisWeek: isWithinRange(start, week[0], week[6]),
        isEndDateWithinThisWeek: isWithinRange(end, week[0], week[6]),
        isMobileApp: state.isMobileApp,
        isSelected:
            state.selectedEvent &&
            state.selectedEvent.id() === eventRecord.id(),
        isSmallScreen: state.isSmallScreen,
    };
};
CalendarEvent = connect(
    mapStateToProps,
    {
        setMovingEvent,
        setSelectedEvent,
    })(CalendarEvent);

export default CalendarEvent;
