// Copyright 2017 Quip

import React from "react";
import SVG from "./svg.jsx";

export default class Icon extends React.Component {
    render() {
        return <SVG viewBox="0 0 2 10">
            <g id="grabber">
                <circle id="Oval" cx="1" cy="1" r="1"/>
                <circle id="Oval" cx="1" cy="5" r="1"/>
                <circle id="Oval" cx="1" cy="9" r="1"/>
            </g>
        </SVG>;
    }
}
