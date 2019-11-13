// Copyright 2017 Quip

import React from "react";
import SVG from "../../../shared/base-field-builder/icons/svg.jsx";

export default class Checkbox extends React.Component {
    render() {
        return <SVG viewBox="0 0 18 18">
            <path d="M13,3.5A1.5,1.5,0,0,1,14.5,5v8A1.5,1.5,0,0,1,13,14.5H5A1.5,1.5,0,0,1,3.5,13V5A1.5,1.5,0,0,1,5,3.5h8M13,2H5A3,3,0,0,0,2,5v8a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V5a3,3,0,0,0-3-3Z"/>
            <path
                className="check"
                d="M12.6,6.59l-3.79,6a.86.86,0,0,1-.67.39H8.08a.87.87,0,0,1-.66-.3l-2.2-2.59,0,0a.84.84,0,0,1,.12-1.18A.87.87,0,0,1,6.54,9L8,10.72l3.15-5a.87.87,0,0,1,1.19-.26h0A.84.84,0,0,1,12.6,6.59Z"/>
        </SVG>;
    }
}
