/* @flow */
// Copyright 2017 Quip
import React from "react";

type Props = {
    className?: string,
};

class LeftChevron extends React.Component<Props, null> {
    render() {
        return <svg
            className={this.props.className}
            width="18"
            height="18"
            viewBox="0 0 18 18">
            <path d="M13,15.5L11.5,17l-8-8,8-8L13,2.5,6.533,9Z"/>
        </svg>;
    }
}

export default LeftChevron;
