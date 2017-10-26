// Copyright 2017 Quip
// @flow

// $FlowIssueQuipModule
import quip from "quip";

import isDate from "date-fns/is_date";
import isSameDay from "date-fns/is_same_day";
import startOfWeek from "date-fns/start_of_week";

import type { DateRange } from "./types";

export const colors = [
    quip.elements.ui.ColorMap.RED.KEY,
    quip.elements.ui.ColorMap.ORANGE.KEY,
    quip.elements.ui.ColorMap.YELLOW.KEY,
    quip.elements.ui.ColorMap.GREEN.KEY,
    quip.elements.ui.ColorMap.BLUE.KEY,
    quip.elements.ui.ColorMap.VIOLET.KEY,
];

export class RootRecord extends quip.elements.RootRecord {
    static getProperties() {
        return {
            events: quip.elements.RecordList.Type(EventRecord),
            displayMonth: "string",
        };
    }

    static getDefaultProperties() {
        return {
            displayMonth: String(new Date()),
            events: [],
        };
    }

    getEvents(): Array<EventRecord> {
        return this.get("events").getRecords();
    }

    getEventsByStartDate(start: Date): Array<EventRecord> {
        return this.getEvents().filter(event =>
            isSameDay(event.getDateRange().start, start),
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

    addEvent(start: Date, end: Date): EventRecord {
        const startTime = start.getTime();
        const endTime = end.getTime();
        let color = quip.elements.ui.ColorMap.RED.KEY;
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
                    start: startTime,
                    end: endTime,
                }),
                color,
            },
            this.getNextIndexForStartDate(start),
        );
        //quip.elements.sendMessage("added an event");
        quip.elements.recordQuipMetric("add_event", {
            event_id: newEvent.id(),
        });
        return newEvent;
    }

    getNextIndexForStartDate(
        startDate: Date,
        excludeEvent: ?EventRecord,
    ): number {
        let nextIndex = 0;
        let events = this.getEvents();
        if (excludeEvent) {
            // $FlowFixMe
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
        return new Date(this.get("displayMonth"));
    }

    setDisplayMonth(date: Date) {
        this.set("displayMonth", String(date));
        quip.elements.recordQuipMetric("set_display_month");
    }
}

export class EventRecord extends quip.elements.Record {
    domNode: ?Element;
    // An array of startOfWeek time -> el on that week.
    domNodesEvent: { [number]: Element };

    static getProperties() {
        return {
            color: "string",
            created: "number",
            dateRange: "string",
            title: quip.elements.RichTextRecord,
        };
    }

    static getDefaultProperties() {
        return {
            color: quip.elements.ui.ColorMap.RED.KEY,
            created: Date.now(),
            title: {
                RichText_placeholderText: "New Event",
            },
        };
    }

    initialize() {
        this.domNode = null;
        this.domNodesEvent = {};
        this.listener = this.listen(this.notifyParent);
        this.commentsListener = this.listenToComments(this.notifyParent);
    }

    delete() {
        //quip.elements.sendMessage("deleted an event");
        if (this.listener) {
            this.unlisten(this.notifyParent);
        }
        if (this.commentsListener) {
            this.unlistenToComments(this.notifyParent);
        }
        quip.elements.recordQuipMetric("delete_event", {
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
        return this.get("title").getTextContent();
    }

    getDom() {
        return this.domNode;
    }

    setDom(el: ?Element) {
        this.domNode = el;
    }

    getDomNodesForEvent(): Object {
        return this.domNodesEvent;
    }

    getDomEvent(weekStartTime?: number): ?Element {
        if (!this.domNodesEvent) {
            return;
        }
        weekStartTime =
            weekStartTime || startOfWeek(this.getDateRange().start).getTime();
        return this.domNodesEvent[weekStartTime];
    }

    setDomEvent(eventForWeek?: { el: Element, weekStartTime: number }) {
        if (!eventForWeek) {
            this.domNodesEvent = {};
            return;
        }
        const { el, weekStartTime } = eventForWeek;
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
        const { start, end } = JSON.parse(this.get("dateRange"));
        return {
            start: new Date(start),
            end: new Date(end),
        };
    }

    setDateRange(start: Date, end: Date) {
        if (!(isDate(start) && isDate(end))) {
            console.error("start", start, "end", end);
            throw new Error("start and end must both be Date types");
        }
        const startTime = start.getTime();
        const endTime = end.getTime();
        this.set(
            "dateRange",
            JSON.stringify({
                start: startTime,
                end: endTime,
            }),
        );
        //quip.elements.sendMessage("moved an event");
        quip.elements.recordQuipMetric("move_event", {
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

quip.elements.registerClass(RootRecord, "Root");
quip.elements.registerClass(EventRecord, "project-calendar-event");
