// Copyright 2017 Quip

import eachDayOfInterval from "date-fns/eachDayOfInterval";

import agendaForWeek from "./agendaForWeek";

import {stubEventRecord} from "./test_stubs";

const lastFridayDate = new Date(2017, 7, 4);
const sundayDate = new Date(2017, 7, 6);
const mondayDate = new Date(2017, 7, 7);
const saturdayDate = new Date(2017, 7, 12);
const tuesdayDate = new Date(2017, 7, 8);

const nextSundayDate = new Date(2017, 7, 13);

test("creates an agenda of events spanning the week", () => {
    const sundayEvent = stubEventRecord({
        start: sundayDate,
        end: sundayDate,
    });

    const mondayEvent = stubEventRecord({
        start: mondayDate,
        end: mondayDate,
    });

    const week = eachDayOfInterval({start: sundayDate, end: saturdayDate});
    const events = [mondayEvent, sundayEvent];

    expect(agendaForWeek(week, events)).toEqual([
        [
            {
                event: sundayEvent,
                start: sundayDate,
                end: sundayDate,
            },
            {
                event: mondayEvent,
                start: mondayDate,
                end: mondayDate,
            },
            {
                event: undefined,
                start: week[2],
                end: week[2],
            },
            {
                event: undefined,
                start: week[3],
                end: week[3],
            },
            {
                event: undefined,
                start: week[4],
                end: week[4],
            },
            {
                event: undefined,
                start: week[5],
                end: week[5],
            },
            {
                event: undefined,
                start: week[6],
                end: week[6],
            },
        ],
    ]);
});

test("creates a new row when events are on the same day", () => {
    const mondayEvent = stubEventRecord({
        start: mondayDate,
        end: mondayDate,
    });

    const otherMondayEvent = stubEventRecord({
        start: mondayDate,
        end: mondayDate,
    });

    const events = [mondayEvent, otherMondayEvent];
    const week = eachDayOfInterval({start: sundayDate, end: saturdayDate});

    expect(agendaForWeek(week, events)).toEqual([
        [
            {
                event: undefined,
                start: week[0],
                end: week[0],
            },
            {
                event: mondayEvent,
                start: mondayDate,
                end: mondayDate,
            },
            {
                event: undefined,
                start: week[2],
                end: week[2],
            },
            {
                event: undefined,
                start: week[3],
                end: week[3],
            },
            {
                event: undefined,
                start: week[4],
                end: week[4],
            },
            {
                event: undefined,
                start: week[5],
                end: week[5],
            },
            {
                event: undefined,
                start: week[6],
                end: week[6],
            },
        ],
        [
            {
                event: undefined,
                start: week[0],
                end: week[0],
            },
            {
                event: otherMondayEvent,
                start: mondayDate,
                end: mondayDate,
            },
            {
                event: undefined,
                start: week[2],
                end: week[2],
            },
            {
                event: undefined,
                start: week[3],
                end: week[3],
            },
            {
                event: undefined,
                start: week[4],
                end: week[4],
            },
            {
                event: undefined,
                start: week[5],
                end: week[5],
            },
            {
                event: undefined,
                start: week[6],
                end: week[6],
            },
        ],
    ]);
});

test("creates a new row when event boundaries are shared", () => {
    const sundayEvent = stubEventRecord({
        start: sundayDate,
        end: sundayDate,
    });

    const mondayEvent = stubEventRecord({
        start: mondayDate,
        end: mondayDate,
    });

    const sundayMondayEvent = stubEventRecord({
        start: sundayDate,
        end: mondayDate,
    });

    const events = [mondayEvent, sundayEvent, sundayMondayEvent];
    const week = eachDayOfInterval({start: sundayDate, end: saturdayDate});

    expect(agendaForWeek(week, events)).toEqual([
        [
            {
                event: sundayEvent,
                start: sundayDate,
                end: sundayDate,
            },
            {
                event: mondayEvent,
                start: mondayDate,
                end: mondayDate,
            },
            {
                event: undefined,
                start: week[2],
                end: week[2],
            },
            {
                event: undefined,
                start: week[3],
                end: week[3],
            },
            {
                event: undefined,
                start: week[4],
                end: week[4],
            },
            {
                event: undefined,
                start: week[5],
                end: week[5],
            },
            {
                event: undefined,
                start: week[6],
                end: week[6],
            },
        ],
        [
            {
                event: sundayMondayEvent,
                start: sundayDate,
                end: mondayDate,
            },
            {
                event: undefined,
                start: week[2],
                end: week[2],
            },
            {
                event: undefined,
                start: week[3],
                end: week[3],
            },
            {
                event: undefined,
                start: week[4],
                end: week[4],
            },
            {
                event: undefined,
                start: week[5],
                end: week[5],
            },
            {
                event: undefined,
                start: week[6],
                end: week[6],
            },
        ],
    ]);
});

test("creates a new row when event ranges overlap", () => {
    const sundayEvent = stubEventRecord({
        start: sundayDate,
        end: sundayDate,
    });

    const mondayTuesdayEvent = stubEventRecord({
        start: mondayDate,
        end: tuesdayDate,
    });

    const sundayMondayEvent = stubEventRecord({
        start: sundayDate,
        end: mondayDate,
    });

    const events = [sundayEvent, mondayTuesdayEvent, sundayMondayEvent];
    const week = eachDayOfInterval({start: sundayDate, end: saturdayDate});

    expect(agendaForWeek(week, events)).toEqual([
        [
            {
                event: sundayEvent,
                start: sundayDate,
                end: sundayDate,
            },
            {
                event: mondayTuesdayEvent,
                start: mondayDate,
                end: tuesdayDate,
            },
            {
                event: undefined,
                start: week[3],
                end: week[3],
            },
            {
                event: undefined,
                start: week[4],
                end: week[4],
            },
            {
                event: undefined,
                start: week[5],
                end: week[5],
            },
            {
                event: undefined,
                start: week[6],
                end: week[6],
            },
        ],
        [
            {
                event: sundayMondayEvent,
                start: sundayDate,
                end: mondayDate,
            },
            {
                event: undefined,
                start: week[2],
                end: week[2],
            },
            {
                event: undefined,
                start: week[3],
                end: week[3],
            },
            {
                event: undefined,
                start: week[4],
                end: week[4],
            },
            {
                event: undefined,
                start: week[5],
                end: week[5],
            },
            {
                event: undefined,
                start: week[6],
                end: week[6],
            },
        ],
    ]);
});

test("supports events starting previous week", () => {
    const lastFridayTillSundayEvent = stubEventRecord({
        start: lastFridayDate,
        end: sundayDate,
    });
    const events = [lastFridayTillSundayEvent];
    const week = eachDayOfInterval({start: sundayDate, end: saturdayDate});

    expect(agendaForWeek(week, events)).toEqual([
        [
            {
                event: lastFridayTillSundayEvent,
                start: sundayDate,
                end: sundayDate,
            },
            {
                event: undefined,
                start: week[1],
                end: week[1],
            },
            {
                event: undefined,
                start: week[2],
                end: week[2],
            },
            {
                event: undefined,
                start: week[3],
                end: week[3],
            },
            {
                event: undefined,
                start: week[4],
                end: week[4],
            },
            {
                event: undefined,
                start: week[5],
                end: week[5],
            },
            {
                event: undefined,
                start: week[6],
                end: week[6],
            },
        ],
    ]);
});

test("supports events ending the following week", () => {
    const saturdayTilNextSundayEvent = stubEventRecord({
        start: saturdayDate,
        end: nextSundayDate,
    });
    const events = [saturdayTilNextSundayEvent];
    const week = eachDayOfInterval({start: sundayDate, end: saturdayDate});

    expect(agendaForWeek(week, events)).toEqual([
        [
            {
                event: undefined,
                start: week[0],
                end: week[0],
            },
            {
                event: undefined,
                start: week[1],
                end: week[1],
            },
            {
                event: undefined,
                start: week[2],
                end: week[2],
            },
            {
                event: undefined,
                start: week[3],
                end: week[3],
            },
            {
                event: undefined,
                start: week[4],
                end: week[4],
            },
            {
                event: undefined,
                start: week[5],
                end: week[5],
            },
            {
                event: saturdayTilNextSundayEvent,
                start: saturdayDate,
                end: saturdayDate,
            },
        ],
    ]);
});
