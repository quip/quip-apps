// Copyright 2017 Quip

import SVG from "./svg.jsx";

export default class Icon extends React.Component {
    render() {
        return <SVG
            viewBox="0 0 18 18"
            style={{
                fillRule: "evenodd",
            }}>
            <path
                className="cls-1"
                d="M9,17a8,8,0,1,1,8-8A8,8,0,0,1,9,17Zm2.957-9H8.677a0.107,0.107,0,0,1-.092-0.143l1.37-4.566a0.2,0.2,0,0,0-.344-0.2l-4,5.937A0.614,0.614,0,0,0,6.043,10h3.28a0.107,0.107,0,0,1,.092.143l-1.37,4.566a0.2,0.2,0,0,0,.344.2l4-5.937A0.614,0.614,0,0,0,11.957,8Z"/>
        </SVG>;
    }
}
