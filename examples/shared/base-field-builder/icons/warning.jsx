// Copyright 2017 Quip

import SVG from "./svg.jsx";

export default class Icon extends React.Component {
    render() {
        const style = {fillRule: "evenodd"};
        return <SVG viewBox="0 0 18 18" style={style}>
            <path d="M9,1c4.4,0,8,3.6,8,8s-3.6,8-8,8s-8-3.6-8-8S4.6,1,9,1z M9,3C5.7,3,3,5.7,3,9s2.7,6,6,6s6-2.7,6-6S12.3,3,9,3z M10,12c0,0.6-0.4,1-1,1c-0.6,0-1-0.4-1-1V9c0-0.6,0.4-1,1-1c0.6,0,1,0.4,1,1V12z M9,5c0.6,0,1,0.4,1,1S9.6,7,9,7S8,6.6,8,6S8.4,5,9,5z"/>
        </SVG>;
    }
}
