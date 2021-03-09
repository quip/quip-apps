// Copyright 2017 Quip
import quip from "quip-apps-api";
import addDays from "date-fns/addDays";
import differenceInDays from "date-fns/differenceInDays";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import getDaysInMonth from "date-fns/getDaysInMonth";
import isAfter from "date-fns/isAfter";
import isEqual from "date-fns/isEqual";
import isWithinInterval from "date-fns/isWithinInterval";
import lastDayOfMonth from "date-fns/lastDayOfMonth";
import startOfMonth from "date-fns/startOfMonth";
import subDays from "date-fns/subDays";
import subMonths from "date-fns/subMonths";
import de from "date-fns/locale/de";
import es from "date-fns/locale/es";
import fr from "date-fns/locale/fr";
import it from "date-fns/locale/it";
import ja from "date-fns/locale/ja";
import ko from "date-fns/locale/ko";
import nl from "date-fns/locale/nl";
import pt from "date-fns/locale/pt";
import ru from "date-fns/locale/ru";
import tr from "date-fns/locale/tr";
import zh_cn from "date-fns/locale/zh-CN";
import range from "lodash.range";
import polyfills from "./polyfills";
import {EventRecord} from "./model";
import {
    DateRange,
    MouseCoordinates,
    MouseStartCoordinates,
    MovingEventRect,
    MovingEventRectMap,
} from "./types";
const SUPPORTED_LANGUAGES = {
    "de": de,
    "es": es,
    "fr": fr,
    "it": it,
    "ja": ja,
    "ko": ko,
    "nl": nl,
    "pt": pt,
    "ru": ru,
    "tr": tr,
    "zh_CN": zh_cn,
};

const makeDateRange = (startDate: Date, numberOfDays: number) =>
    range(0, numberOfDays).map(index => addDays(startDate, index));

export const getCalendarMonth = (monthDate: Date): Array<Date> => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDayOfWeek = getDay(startOfMonth(monthDate));
    const prevMonthDate = subMonths(monthDate, 1);
    const previousMonthDays = makeDateRange(
        subDays(lastDayOfMonth(prevMonthDate), firstDayOfWeek - 1),
        firstDayOfWeek);
    const lastDayOfMonthInWeek = getDay(lastDayOfMonth(monthDate));
    const nextMonthDays = makeDateRange(
        addDays(lastDayOfMonth(monthDate), 1),
        6 - lastDayOfMonthInWeek);
    return [
        ...previousMonthDays,
        ...makeDateRange(startOfMonth(monthDate), daysInMonth),
        ...nextMonthDays,
    ];
};
export const formatDate = (date, dateFormat) => {
    const user = quip.apps.getViewingUser();
    let options;

    if (user && user.getLanguage && user.getLanguage() in SUPPORTED_LANGUAGES) {
        options = {
            "locale": SUPPORTED_LANGUAGES[user.getLanguage()],
        };
    }

    return format(date, dateFormat, options);
};
export const isSameDay = (date1: Date, date2: Date): boolean => {
    // Simplified implementation of isSameDay from date-fns that does not call
    // setHours on the start/end dates before comparing them (setHours is
    // expensive on iOS, and we call this function a lot).
    return (
        date1.getDate() == date2.getDate() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getFullYear() == date2.getFullYear()
    );
};
const startOfDayCache = {};
export const startOfDay = (date: Date): Date => {
    // Caching implementation of startOfDay from date-fns that avoids repeatedly
    // calling setHours (slow on iOS) when used with the same timestamp (which
    // often happens when rendering a calendar month).
    const cacheKey = "start-of-day-" + date.getTime();
    let result = startOfDayCache[cacheKey];

    if (!result) {
        result = new Date(date.getTime());
        result.setHours(0, 0, 0, 0);
        startOfDayCache[cacheKey] = result;
    }

    return result;
};
const endOfDayCache = {};
export const endOfDay = (date: Date): Date => {
    // See startOfDay comments.
    const cacheKey = "end-of-day-" + date.getTime();
    let result = endOfDayCache[cacheKey];

    if (!result) {
        result = new Date(date.getTime());
        result.setHours(23, 59, 59, 999);
        endOfDayCache[cacheKey] = result;
    }

    return result;
};
export const dayInMonth = (date: Date, month: Date) =>
    isWithinInterval(date, {
        start: startOfMonth(month),
        end: lastDayOfMonth(month),
    });
export const getIsSmallScreen = (): boolean =>
    quip.apps.getContainerWidth() <= 600;
export const isElAtPoint = (
    xy: MouseCoordinates,
    className: string
): boolean => {
    const {x, y} = xy;
    return !!polyfills
        .elementsFromPoint(x, y)
        .find(el => el.classList.contains(className));
};
export const elAtPoint = (
    xy: MouseCoordinates,
    className: string
): HTMLElement | undefined | null => {
    const {x, y} = xy;
    return polyfills
        .elementsFromPoint(x, y)
        .find(el => el.classList.contains(className));
};
export const dayElAtPoint = (xy: MouseCoordinates) =>
    elAtPoint(xy, "Calendar__day");
export const dateAtPoint = (xy: MouseCoordinates) => {
    const dayEl = dayElAtPoint(xy);

    if (!dayEl) {
        return;
    }

    const dateString = Number(dayEl.getAttribute("data-date-time"));

    if (!dateString) {
        return;
    }

    let d = new Date();
    d.setTime(dateString);
    return d;
};
export const getMovingEventDateRange = (
    movingEvent: EventRecord,
    mouseCoordinates: MouseCoordinates,
    mouseStartCoordinates: MouseStartCoordinates
) => {
    const {start, end} = movingEvent.getDateRange();
    const endDragDate = dateAtPoint(mouseCoordinates);

    if (endDragDate) {
        const diffInDays = differenceInDays(
            mouseStartCoordinates.date,
            endDragDate);

        if (Math.abs(diffInDays) !== 0) {
            const newStartDate = subDays(start, diffInDays);
            const newEndDate = subDays(end, diffInDays);
            return {
                start: newStartDate,
                end: newEndDate,
            };
        }
    }

    return {
        start,
        end,
    };
};
export const getResizingEventDateRange = (
    resizingEvent: EventRecord,
    mouseCoordinates: MouseCoordinates
) => {
    const {start, end} = resizingEvent.getDateRange();
    const newEndDate = dateAtPoint(mouseCoordinates);

    if (newEndDate &&
        (isAfter(newEndDate, start) || isEqual(newEndDate, start))) {
        const diffInDays = differenceInDays(end, newEndDate);

        if (Math.abs(diffInDays) !== 0) {
            return {
                start,
                end: newEndDate,
            };
        }
    }

    return {
        start,
        end,
    };
};
export const areDateRangesEqual = function (
    a: DateRange,
    b: DateRange
): boolean {
    if (a.start.getTime() !== b.start.getTime()) {
        return false;
    }

    if (a.end.getTime() !== b.end.getTime()) {
        return false;
    }

    return true;
};
export function getMovingEventRectMap(
    movingEvent: EventRecord,
    mouseStartCoordinates: MouseStartCoordinates,
    mouseCoordinates?: MouseCoordinates
): MovingEventRectMap {
    const movingEventElMap = movingEvent.getDomNodesForEvent();

    let rectMap = {};
    Object.keys(movingEventElMap).forEach((weekStartTime, i) => {
        const el = movingEventElMap[weekStartTime];

        if (el.ownerDocument.body.contains(el)) {
            rectMap[weekStartTime] = getMovingEventRect(
                el,
                mouseStartCoordinates,
                mouseCoordinates);
        }
    });
    return rectMap;
}

function getMovingEventRect(
    el: HTMLDivElement,
    mouseStartCoordinates: MouseStartCoordinates,
    mouseCoordinates?: MouseCoordinates | null
): MovingEventRect {
    mouseCoordinates = mouseCoordinates || mouseStartCoordinates;
    const rect = el.getBoundingClientRect();
    const offsetX = mouseStartCoordinates.x - rect.left;
    const offsetY = mouseStartCoordinates.y - rect.top;
    const top = mouseCoordinates.y - offsetY;
    const left = mouseCoordinates.x - offsetX;
    const wrapperEl = el.parentElement;

    const width = wrapperEl.offsetWidth;
    const height = rect.height;

    return {
        height,
        left,
        top,
        width,
    };
}
