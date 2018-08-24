import React from "react";
import PropTypes from "prop-types";

import {getAuth} from "./root.jsx";
import lightningUrl from "./lightningUrl";

const DEFAULT_HEIGHT = 400;

export default class Dashboard extends React.Component {
    static propTypes = {
        dashboardId: PropTypes.string,
        height: PropTypes.number,
    };
    constructor(props) {
        super();
        console.debug("Dashboard constructor");
    }
    componentDidMount() {
        this.buildDashboard();
    }
    buildDashboard() {
        if (!window.$Lightning) {
            console.error("window.$Lightning is not undefined");
            return;
        }
        const tokenResponse = getAuth().getTokenResponse();
        const {dashboardId, height} = this.props;
        const accessToken = tokenResponse.access_token;
        const baseUrl = lightningUrl(tokenResponse.instance_url);
        window.$Lightning.use(
            "c:loApp",
            e => {
                window.$Lightning.createComponent(
                    "wave:waveDashboard",
                    {
                        dashboardId,
                        height: height || DEFAULT_HEIGHT,
                    },
                    this.el);
            },
            baseUrl,
            accessToken);
    }
    render() {
        return <div ref={el => (this.el = el)}/>;
    }
}
