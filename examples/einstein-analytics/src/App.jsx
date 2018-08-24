import React from "react";
import PropTypes from "prop-types";

import {getAuth} from "./root.jsx";
import lightningUrl from "./lightningUrl";
import loadScript from "./loadScript";
import {login, updateToolbar} from "./menus";

import Dashboard from "./Dashboard.jsx";
import DashboardPicker from "./DashboardPicker.jsx";

import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import Styles from "./App.less";
export default class App extends React.Component {
    static propTypes = {
        dashboardId: PropTypes.string,
        dashboardHeight: PropTypes.number,
    };
    constructor(props) {
        super();
        const isLoggedIn = getAuth().isLoggedIn();
        this.state = {
            dashboards: [],
            isLoggedIn,
            isLightningLoaded: false,
        };
        if (isLoggedIn) {
            this.loadLightning();
        }
    }

    componentDidMount() {
        quip.apps.addEventListener(
            quip.apps.EventType.USER_PREFERENCE_UPDATE,
            () => {
                const isLoggedIn = getAuth().isLoggedIn();
                const becameLoggedIn = !this.state.isLoggedIn && isLoggedIn;
                if (becameLoggedIn) {
                    this.loadLightning();
                }
                this.setState({isLoggedIn});
            });
    }

    componentWillUnmount() {}

    setDashboards = dashboards => {
        this.setState({dashboards});
    };

    setDashboardId = dashboardId => {
        quip.apps.getRootRecord().set("dashboardId", dashboardId);
        updateToolbar();
    };

    loadLightning() {
        const tokenResponse = getAuth().getTokenResponse();
        const src = `${lightningUrl(
            tokenResponse.instance_url)}/lightning/lightning.out.js`;
        loadScript(src, () => {
            console.debug("window.$Lightning loaded?", window.$Lightning);
            this.setState({isLightningLoaded: true});
        });
    }

    render() {
        const {dashboardHeight, dashboardId} = this.props;
        const {dashboards, isLightningLoaded, isLoggedIn} = this.state;
        return <div className={Styles.App}>
            {!isLoggedIn && <div className={Styles.loginContainer}>
                <button onClick={login}>Connect to Salesforce</button>
            </div>}
            {isLoggedIn &&
                !dashboardId && <DashboardPicker
                    dashboards={dashboards}
                    setDashboardId={this.setDashboardId}
                    setDashboards={this.setDashboards}/>}
            {isLoggedIn &&
                isLightningLoaded &&
                dashboardId && <Dashboard
                    dashboardId={dashboardId}
                    height={dashboardHeight}/>}
        </div>;
    }
}
