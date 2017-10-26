/* @flow */
// Copyright 2017 Quip

// $FlowIssueQuipModule
import quip from "quip";
import React from "react";
import { connect } from "react-redux";

// $FlowIssueQuipModule
import Chevron from "quip-apps-chevron";

import Styles from "./EventDropdown.less";
import { setMenuOpenRecord } from "../actions";
import { EventRecord } from "../model";

import { showEventContextMenu } from "../menus";

type Props = {
    color: string,
    eventRecord: EventRecord,
    isMenuOpen: boolean,
    setMenuOpenRecord: Function,
    style?: Object,
};

class EventDropdown extends React.Component<Props, null> {
    handleMouseDown = e => {
        const { eventRecord, isMenuOpen, setMenuOpenRecord } = this.props;
        if (isMenuOpen) {
            return;
        }
        this.props.setMenuOpenRecord(eventRecord);
        showEventContextMenu(e.currentTarget, eventRecord, () => {
            setMenuOpenRecord(null);
        });
        e.preventDefault();
        e.stopPropagation();
    };

    render() {
        const { color, style } = this.props;
        return (
            <div
                className={Styles.container}
                onMouseDown={this.handleMouseDown}
            >
                <Chevron
                    color={quip.elements.ui.ColorMap[color].VALUE}
                    style={style}
                />
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        isMenuOpen:
            state.menuOpenRecord &&
            state.menuOpenRecord.id() === ownProps.eventRecord.id(),
    };
};

export default connect(mapStateToProps, {
    setMenuOpenRecord,
})(EventDropdown);
