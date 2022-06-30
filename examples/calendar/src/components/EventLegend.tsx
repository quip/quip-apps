// Copyright 2017 Quip

import quip from "quip-apps-api";
import React from "react";
import {connect} from "react-redux";
import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import isSameMonth from "date-fns/isSameMonth";
import isSameYear from "date-fns/isSameYear";
import isWithinInterval from "date-fns/isWithinInterval";
import classNames from "classnames";
import Styles from "./EventLegend.less";
import EventDropdown from "./EventDropdown";
import EventRichTextBox from "./EventRichTextBox";
import {EventRecord} from "../model";
import {isSameDay, formatDate} from "../util";

const formatDateRange = (start, end) => {
    const startText = formatDate(start, "MMMM do");
    const sameYear = isSameYear(start, end);
    const sameMonth = isSameMonth(start, end);

    if (isSameDay(start, end)) {
        return startText;
    }

    if (sameYear && sameMonth) {
        return `${startText}-${formatDate(end, "do")}`;
    }

    if (isSameYear(start, end)) {
        return `${startText}-${formatDate(end, "MMMM do")}`;
    }

    return `${startText}-${formatDate(end, "MMMM do yy")}`;
};

const eventsForMonth = (events, date) => {
    const sameMonth = d => isSameMonth(date, d) && isSameYear(date, d);

    const matchingEvents = events.filter(event => {
        const {start, end} = event.getDateRange();
        /*
    console.log(
        "eventsForMonth",
        event.id(),
        start,
        end,
        sameMonth(start),
        sameMonth(end),
        isWithinInterval(date, {start: start, end: end}),
    );
    */

        return (
            sameMonth(start) ||
            sameMonth(end) ||
            isWithinInterval(date, {
                start: start,
                end: end,
            })
        );
    });
    return matchingEvents.sort((a, b) => {
        const aRange = a.getDateRange();
        const bRange = b.getDateRange();

        if (isBefore(aRange.start, bRange.start)) {
            return -1;
        } else if (isAfter(aRange.start, bRange.start)) {
            return 1;
        }

        return 0;
    });
};

type Props = {
    events: Array<EventRecord>;
};

class EventLegend extends React.Component<Props, null> {
    render() {
        const {events} = this.props;
        return <ul className={Styles.container}>
            {events.map(event => {
                const {start, end} = event.getDateRange();
                const color = event.getColor();
                const colorValue = quip.apps.ui.ColorMap[color].VALUE;
                const hasComments = event.getCommentCount() > 0;
                return <li
                    ref={el => {
                        // Tells the quip comment UI to focus on this element.
                        event.setDom(el);
                    }}
                    className={classNames(Styles.event)}
                    key={event.id()}
                    style={{
                        borderColor: colorValue,
                    }}>
                    <div className={Styles.row}>
                        <div className={Styles.colPrimary}>
                            <div
                                style={{
                                    color: colorValue,
                                }}>
                                {formatDateRange(start, end)}
                            </div>
                            <div
                                className={Styles.richTextBox}
                                style={{
                                    // @ts-ignore
                                    // TODO(GASPAR): not sure that
                                    // this works in react
                                    fontWeight: "bold !important",
                                }}>
                                <EventRichTextBox
                                    color={event.getColor()}
                                    eventRecord={event}/>
                            </div>
                        </div>
                        {hasComments && <div className={Styles.colComments}>
                            <quip.apps.ui.CommentsTrigger
                                record={event}
                                showEmpty/>
                        </div>}
                        <div className={Styles.colDropdown}>
                            <EventDropdown
                                color={event.getColor()}
                                eventRecord={event}/>
                        </div>
                    </div>
                </li>;
            })}
        </ul>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    events: eventsForMonth(state.events, state.displayMonth),
});

export default connect(mapStateToProps)(EventLegend);
