// Copyright 2017 Quip

import React from "react";
import Styles from "./dialog.less";

export default class Dialog extends React.Component {
    static propTypes = {
        children: React.PropTypes.element.isRequired,
        onDismiss: React.PropTypes.func,
        showBackdrop: React.PropTypes.bool,
        left: React.PropTypes.number,
        top: React.PropTypes.number,
    };

    static defaultProps = {
        showBackdrop: true,
    };

    constructor(props) {
        super(props);
        this.state = {
            focused: false,
        };
        this.showing_ = false;
    }

    onFocus = () => {
        this.setState({focused: true});
    };

    onBlur = () => {
        this.setState({focused: false});
    };

    toggle() {
        this.showing_ = !this.showing_;
        if (this.showing_) {
            quip.apps.showBackdrop(this.props.onDismiss);
            quip.apps.addDetachedNode(ReactDOM.findDOMNode(this.dialogNode_));
        } else {
            quip.apps.dismissBackdrop();
            quip.apps.removeDetachedNode(
                ReactDOM.findDOMNode(this.dialogNode_));
        }
    }

    shouldShow(props, state) {
        return props.showBackdrop && state.focused;
    }

    componentDidUpdate(prevProps, prevState) {
        const wasShowing = this.shouldShow(prevProps, prevState);
        const shouldShow = this.shouldShow(this.props, this.state);
        if (wasShowing === shouldShow) {
            return;
        }

        this.toggle();
    }

    componentDidMount() {
        if (quip.apps.isElementFocused()) {
            this.onFocus();
        }
        quip.apps.addEventListener(quip.apps.EventType.FOCUS, this.onFocus);
        quip.apps.addEventListener(quip.apps.EventType.BLUR, this.onBlur);
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(quip.apps.EventType.FOCUS, this.onFocus);
        quip.apps.removeEventListener(quip.apps.EventType.BLUR, this.onBlur);
        if (this.showing_) {
            this.toggle();
        }
    }

    clickCover() {
        const style = {
            position: "absolute",
            top: "0",
            left: "0",
            height: "100%",
            width: "100%",
            zIndex: "100",
            opacity: "0",
        };
        return <div
            style={style}
            onClick={e => {
                e.preventDefault();
            }}/>;
    }

    render() {
        const {focused} = this.state;
        if (!focused) {
            return this.clickCover();
        }

        let {left, top} = this.props;
        if (!left && !top) {
            // If no position is provided, the dialog will be centered.
            const viewportDimensions = quip.apps.getViewportDimensions();
            const boundingRect = quip.apps.getBoundingClientRect();
            left = viewportDimensions.width / 2 - boundingRect.left;
            top = viewportDimensions.height / 2 - boundingRect.top;
        }
        return <div
            className={Styles.dialog}
            style={{left, top}}
            ref={node => (this.dialogNode_ = node)}>
            {this.props.children}
        </div>;
    }
}
