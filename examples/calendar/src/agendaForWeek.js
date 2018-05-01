// Copyright 2017 Quip
// @flow

import isWithinRange from "date-fns/is_within_range";
import areRangesOverlapping from "date-fns/are_ranges_overlapping";
import max from "date-fns/max";
import min from "date-fns/min";

import {isSameDay, endOfDay} from "./util";

import type {EventRecord} from "./model";

const agendaForWeek = (
    week: Array<Date>,
    events: Array<EventRecord>): Array<
    Array<{event: ?EventRecord, start: Date, end: Date}>
> => {
    //console.log("EVENTS", events);
    return events
        .filter(event => isEventForWeek(event, week))
        .map(event => getItemForLayout(event, week))
        .reduce(
            (currentRows, eventWithLayout) =>
                addEventToRows(eventWithLayout, currentRows),
            [])
        .map(agendaRow =>
            week
                .map(eventOrDayPadForDay(agendaRow))
                .reduce(collapseRowEventDays, [])
        )
        .filter(emptyRowFilter);
};
export default agendaForWeek;

const isEventForWeek = (event, week) =>
    rangesOverlap(event.getDateRange(), {
        start: week[0],
        end: week[6],
    });

const firstRowForEvent = (eventWithDays, eventRows) =>
    eventRows.find(
        row =>
            !row.find(existingSpan =>
                rangesOverlap(
                    {
                        start: eventWithDays.start,
                        end: eventWithDays.end,
                    },
                    {
                        start: existingSpan.start,
                        end: existingSpan.end,
                    })
            ));

const getItemForLayout = (event, week) => {
    const {start, end} = event.getDateRange();
    return {
        end: min(end, week[6]),
        event,
        start: max(start, week[0]),
    };
};

const addEventToRows = (eventWithLayout, currentRows) => {
    const rowForEvent = firstRowForEvent(eventWithLayout, currentRows);

    if (rowForEvent) {
        rowForEvent.push(eventWithLayout);
        return currentRows;
    }
    return [...currentRows, [eventWithLayout]];
};

const eventOrDayPadForDay = agendaRow => dayOfWeek =>
    agendaRow.find(({start, end}) =>
        rangesOverlap(
            {
                start: dayOfWeek,
                end: endOfDay(dayOfWeek),
            },
            {start, end})
    ) || {
        event: undefined,
        start: dayOfWeek,
        end: dayOfWeek,
    };

const emptyRowFilter = curRow => curRow.find(({event}) => event);

const collapseRowEventDays = (rowAcc, eventWithLayout) => {
    const existing = rowAcc.find(otherEvent => eventWithLayout === otherEvent);
    if (existing) {
        return rowAcc;
    }
    return [...rowAcc, eventWithLayout];
};

const rangesOverlap = (a, b) => {
    const aIsSameDay = isSameDay(a.start, a.end);
    const bIsSameDay = isSameDay(b.start, b.end);

    if (aIsSameDay && bIsSameDay) {
        return isSameDay(a.start, b.start);
    }

    if (aIsSameDay) {
        return isWithinRange(a.start, b.start, b.end);
    }

    if (bIsSameDay) {
        return isWithinRange(b.start, a.start, a.end);
    }

    return (
        areRangesOverlapping(a.start, a.end, b.start, b.end) ||
        isSameDay(a.start, b.end) ||
        isSameDay(a.end, b.start)
    );
};
