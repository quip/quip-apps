/* @flow */
// Copyright 2017 Quip

// $FlowIssueQuipModule
import quip from "quip";
import React from "react";
import {connect} from "react-redux";

import {setFocusedEvent, setSelectedEvent} from "../actions";
import {EventRecord} from "../model";

const {RichTextBox} = quip.apps.ui;

type Props = {
    eventRecord: EventRecord,
    focused: boolean,
    color: string,
    setFocusedEvent: Function,
    setSelectedEvent: Function,
    titleRecord: quip.apps.RichTextRecord,
    week: ?Array<Date>,
};

class EventRichTextBox extends React.Component<Props, null> {
    blurTimeout: ?number;
    focusTimeout: ?number;

    componentDidMount() {
        if (this.props.focused) {
            this.focusTimeout = window.setTimeout(() => {
                this.props.titleRecord.focus();
            }, 0);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.focused && !prevProps.focused) {
            this.props.titleRecord.focus();
        }
    }

    componentWillUnmount() {
        if (this.focusTimeout) {
            window.clearTimeout(this.focusTimeout);
            this.focusTimeout = null;
        }
        if (this.blurTimeout) {
            window.clearTimeout(this.blurTimeout);
            this.blurTimeout = null;
        }
        if (this.props.focused) {
            this.props.setFocusedEvent(null);
        }
    }

    onMouseDown = e => {
        const {eventRecord, setFocusedEvent, week} = this.props;
        setFocusedEvent(eventRecord, week && week[0].getTime());
    };

    onBlur = e => {
        // delay is to allow the focusedEvent to remain in
        // state so that a quick click onto a calendar day
        // will be able to detect that we we were focused.
        if (this.blurTimeout) {
            window.clearTimeout(this.blurTimeout);
            this.blurTimeout = null;
        }
        this.blurTimeout = window.setTimeout(() => {
            if (this.props.focused) {
                this.props.setFocusedEvent(null);
            }
        }, 0);
    };

    render() {
        const {color, focused, titleRecord, week} = this.props;
        let key = `rtb-${titleRecord.id()}`;
        if (week) {
            key = `-${key}-${color}-${week[0].getTime()}`;
        }
        var extraRichTextBoxProps = {};
        if (quip.apps.isApiVersionAtLeast("0.1.039")) {
            extraRichTextBoxProps.allowedInlineStyles = [
                quip.apps.RichTextRecord.InlineStyle.ITALIC,
                quip.apps.RichTextRecord.InlineStyle.STRIKETHROUGH,
                quip.apps.RichTextRecord.InlineStyle.UNDERLINE,
                quip.apps.RichTextRecord.InlineStyle.CODE,
            ];
        }
        return <div
            onMouseDown={this.onMouseDown}
            style={{cursor: "text", wordBreak: "break-word"}}>
            <RichTextBox
                allowedStyles={[quip.apps.RichTextRecord.Style.TEXT_PLAIN]}
                color={color}
                disableSelection={!focused}
                key={key}
                onBlur={this.onBlur}
                readOnly={!focused}
                record={titleRecord}
                useDocumentTheme={false}
                width="100%"
                {...extraRichTextBoxProps}/>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    const eventRecord = ownProps.eventRecord;
    let focused = false;
    if (state.focusedEvent && state.focusedEvent.id() === eventRecord.id()) {
        // Multi-week events need to know which week is being focused
        if (ownProps.week && state.focusedEventTimestamp) {
            if (ownProps.week[0].getTime() == state.focusedEventTimestamp) {
                focused = true;
            }
        } else {
            focused = true;
        }
    }
    /*
    console.log(
        "focused",
        focused,
        state.focusedEvent,
        state.focusedEvent && state.focusedEvent.id() === eventRecord.id(),
    );
    */
    return {
        focused,
        titleRecord: eventRecord.get("title"),
    };
};
export default connect(
    mapStateToProps,
    {
        setFocusedEvent,
        setSelectedEvent,
    })(EventRichTextBox);
