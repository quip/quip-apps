// Copyright 2017 Quip

import SVG from "./svg.jsx";

export default class Icon extends React.Component {
    render() {
        return <SVG viewBox="0 0 18 18">
            <path
                d="M12.2,7.3c0.4-0.4,0.4-1.1,0-1.5c-0.4-0.4-1.1-0.4-1.5,0c0,0,0,0,0,0L9,7.5L7.3,5.8C6.8,5.4,6.2,5.5,5.8,5.9
        c-0.3,0.4-0.3,1,0,1.4L7.5,9l-1.7,1.7c-0.4,0.4-0.4,1.1,0,1.5c0.4,0.4,1,0.4,1.4,0L9,10.5l1.7,1.7c0.4,0.4,1.1,0.3,1.5-0.1
        c0.3-0.4,0.3-1,0-1.4L10.5,9L12.2,7.3z"/>
        </SVG>;
    }
}
