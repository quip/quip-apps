/* @flow */
// Copyright 2017 Quip
import React from "react";

type Props = {
    className?: string,
};

class RightChevron extends React.Component<Props, null> {
    render() {
        return (
            <svg
                className={this.props.className}
                width="18"
                height="18"
                viewBox="0 0 18 18"
            >
                <path d="M5,15.5L6.5,17l8-8-8-8L5,2.5,11.467,9Z" />
            </svg>
        );
    }
}

export default RightChevron;
