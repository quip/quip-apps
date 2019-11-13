// Copyright 2017 Quip

import React from "react";
import SVG from "./svg.jsx";

export default class Icon extends React.Component {
    render() {
        return <SVG viewBox="0 0 18 18">
            <path d="M14,17H4a2,2,0,0,1-2-2V9A2,2,0,0,1,4,7H5V4a4,4,0,1,1,8,0V7h1a2,2,0,0,1,2,2v6A2,2,0,0,1,14,17ZM11,4A2,2,0,0,0,7,4V7h4V4Z"/>
        </SVG>;
    }
}
