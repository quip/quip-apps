// Copyright 2017 Quip

import quip from "quip-apps-api";
import quiptext from "quiptext";
import moment from "moment";
import isDate from "date-fns/isDate";
import startOfWeek from "date-fns/startOfWeek";
import {isSameDay} from "./util";
import debounce from "lodash.debounce";
import {DateRange} from "./types";
export type Event = {
    color: "RED" | "ORANGE" | "YELLOW" | "GREEN" | "BLUE" | "VIOLET";
    dateRange: string;
    titleText: string;
};
export const colors = [
    quip.apps.ui.ColorMap.RED.KEY,
    quip.apps.ui.ColorMap.ORANGE.KEY,
    quip.apps.ui.ColorMap.YELLOW.KEY,
    quip.apps.ui.ColorMap.GREEN.KEY,
    quip.apps.ui.ColorMap.BLUE.KEY,
    quip.apps.ui.ColorMap.VIOLET.KEY,
];

const formatDisplayMonthForStorage = (d: Date): string => {
    return String(d);
};

const formatDefaultMonthForApi = (d: Date): string => {
    return moment(d).format("YYYY-MM");
};

const parseDefaultMonthFromStorage = (displayMonth: string): Date => {
    // Fixes a previous display month data type by converting
    // New date format ranges from 2020-01 to 2020-12 (zero-padded, eg 05).
    // Date(string) parses it after adding one to the month.
    const regex = /^\d{4}-[01][0-9]$/g;

    if (regex.test(displayMonth)) {
        const tempDate = new Date(displayMonth);
        return new Date(tempDate.setMonth(tempDate.getMonth() + 1));
    }

    return new Date(displayMonth);
};

const parseDisplayMonthFromApi = (s: string): Date => {
    const date = moment(s, "YYYY-MM").toDate();
    // Adding 5 days to potentially avoid any time-zone differences
    // since parsing date from API sets it to the beginning of the month.
    date.setDate(date.getDate() + 5);
    return date;
};

const formatAllDayDateForStorage = (d: Date): string => {
    // Stores it as zero-based months - eg. 2020,0,1 (Jan 1st, 2020)
    return `${d.getFullYear()},${d.getMonth()},${d.getDate()}`;
};

const formatAllDayDateForApi = (d: Date): string => {
    return moment(d).format("YYYY-MM-DD");
};

const parseAllDayStringFromStorage = (s: string): Date => {
    if (typeof s === "number") {
        // We formerly used timestamps in storage but that has tz issues.
        return new Date(s);
    } else if (s.includes(",")) {
        const [year, monthIndex, day] = s.split(",");
        return new Date(
            window.parseInt(year, 10),
            window.parseInt(monthIndex, 10),
            window.parseInt(day, 10));
    } else {
        throw new Error(s + " is not a valid date from storage.");
    }
};

const parseAllDayStringFromApi = (s: string): Date => {
    return moment(s, "YYYY-MM-DD").toDate();
};

const eventPlaceholderText = quiptext("New Event");
export class RootRecord extends quip.apps.RootRecord {
    private listener;

    static getProperties() {
        return {
            events: quip.apps.RecordList.Type(EventRecord),
            displayMonth: "string",
        };
    }

    static getDefaultProperties() {
        return {
            displayMonth: String(new Date()),
            events: [],
        };
    }

    initialize() {
        // TODO(kz2): this should probably unlisten at some point
        this.listener = this.listen(this.setStatePayload_);
    }

    setStatePayload_ = debounce(() => {
        // @ts-ignore remove this ignore with quip-apps-private
        if (typeof quip.apps.setPayload === "function") {
            // @ts-ignore remove this ignore with quip-apps-private
            quip.apps.setPayload(this.getExportState());
        }
    }, 2000);

    getEvents(): Array<EventRecord> {
        return this.get("events").getRecords();
    }

    getEventsByStartDate(start: Date): Array<EventRecord> {
        return this.getEvents().filter(event =>
            isSameDay(event.getDateRange().start, start)
        );
    }

    getLastEvent() {
        const records = this.get("events").getRecords();

        if (!records.length) {
            return;
        }

        return records.reduce((a, b) => {
            return b.get("created") > a.get("created") ? b : a;
        });
    }

    populateDisplayMonth(displayMonth: string): void {
        const displayMonthDate = parseDisplayMonthFromApi(displayMonth);
        this.set(
            "displayMonth",
            formatDisplayMonthForStorage(displayMonthDate));
    }

    populateEvents(events: Event[]): Array<EventRecord> {
        events.forEach(event => {
            // @ts-ignore TODO(kz2): dateRange has type string
            const start = parseAllDayStringFromApi(event.dateRange.start);
            // @ts-ignore TODO(kz2): dateRange has type string
            const end = parseAllDayStringFromApi(event.dateRange.end);
            this.get("events").add(
                {
                    dateRange: JSON.stringify({
                        start: formatAllDayDateForStorage(start),
                        end: formatAllDayDateForStorage(end),
                    }),
                    color: event.color,
                    title: {
                        "RichText_placeholderText": eventPlaceholderText,
                        // @ts-ignore TODO(kz2) content does not exist on type
                        // Event
                        "RichText_defaultText": event.content,
                    },
                },
                this.getNextIndexForStartDate(start));
        });
        quip.apps.recordQuipMetric("events_populated", undefined);
        return this.get("events");
    }

    addEvent(start: Date, end: Date): EventRecord {
        let color = quip.apps.ui.ColorMap.RED.KEY;
        const lastEvent = this.getLastEvent();

        if (lastEvent) {
            const lastColor = lastEvent.getColor();
            const lastColorIndex = colors.indexOf(lastColor);
            let nextColorIndex = lastColorIndex + 1;

            if (nextColorIndex >= colors.length) {
                nextColorIndex = 0;
            }

            color = colors[nextColorIndex];
        }

        const newEvent = this.get("events").add(
            {
                dateRange: JSON.stringify({
                    start: formatAllDayDateForStorage(start),
                    end: formatAllDayDateForStorage(end),
                }),
                color,
            },
            this.getNextIndexForStartDate(start));

        quip.apps.recordQuipMetric("add_event", {
            event_id: newEvent.id(),
        });
        return newEvent;
    }

    getExportState(): String {
        let events = this.getEvents().map(event => {
            const dateRange = event.getDateRange();
            // @ts-ignore TODO(kz2): dateRange.start is type `Date`, but
            // the assigned value is type `string`
            dateRange.start = formatAllDayDateForApi(dateRange.start);
            // @ts-ignore TODO(kz2): dateRange.end is type `Date`, but
            // the assigned value is type `string`
            dateRange.end = formatAllDayDateForApi(dateRange.end);
            return {
                color: event.getColor(),
                dateRange,
                content: event.getTitleText(),
            };
        });
        return JSON.stringify({
            events,
            displayMonth: formatDefaultMonthForApi(this.getDisplayMonth()),
        });
    }

    getNextIndexForStartDate(
        startDate: Date,
        excludeEvent?: EventRecord | null
    ): number {
        let nextIndex = 0;
        let events = this.getEvents();

        if (excludeEvent) {
            events = events.filter(event => event.id() !== excludeEvent.id());
        }

        if (!events.length) {
            return nextIndex;
        }

        const t = startDate.getTime();

        for (let i = 0, event; (event = events[i]); i++) {
            if (t < event.getDateRange().start.getTime()) {
                nextIndex = i;
                break;
            }

            nextIndex = i + 1;
        }

        return nextIndex;
    }

    getDisplayMonth() {
        const displayMonth = this.get("displayMonth");
        return parseDefaultMonthFromStorage(displayMonth);
    }

    setDisplayMonth(date: Date) {
        this.set("displayMonth", formatDisplayMonthForStorage(date));
        quip.apps.recordQuipMetric("set_display_month", {});
    }
}
export class EventRecord extends quip.apps.Record {
    private listener;
    private commentsListener;
    private titleContentListener;

    domNode: Element | undefined | null;

    // An array of startOfWeek time -> el on that week.
    domNodesEvent: {
        [x: number]: Element;
    };

    static getProperties() {
        return {
            color: "string",
            created: "number",
            dateRange: "string",
            title: quip.apps.RichTextRecord,
        };
    }

    static getDefaultProperties() {
        return {
            color: quip.apps.ui.ColorMap.RED.KEY,
            created: Date.now(),
            title: {
                RichText_placeholderText: eventPlaceholderText,
            },
        };
    }

    initialize() {
        this.domNode = null;
        this.domNodesEvent = {};
        this.listener = this.listen(this.notifyParent);
        this.commentsListener = this.listenToComments(this.notifyParent);

        if (this.get("title")) {
            this.titleContentListener = this.get("title").listenToContent(
                this.notifyParent);
        }
    }

    delete() {
        if (this.listener) {
            this.unlisten(this.notifyParent);
        }

        if (this.commentsListener) {
            this.unlistenToComments(this.notifyParent);
        }

        if (this.titleContentListener) {
            if (this.get("title")) {
                this.get("title").unlistenToContent(this.notifyParent);
            }
        }

        quip.apps.recordQuipMetric("delete_event", {
            event_id: this.id(),
        });
        super.delete();
    }

    notifyParent = () => {
        this.getParentRecord().notifyListeners();
    };

    supportsComments() {
        return true;
    }

    getTitleText() {
        if (this.get("title")) {
            return this.get("title").getTextContent();
        }
    }

    getDom() {
        return this.domNode;
    }

    setDom(el?: Element | null) {
        this.domNode = el;
    }

    getDomNodesForEvent(): object {
        return this.domNodesEvent;
    }

    getDomEvent(weekStartTime?: number): Element | undefined | null {
        if (!this.domNodesEvent) {
            return;
        }

        weekStartTime =
            weekStartTime || startOfWeek(this.getDateRange().start).getTime();
        return this.domNodesEvent[weekStartTime];
    }

    setDomEvent(eventForWeek?: {el: Element; weekStartTime: number}) {
        if (!eventForWeek) {
            this.domNodesEvent = {};
            return;
        }

        if (!this.domNodesEvent) {
            this.domNodesEvent = {};
        }

        const {el, weekStartTime} = eventForWeek;
        this.domNodesEvent[weekStartTime] = el;
    }

    getIndex() {
        return this.getContainingList().indexOf(this.id());
    }

    setIndex(i: number) {
        if (typeof i !== "number") {
            throw new Error("Cannot setIndex without a number value: " + i);
        }

        this.getContainingList().move(this, i);
    }

    getDateRange(): DateRange {
        const {start, end} = JSON.parse(this.get("dateRange"));
        // TODO: update when we support time
        return {
            start: parseAllDayStringFromStorage(start),
            end: parseAllDayStringFromStorage(end),
        };
    }

    setDateRange(start: Date, end: Date) {
        if (!(isDate(start) && isDate(end))) {
            console.error("start", start, "end", end);
            throw new Error("start and end must both be Date types");
        }
        // TODO: update when we start using time
        this.set(
            "dateRange",
            JSON.stringify({
                start: formatAllDayDateForStorage(start),
                end: formatAllDayDateForStorage(end),
            }));

        quip.apps.recordQuipMetric("move_event", {
            event_id: this.id(),
        });
    }

    getColor() {
        return this.get("color");
    }

    setColor(color: string) {
        this.set("color", color);
    }
}
quip.apps.registerClass(RootRecord, "Root");
quip.apps.registerClass(EventRecord, "project-calendar-event");
