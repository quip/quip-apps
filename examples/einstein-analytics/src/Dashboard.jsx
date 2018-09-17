import React from "react";
import PropTypes from "prop-types";

import {getAuth} from "./root.jsx";
import lightningUrl from "./lightningUrl";
import "Dashboard.css";

const CACHE_DASHBOARD_ID = "0FKB0000000DbxzOAC";
import cacheImgSrc from "./assets/dashboard_0FKB0000000DbxzOAC.png";

export default class Dashboard extends React.Component {
    static propTypes = {
        dashboardId: PropTypes.string,
        height: PropTypes.number,
    };

    constructor(props) {
        super();
        this.state = {
            isLoading: props.dashboardId === CACHE_DASHBOARD_ID,
        };
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
        console.debug("buildDashboard", baseUrl, accessToken);
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
        const tokenResponse = getAuth().getTokenResponse();
        const accessToken = tokenResponse.access_token;
        console.debug("$Lightning.createComponent", {dashboardId, height});
        //https://adx-dev-ed.lightning.force.com/auradocs/reference.app#reference?descriptor=wave:waveDashboard&
        window.$Lightning.createComponent(
            "wave:waveDashboard",
            {
                dashboardId,
                accessToken,
                showHeader: false,
                showTitle: false,
                height: height,
            },
            this.el,
            (cmp, status, errorMessage) => {
                // status is SUCCESS, INCOMPLETE, or ERROR
                console.debug("callback", {cmp, status, errorMessage});
                if (status !== "SUCCESS") {
                    // TODO: consider logout() here?
                    return;
                }

                // https://developer.salesforce.com/docs/component-library/overview/events
                cmp.addEventHandler("aura:doneRendering", e => {
                    /*
                    quip.apps.clearEmbeddedIframe();
                    const iframe = cmp.getElement().querySelector("iframe");
                    quip.apps.registerEmbeddedIframe(iframe);
                    */

                    if (this.props.dashboardId === CACHE_DASHBOARD_ID) {
                        const waveSpinner = cmp
                            .getElement()
                            .querySelector(".embeddedSpinner");
                        const isLoading =
                            !!waveSpinner && !!waveSpinner.offsetHeight;
                        console.debug("aura:doneRendering!", {isLoading});
                        this.setState({isLoading});
                    }
                });
            });
    }

    onLoadCacheImg = e => {
        console.debug("onLoadCacheImg", e);
    };

    onErrorCacheImg = err => {
        console.debug("onErrorCacheImg", err);
    };

    render() {
        const {dashboardId, height} = this.props;
        const {isLoading} = this.state;
        console.debug("render isLoading", isLoading);
        /*
        let cacheImgSrc;
        try {
            cacheImgSrc = pathToCacheImgs(`dashboard_${dashboardId}.png`, true);
        } catch (err) {
            console.debug("error loading img", {err});
        }
        */
        return <div className="Dashboard" style={{minHeight: height}}>
            {isLoading ? (
                <div className="cacheImg" style={{minHeight: height}}>
                    <img src={cacheImgSrc} alt={quiptext("Loading...")}/>
                </div>
            ) : null}
            <div
                ref={el => (this.el = el)}
                className="wave"
                style={{minHeight: height}}/>
        </div>;
    }
}
