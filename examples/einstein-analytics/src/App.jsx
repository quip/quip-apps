import React from "react";
import PropTypes from "prop-types";
import sortBy from "lodash/sortby";

import UtilitySprite from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";
import {IconSettings} from "@salesforce/design-system-react";

import {getAuth} from "./root.jsx";
import lightningUrl from "./lightningUrl";
import loadScript from "./loadScript";
import {login, logout, setAppContext, updateToolbar} from "./menus";

import Dashboard from "./Dashboard.jsx";
import DashboardHeightModal from "./DashboardHeightModal.jsx";
import DashboardPicker from "./DashboardPicker.jsx";

import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";

import logoSrc from "./assets/analytics-studio.png";

import Styles from "./App.less";

const DEFAULT_DASHBOARD_HEIGHT = 500;
const DASHBOARDS_PAGE_SIZE = 50;

export default class App extends React.Component {
    static propTypes = {
        dashboardId: PropTypes.string,
        dashboardHeight: PropTypes.number,
    };
    constructor(props) {
        super();
        setAppContext(this);
        const isLoggedIn = getAuth().isLoggedIn();
        this.state = {
            dashboards: [],
            dashboardHeightModalOpen: false,
            isLoggedIn,
            isLoginValid: isLoggedIn,
            isLightningLoaded: false,
        };
        if (isLoggedIn) {
            this.loadDashboards();
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
                    this.loadDashboards();
                    this.loadLightning();
                }
                this.setState({isLoggedIn, isLoginValid: true});
            });
    }

    componentWillUnmount() {
        if (this.loadLightningTimeout_) {
            window.clearTimeout(this.loadLightningTimeout_);
        }
        if (this.loadLightningInterval) {
            window.clearInterval(this.loadLightningInterval);
        }
    }

    setDashboardHeight = dashboardHeight => {
        quip.apps.getRootRecord().set("dashboardHeight", dashboardHeight);
    };

    setDashboardId = dashboardId => {
        quip.apps.getRootRecord().set("dashboardId", dashboardId);
        updateToolbar();
    };

    toggleDashboardHeightModalOpen = () => {
        this.setState({
            dashboardHeightModalOpen: !this.state.dashboardHeightModalOpen,
        });
    };

    loadLightning = () => {
        const tokenResponse = getAuth().getTokenResponse();
        const src = `${lightningUrl(
            tokenResponse.instance_url)}/lightning/lightning.out.js`;

        this.loadLightningTimeout_ = window.setTimeout(
            this.onLoadLightningTimeout,
            10000);
        loadScript(src, () => {
            this.loadLightningInterval = window.setInterval(() => {
                const isLightningLoaded = !!window.$Lightning;
                console.debug(
                    "isLightningLoaded",
                    isLightningLoaded,
                    "window.$Lightning",
                    window.$Lightning);
                if (isLightningLoaded) {
                    this.setState({isLightningLoaded});
                    window.clearTimeout(this.loadLightningTimeout_);
                    this.loadLightningTimeout_ = null;
                    window.clearInterval(this.loadLightningInterval);
                    this.loadLightningInterval = null;
                }
            }, 10);
        });
    };

    onLoadLightningTimeout = () => {
        window.clearInterval(this.loadLightningInterval);
        this.loadLightningInterval = null;
        throw Error("Unable to load window.$Lightning");
    };

    loadDashboards(retry = true) {
        const tokenResponse = getAuth().getTokenResponse();
        // https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_rest.meta/bi_dev_guide_rest/bi_resources_dashboards.htm
        const url = `${
            tokenResponse.instance_url
        }/services/data/v43.0/wave/dashboards?pageSize=${DASHBOARDS_PAGE_SIZE}`;
        getAuth()
            .request({url})
            .then(response => {
                console.debug({response});
                if (!response.ok && response.status === 401) {
                    this.setState({isLoginValid: false});
                    if (retry) {
                        console.debug("RETRY AUTH refreshToken()");
                        getAuth()
                            .refreshToken()
                            .then(resp => {
                                console.debug("refreshToken() worked!", {resp});
                                this.loadDashboards(false);
                            })
                            .catch(err => {
                                console.debug({err});
                                logout();
                            });
                    } else {
                        logout();
                    }
                    return;
                }
                const json = response.json();
                console.debug({json});
                const dashboards = sortBy(json.dashboards, [
                    "folder.label",
                    "label",
                ]);
                this.setState({dashboards, isLoginValid: true});
            })
            .catch(err => {
                console.debug("fetch dashboards error", {err});
            });
    }

    render() {
        const {dashboardHeight, dashboardId} = this.props;
        const {
            dashboards,
            dashboardHeightModalOpen,
            isLightningLoaded,
            isLoggedIn,
            isLoginValid,
        } = this.state;
        const height = dashboardHeight || DEFAULT_DASHBOARD_HEIGHT;
        return <IconSettings
            actionSprite={"foioi"}
            onRequestIconPath={({category, name}) => {
                console.debug("onRequestIconPath", {category, name});
                return `#${name}`;
            }}>
            <div className={Styles.App} style={{minHeight: dashboardHeight}}>
                <UtilitySprite/>
                {!isLoggedIn && <div className={Styles.loginContainer}>
                    <img src={logoSrc} className={Styles.loginLogoBackground}/>
                    <button className={Styles.loginButton} onClick={login}>
                        Connect to Salesforce
                    </button>
                </div>}
                {isLoggedIn &&
                    !dashboardId && <DashboardPicker
                        dashboards={dashboards}
                        setDashboardId={this.setDashboardId}/>}
                {dashboardHeightModalOpen && <DashboardHeightModal
                    height={height}
                    setHeight={this.setDashboardHeight}
                    isOpen={dashboardHeightModalOpen}
                    toggleOpen={this.toggleDashboardHeightModalOpen}/>}
                {isLoggedIn &&
                    isLoginValid &&
                    isLightningLoaded &&
                    dashboardId && <Dashboard
                        key={`${dashboardId}-${height}`}
                        dashboardId={dashboardId}
                        height={height}/>}
            </div>
        </IconSettings>;
    }
}
