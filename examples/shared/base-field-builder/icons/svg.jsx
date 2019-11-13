// Copyright 2017 Quip

import React from "react";

export default class SVG extends React.Component {
    static propTypes = {
        viewBox: React.PropTypes.string.isRequired,
        fill: React.PropTypes.string,
    };

    render() {
        var style = {display: "block"};
        if (this.props.fill) {
            style.fill = this.props.fill;
        }
        return <svg
            viewBox={this.props.viewBox}
            preserveAspectRatio="xMidYMid"
            style={style}>
            {this.props.children}
        </svg>;
    }
}
