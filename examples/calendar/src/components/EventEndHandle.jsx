/* @flow */
// Copyright 2017 Quip

import React from "react";
import {connect} from "react-redux";

import Styles from "./EventEndHandle.less";
import ResizeIcon from "./ResizeIcon.jsx";
import {setResizingEvent} from "../actions";
import {EventRecord} from "../model";

type Props = {
    eventRecord: EventRecord,
    fill: string,
    setResizingEvent: Function,
};

class EventEndHandle extends React.Component<Props, null> {
    onMouseDown = e => {
        if (e.button === 2) {
            return;
        }
        this.props.setResizingEvent(this.props.eventRecord);
        e.stopPropagation();
    };

    render() {
        const {fill} = this.props;
        return <div className={Styles.container} onMouseDown={this.onMouseDown}>
            <div className={Styles.iconContainer}>
                <ResizeIcon fill={fill}/>
            </div>
        </div>;
    }
}

export default connect(
    null,
    {setResizingEvent})(EventEndHandle);
