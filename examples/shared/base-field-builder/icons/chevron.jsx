// Copyright 2017 Quip

import React from "react";
import SVG from "../../../shared/base-field-builder/icons/svg.jsx";

export default class Icon extends React.Component {
    render() {
        return <SVG viewBox="0 0 18 18">
            <path d="M9,16a7,7,0,1,1,7-7A7,7,0,0,1,9,16ZM9,3.5A5.5,5.5,0,1,0,14.5,9,5.5,5.5,0,0,0,9,3.5Zm0.53,7.155a0.75,0.75,0,0,1-1.061,0L6.22,8.405A0.75,0.75,0,0,1,7.28,7.345L9,9.065l1.72-1.72A0.75,0.75,0,0,1,11.78,8.405Z"/>
        </SVG>;
    }
}
