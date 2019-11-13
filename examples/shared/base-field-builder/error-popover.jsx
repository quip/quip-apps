// Copyright 2017 Quip

import React from "react";
import ReactDOM from "react-dom";
import RecordEntity from "./model/record.js";
import Styles from "./error-popover.less";

export default class ErrorPopover extends React.Component {
    static propTypes = {
        errorMessage: React.PropTypes.string.isRequired,
        containerClassName: React.PropTypes.string,
    };

    componentDidMount() {
        if (this.shouldShowPopover_()) {
            quip.apps.addDetachedNode(ReactDOM.findDOMNode(this));
        }
    }

    componentWillUnmount() {
        if (this.shouldShowPopover_()) {
            quip.apps.removeDetachedNode(ReactDOM.findDOMNode(this));
        }
    }

    shouldShowPopover_ = () => {
        return this.props.errorMessage.length > 0;
    };

    onClick_ = e => {
        e.stopPropagation();
    };

    render() {
        if (!this.shouldShowPopover_()) {
            return null;
        }

        let className = Styles.popover;
        if (this.props.containerClassName) {
            className = this.props.containerClassName;
        }
        return <div className={className} onClick={this.onClick_}>
            {this.props.errorMessage}
        </div>;
    }
}
