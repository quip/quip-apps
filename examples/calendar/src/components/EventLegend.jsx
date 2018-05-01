/* @flow */
// Copyright 2017 Quip

// $FlowIssueQuipModule
import quip from "quip";
import React from "react";
import {connect} from "react-redux";
import isAfter from "date-fns/is_after";
import isBefore from "date-fns/is_before";
import isSameMonth from "date-fns/is_same_month";
import isSameYear from "date-fns/is_same_year";
import isWithinRange from "date-fns/is_within_range";
import classNames from "classnames";

import Styles from "./EventLegend.less";
import EventDropdown from "./EventDropdown.jsx";
import EventRichTextBox from "./EventRichTextBox.jsx";
import {EventRecord} from "../model";
import {isSameDay, formatDate} from "../util";

const formatDateRange = (start, end) => {
    const startText = formatDate(start, "MMMM D");

    const sameYear = isSameYear(start, end);
    const sameMonth = isSameMonth(start, end);

    if (isSameDay(start, end)) {
        return startText;
    }

    if (sameYear && sameMonth) {
        return `${startText}-${formatDate(end, "D")}`;
    }

    if (isSameYear(start, end)) {
        return `${startText}-${formatDate(end, "MMMM D")}`;
    }

    return `${startText}-${formatDate(end, "MMMM D YY")}`;
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
            isWithinRange(date, start, end),
        );
        */
        return (
            sameMonth(start) ||
            sameMonth(end) ||
            isWithinRange(date, start, end)
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
    events: Array<EventRecord>,
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
                    style={{borderColor: colorValue}}>
                    <div className={Styles.row}>
                        <div className={Styles.colPrimary}>
                            <div style={{color: colorValue}}>
                                {formatDateRange(start, end)}
                            </div>
                            <div
                                className={Styles.richTextBox}
                                style={{
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
