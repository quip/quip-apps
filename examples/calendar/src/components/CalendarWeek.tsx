// Copyright 2017 Quip

import quip from "quip-apps-api";
import React from "react";
import {connect} from "react-redux";
import classNames from "classnames";
import isEqual from "date-fns/isEqual";
import isWithinInterval from "date-fns/isWithinInterval";
import isToday from "date-fns/isToday";
import isWeekend from "date-fns/isWeekend";
import {EventRecord} from "../model";
import {dayInMonth, formatDate} from "../util";
import Styles from "./Calendar.less";
import CalendarEventWrapper from "./CalendarEventWrapper";
import {DateRange} from "../types";
type Props = {
    agenda: Array<any>;
    displayMonth: Date;
    draggingEvent: EventRecord | undefined | null;
    draggingEventDateRange: DateRange | undefined | null;
    isSmallScreen: boolean;
    week: Array<Date>;
};

class CalendarWeek extends React.Component<Props, null> {
    render() {
        const {
            agenda,
            displayMonth,
            draggingEvent,
            draggingEventDateRange,
            isSmallScreen,
            week,
        } = this.props;

        return <div className={Styles.weekRow}>
            <div className={Styles.weekRowBackground}>
                {week.map((date, i) => <CalendarDayBackground
                    date={date}
                    draggingEvent={draggingEvent}
                    draggingEventDateRange={draggingEventDateRange}
                    isInOtherMonth={!dayInMonth(date, displayMonth)}
                    isSmallScreen={isSmallScreen}
                    isToday={isToday(date)}
                    isWeekend={isWeekend(date)}
                    key={`bg-${i}`}/>)}
            </div>
            <div className={Styles.weekAgenda}>
                {agenda.map((row, rowIndex) => <div
                    key={rowIndex}
                    className={Styles.weekAgendaRow}>
                    {row.map(({event, start, end}, i) =>
                        event ? (
                            <CalendarEventWrapper
                                end={end}
                                eventRecord={event}
                                key={i}
                                start={start}
                                week={week}/>
                        ) : (
                            <div
                                key={i}
                                style={{
                                    width: 100 / 7 + "%",
                                }}/>
                        )
                    )}
                </div>)}
            </div>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        displayMonth: state.displayMonth,
        draggingEvent: state.movingEvent || state.resizingEvent || null,
        draggingEventDateRange: state.draggingEventDateRange,
        isSmallScreen: state.isSmallScreen,
    };
};

export default connect(mapStateToProps)(CalendarWeek);
type CalendarDayBackgroundProps = {
    date: Date;
    draggingEvent: EventRecord | undefined | null;
    draggingEventDateRange: DateRange | undefined | null;
    isInOtherMonth: boolean;
    isSmallScreen: boolean;
    isToday: boolean;
    isWeekend: boolean;
};

const CalendarDayBackground = ({
    date,
    draggingEvent,
    draggingEventDateRange,
    isInOtherMonth,
    isSmallScreen,
    isToday,
    isWeekend,
}: CalendarDayBackgroundProps) => {
    let style;

    if (draggingEvent &&
        draggingEventDateRange &&
        isWithinInterval(date, {
            start: draggingEventDateRange.start,
            end: draggingEventDateRange.end,
        })) {
        const {start, end} = draggingEventDateRange;
        const color = quip.apps.ui.ColorMap[draggingEvent.getColor()].VALUE;
        let boxShadows = [
            `inset 0 1px 0 0 ${color}`, // TOP
            `inset 0 -1px 0 0 ${color}`, // BOTTOM
        ];

        // LEFT
        if (isEqual(start, date)) {
            boxShadows.push(`inset 1px 0 0 ${color}`);
        }

        // RIGHT
        if (isEqual(end, date)) {
            boxShadows.push(`inset -1px 0 0 ${color}`);
        }

        style = {
            boxShadow: boxShadows.join(","),
        };
    }

    return <div
        className={classNames(Styles.day, {
            [Styles.isWeekend]: isWeekend,
        })}
        data-date-time={date.getTime()}>
        <div className={Styles.dayHighlight} style={style}/>
        <div
            className={classNames(Styles.dayNumber, {
                [Styles.isToday]: isToday,
                [Styles.isInOtherMonth]: isInOtherMonth,
            })}>
            {!isSmallScreen && isToday
                ? formatDate(date, "MMMM d")
                : formatDate(date, "d")}
        </div>
    </div>;
};
