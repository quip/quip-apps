import React from "react";
import PropTypes from "prop-types";

import {getAuth} from "./root.jsx";
import lightningUrl from "./lightningUrl";

export default class Dashboard extends React.Component {
    static propTypes = {
        dashboardId: PropTypes.string,
        height: PropTypes.number,
    };
    constructor(props) {
        super();
    }
    componentDidMount() {
        this.buildDashboard();
    }
    componentWillUnmount() {
        quip.apps.clearEmbeddedIframe();
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
                //https://adx-dev-ed.lightning.force.com/auradocs/reference.app#reference?descriptor=wave:waveDashboard&
                window.$Lightning.createComponent(
                    "wave:waveDashboard",
                    {
                        dashboardId,
                        //showHeader: false,
                        //showTitle: false,
                        height: height,
                    },
                    this.el,
                    () => {
                        const iframe = this.el.querySelector("iframe");
                        console.debug({iframe});
                        if (!iframe) {
                            console.error("No iframe to register :(");
                        } else {
                            quip.apps.registerEmbeddedIframe(iframe);
                        }
                    });
            },
            baseUrl,
            accessToken);
    }
    render() {
        return <div ref={el => (this.el = el)}/>;
    }
}
