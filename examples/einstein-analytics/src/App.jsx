import React from "react";
import PropTypes from "prop-types";

import UtilitySprite from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";
import {IconSettings} from "@salesforce/design-system-react";

import {getAuth} from "./root.jsx";
import lightningUrl from "./lightningUrl";
import loadScript from "./loadScript";
import {login, logout, setAppContext, updateToolbar} from "./menus";

import ButtonPrompt from "./ButtonPrompt.jsx";
import Dashboard from "./Dashboard.jsx";
import DashboardHeight from "./DashboardHeight.jsx";
import DashboardPicker from "./DashboardPicker.jsx";

import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";

import Styles from "./App.less";

const DEFAULT_DASHBOARD_HEIGHT = 600;
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
            filterQuery: "",
        };
        this.dashboardsCache = {};
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

    closeDashboardHeightModal = () => {
        this.setState({
            dashboardHeightModalOpen: false,
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

    handleFilterChange = filterQuery => {
        // Reset nextPageUrl so we fetch dashboards based on the new query
        this.setState({filterQuery: filterQuery, nextPageUrl: undefined});
        this.loadDashboards();
    };

    loadDashboards(retry = true) {
        const {dashboards, filterQuery = "", nextPageUrl} = this.state;

        // https://corp.quip.com/3LX4Ac0TYuKm/Einstein-Analytics-Live-App-Demo-Main-Collab-Doc#XeUACAjTSA6
        // Proactively fixing this, but should send an diagnostic report
        let sanitizedFilterQuery = filterQuery;
        if (sanitizedFilterQuery == "false") {
            // TODO: file report when encountering this error
            console.warn("filterQuery in bad format", sanitizedFilterQuery);
            sanitizedFilterQuery = "";
        }
        const tokenResponse = getAuth().getTokenResponse();
        let url;
        let existingDashboards;
        if (nextPageUrl === undefined) {
            // https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_rest.meta/bi_dev_guide_rest/bi_resources_dashboards.htm
            url = `${
                tokenResponse.instance_url
            }/services/data/v43.0/wave/dashboards?sort=Name&q=${sanitizedFilterQuery}&pageSize=${DASHBOARDS_PAGE_SIZE}`;
            existingDashboards = [];
        } else if (nextPageUrl === null) {
            // If nextPageUrl is none, it means we have fetched all the results
            // corresponding to the query.
            return;
        } else {
            url = `${tokenResponse.instance_url}${nextPageUrl}`;
            existingDashboards = dashboards;
        }
        console.debug("loadDash", this.dashboardsCache, url);
        if (this.dashboardsCache[url]) {
            this.setState({
                dashboards: [
                    ...existingDashboards,
                    ...this.dashboardsCache[url]["dashboards"],
                ],
                nextPageUrl: this.dashboardsCache[url]["nextPageUrl"],
            });
            return;
        }
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
                const newDashboards = json.dashboards;
                const combinedDashboards = [
                    ...existingDashboards,
                    ...newDashboards,
                ];
                this.setState({
                    dashboards: combinedDashboards,
                    isLoginValid: true,
                    nextPageUrl: json.nextPageUrl,
                    totalDashboardLength: parseInt(json.totalSize, 10),
                });

                this.dashboardsCache[url] = {
                    "dashboards": newDashboards,
                    "nextPageUrl": json.nextPageUrl,
                };
            })
            .catch(err => {
                console.debug("fetch dashboards error", {err});
            });
    }

    onScrollDashboardPicker = e => {
        const target = e.target;
        if (target.scrollHeight - target.scrollTop === target.clientHeight) {
            this.loadDashboards();
        }
    };

    render() {
        const {dashboardHeight, dashboardId} = this.props;
        const {
            dashboards,
            totalDashboardLength,
            dashboardHeightModalOpen,
            isLightningLoaded,
            isLoggedIn,
            isLoginValid,
        } = this.state;
        const height = dashboardHeight || DEFAULT_DASHBOARD_HEIGHT;
        return <IconSettings
            onRequestIconPath={({category, name}) => `#${name}`}>
            <div
                className={Styles.App}
                style={{minHeight: dashboardHeight}}
                onScroll={this.onScrollDashboardPicker}>
                <UtilitySprite/>
                {!isLoggedIn && <ButtonPrompt
                    onClick={login}
                    text={quiptext("Connect to Salesforce")}/>}
                {isLoggedIn &&
                    !dashboardId && <DashboardPicker
                        dashboards={dashboards}
                        totalDashboardLength={totalDashboardLength}
                        setDashboardId={this.setDashboardId}
                        handleFilterChange={this.handleFilterChange}/>}
                {dashboardHeightModalOpen && <DashboardHeight
                    height={height}
                    setHeight={this.setDashboardHeight}
                    close={this.closeDashboardHeightModal}/>}
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
