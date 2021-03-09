// Copyright 2017 Quip

import quip from "quip-apps-api";
import React from "react";
import {connect} from "react-redux";
import classNames from "classnames";
import differenceInDays from "date-fns/differenceInDays";
import startOfWeek from "date-fns/startOfWeek";
import {EventRecord} from "../model";
import {startOfDay} from "../util";
import CalendarEvent from "./CalendarEvent";
import Styles from "./CalendarEvent.less";
import {MouseCoordinates, MovingEventRect} from "../types";
type Props = {
    DEBUG_ORDER: boolean;
    end: Date;
    eventRecord: EventRecord;
    eventRecordIndex: number;
    movingEvent: EventRecord | undefined | null;
    movingEventRect: MovingEventRect | undefined | null;
    mouseCoordinates: MouseCoordinates | undefined | null;
    numDays: number;
    showMovingEventGuideAfter: boolean | undefined | null;
    showMovingEventGuideBefore: boolean | undefined | null;
    showMovingEventGuideColor: string | undefined | null;
    start: Date;
    week: Array<Date>;
};

class CalendarEventWrapper extends React.Component<Props, null> {
    props: Props;

    render() {
        const {
            DEBUG_ORDER,
            eventRecord,
            eventRecordIndex,
            movingEvent,
            movingEventRect,
            numDays,
            showMovingEventGuideAfter,
            showMovingEventGuideBefore,
            showMovingEventGuideColor,
            week,
        } = this.props;
        const showMovingEventGuide =
            showMovingEventGuideAfter || showMovingEventGuideBefore;
        return <div
            className={Styles.wrapper}
            style={{
                width: `calc((100% / 7) * ${numDays})`,
            }}>
            {DEBUG_ORDER && <div className={Styles.orderDebug}>
                {eventRecordIndex}
            </div>}
            {showMovingEventGuide && <div
                className={classNames(Styles.movingEventSortGuide, {
                    [Styles.after]: showMovingEventGuideAfter,
                    [Styles.before]: showMovingEventGuideBefore,
                })}
                style={{
                    background:
                        quip.apps.ui.ColorMap[showMovingEventGuideColor].VALUE,
                }}/>}
            <CalendarEvent
                eventRecord={eventRecord}
                isMoving={!!movingEvent}
                showMovingEventGuideAfter={showMovingEventGuideAfter}
                showMovingEventGuideBefore={showMovingEventGuideBefore}
                showMovingEventGuideColor={showMovingEventGuideColor}
                week={week}/>
            {movingEvent && movingEventRect && <MovingEventWrapper
                movingEventRect={movingEventRect}>
                <CalendarEvent
                    eventRecord={eventRecord}
                    isInMovingEventWrapper
                    week={week}/>
            </MovingEventWrapper>}
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    const {eventRecord, start, end} = ownProps;
    const eventRecordIndex = eventRecord.getIndex();
    const movingEvent =
        state.movingEvent && state.movingEvent.id() === eventRecord.id()
            ? state.movingEvent
            : null;
    const movingEventOrder =
        state.movingEvent &&
        state.movingEventOrder &&
        state.movingEventOrder.closestEvent &&
        state.movingEventOrder.closestEvent.id() === eventRecord.id()
            ? state.movingEventOrder
            : null;
    const showMovingEventGuideBefore =
        movingEventOrder && movingEventOrder.isBefore;
    const showMovingEventGuideAfter =
        movingEventOrder && !showMovingEventGuideBefore;
    const showMovingEventGuideColor =
        state.movingEvent && state.movingEvent.getColor();
    const movingEventRect = movingEvent
        ? state.movingEventRectMap[startOfWeek(start).getTime()]
        : null;

    // Uses startOfDay to normalize for time.
    const numDays =
        Math.abs(differenceInDays(startOfDay(start), startOfDay(end))) + 1;
    return {
        DEBUG_ORDER: state.DEBUG_ORDER,
        eventRecordIndex,
        movingEvent,
        movingEventRect,
        numDays,
        showMovingEventGuideAfter,
        showMovingEventGuideBefore,
        showMovingEventGuideColor,
    };
};

export default connect(mapStateToProps)(CalendarEventWrapper);
type MovingEventWrapperProps = {
    children: any;
    movingEventRect: MovingEventRect;
};

const MovingEventWrapper = ({
    children,
    movingEventRect,
}: MovingEventWrapperProps) => {
    const {left, top, width} = movingEventRect;
    return <div
        className={Styles.movingEventWrapper}
        style={{
            top,
            left,
            width,
        }}>
        {children}
    </div>;
};
