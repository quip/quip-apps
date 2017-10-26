// Copyright 2017 Quip

import { dayInMonth, getCalendarMonth } from "./util";

describe("getCalendarMonth", () => {
    it("generates dates for the month", () => {
        const result = getCalendarMonth(new Date(2017, 7, 15));
        result.forEach(date => expect(date).toBeInstanceOf(Date));
    });

    it("generates an array of dates for filling a calendar month", () => {
        const result = getCalendarMonth(new Date(2017, 7, 15));
        expect(result.length % 7).toEqual(0);
    });

    it("only includes leading days for months not starting on Sunday", () => {
        const result = getCalendarMonth(new Date(2017, 9));
        expect(result[0]).toEqual(new Date(2017, 9, 1));
    });

    it("only includes trailing days for months not ending on Saturday", () => {
        const result = getCalendarMonth(new Date(2016, 11));
        expect(result[result.length - 1]).toEqual(new Date(2016, 11, 31));
    });
});

describe("dayInMonth", () => {
    it("is true for days is in a given month", () => {
        expect(
            dayInMonth(new Date(2017, 7), new Date(2017, 7, 1)),
        ).toBeTruthy();

        expect(
            dayInMonth(new Date(2017, 7), new Date(2017, 7, 15)),
        ).toBeTruthy();

        expect(
            dayInMonth(new Date(2017, 7), new Date(2017, 7, 31)),
        ).toBeTruthy();
    });

    it("is false for days not in given month", () => {
        expect(dayInMonth(new Date(2017, 7), new Date(2017, 8, 1))).toBeFalsy();

        expect(
            dayInMonth(new Date(2017, 7), new Date(2017, 6, 31)),
        ).toBeFalsy();
    });
});
