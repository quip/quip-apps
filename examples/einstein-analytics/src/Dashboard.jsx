import React from "react";
import PropTypes from "prop-types";

import {getAuth} from "./root.jsx";
import lightningUrl from "./lightningUrl";
import "Dashboard.css";
import Styles from "Dashboard.less";

export default class Dashboard extends React.Component {
    static propTypes = {
        dashboardId: PropTypes.string,
        savedViewId: PropTypes.string,
        dashboardImage: PropTypes.string,
        onDashboardLoaded: PropTypes.func,
    };

    constructor(props) {
        super();
        this.state = {
            isLoading: !!props.dashboardImage,
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
        this.startDate = new Date();
        const tokenResponse = getAuth().getTokenResponse();
        const accessToken = tokenResponse.access_token;
        const baseUrl = lightningUrl(tokenResponse.instance_url);
        console.debug("buildDashboard", baseUrl, accessToken);
        window.$Lightning.use(
            //"c:loApp",  // This is our custom app, hopefully we don't need it
            //"wave:waveDashboard", // doesn't seem to work in many cases
            "wave:waveApp",
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
        const {dashboardId, savedViewId} = this.props;
        const tokenResponse = getAuth().getTokenResponse();
        const accessToken = tokenResponse.access_token;
        console.debug("$Lightning.createComponent", {dashboardId});
        //https://adx-dev-ed.lightning.force.com/auradocs/reference.app#reference?descriptor=wave:waveDashboard&

        window.$Lightning.createComponent(
            "wave:waveDashboard",
            {
                dashboardId,
                savedViewId,
                accessToken,
                showHeader: false,
                showTitle: false,
            },
            this.el,
            (cmp, status, errorMessage) => {
                // status is SUCCESS, INCOMPLETE, or ERROR
                console.debug("window.$Lightning.createComponent callback", {
                    cmp,
                    status,
                    errorMessage,
                });
                if (status !== "SUCCESS") {
                    return;
                }

                // https://developer.salesforce.com/docs/component-library/overview/events
                cmp.addEventHandler("aura:doneRendering", e => {
                    // We need to registerEmbeddedIframe in order to keep the
                    // Live App menu focus interaction working
                    quip.apps.clearEmbeddedIframe();
                    const element = cmp.getElement();
                    if (!element) {
                        return;
                    }

                    const iframe = element.querySelector("iframe");
                    quip.apps.registerEmbeddedIframe(iframe);

                    const waveSpinner = element.querySelector(
                        ".embeddedSpinner");
                    const isLoading =
                        !!waveSpinner && !!waveSpinner.offsetHeight;
                    if (!isLoading && this.state.isLoading) {
                        this.props.onDashboardLoaded();
                        const doneDate = new Date();
                        const timeSecs = Math.abs(
                            (this.startDate.getTime() - doneDate.getTime()) /
                                1000);
                        console.debug("Render done in", timeSecs, "seconds");
                    }
                    this.setState({isLoading});
                });
            });
    }

    render() {
        const className = `${Styles.Dashboard} Dashboard`;
        const {dashboardImage} = this.props;
        const {isLoading} = this.state;
        const isHidden = isLoading && dashboardImage;
        return <div
            className={className}
            style={{visibility: isHidden ? "hidden" : null}}>
            <div ref={el => (this.el = el)} className={Styles.wave}/>
        </div>;
    }
}
