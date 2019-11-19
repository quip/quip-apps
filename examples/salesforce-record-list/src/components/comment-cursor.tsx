// Copyright 2019 Quip

import React from "react";
import PropTypes, {InferProps} from "prop-types";
import Styles from "./comment-cursor.less";

interface CommentCursorProps
    extends InferProps<typeof CommentCursor.propTypes> {
    rootRef: Element;
}

interface CommentCursorState {
    x: number;
    y: number;
    initialized: boolean;
}

export default class CommentCursor extends React.Component<
    CommentCursorProps,
    CommentCursorState
> {
    static propTypes = {
        // instance of createRef
        rootRef: PropTypes.node.isRequired,
    };

    private needsUpdate_: boolean;

    constructor(props: CommentCursorProps) {
        super(props);
        this.state = {x: -1, y: -1, initialized: false};
    }

    componentDidMount() {
        this.setState({initialized: false});
        document.addEventListener("mousemove", this.mouseMoved_);
    }

    componentWillUnmount() {
        document.removeEventListener("mousemove", this.mouseMoved_);
    }

    mouseMoved_ = (e: MouseEvent) => {
        this.needsUpdate_ = true;
        requestAnimationFrame(() => {
            if (!this.needsUpdate_) {
                return;
            }
            const {rootRef} = this.props;
            this.needsUpdate_ = false;
            const {
                left: parentX,
                top: parentY,
            } = rootRef.getBoundingClientRect();
            this.setState({
                x: e.clientX - parentX,
                y: e.clientY - parentY,
                initialized: true,
            });
        });
    };

    render() {
        const {x, y, initialized} = this.state;
        return initialized ? (
            <div className={Styles.commentCursor} style={{left: x, top: y}}/>
        ) : null;
    }
}
