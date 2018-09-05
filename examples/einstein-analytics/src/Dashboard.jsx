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
        const accessToken = tokenResponse.access_token;
        const baseUrl = lightningUrl(tokenResponse.instance_url);
        window.$Lightning.use(
            "c:loApp",
            () => {
                // Adding this check here to give extra time, in cases $A
                // is not yet available.
                this.loadLightningTimeout_ = window.setTimeout(
                    this.onLoadAuraTimeout,
                    10000);
                this.auraInterval = window.setInterval(this.waitForAura, 10);
            },
            baseUrl,
            accessToken);
    }

    waitForAura = () => {
        console.debug("waitForAura window.$A", window.$A);
        if (window.$A) {
            window.clearInterval(this.auraInterval);
            this.auraInterval = null;
            this.onAuraLoaded();
        }
    };

    onLoadAuraTimeout = () => {
        window.clearInterval(this.auraInterval);
        throw Error("Unable to load Aura :(");
    };

    onAuraLoaded() {
        const {dashboardId, height} = this.props;
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
                console.debug("onAuraLoaded", {iframe});
                if (!iframe) {
                    console.error("No iframe to register :(");
                } else {
                    quip.apps.registerEmbeddedIframe(iframe);
                }
            });
    }

    render() {
        const {height} = this.props;
        return <div>
            <div ref={el => (this.el = el)} style={{minHeight: height}}/>
        </div>;
    }
}
