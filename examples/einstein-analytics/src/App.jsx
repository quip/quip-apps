import PropTypes from "prop-types";
import React from "react";

import ButtonPrompt from "./ButtonPrompt.jsx";
import Dashboard from "./Dashboard.jsx";
import DashboardPicker from "./DashboardPicker.jsx";
import ErrorPopover from "../../shared/base-field-builder/error-popover.jsx";
import UtilitySprite from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";
import lightningUrl from "./lightningUrl";
import loadScript from "./loadScript";
import {IconSettings} from "@salesforce/design-system-react";
import {getAuth} from "./root.jsx";

import {
    DEFAULT_DASHBOARD_HEIGHT,
    login,
    logout,
    setAppContext,
    updateToolbar,
} from "./menus";

import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import Styles from "./App.less";

const DASHBOARD_KEY = "dashboardId";
const SAVED_VIEW_KEY = "savedViewId";
const DASHBOARDS_PAGE_SIZE = 50;
const CHECK_DASHBOARD_DELAY = 20000;
const SPINNER_TIMEOUT = 10000;
const errorTimeout = {
    LONG: 10000,
    MEDIUM: 6000,
    SHORT: 2000,
};

/* TODO(elsigh):
"intercept_url_patterns": [
    "https://*.salesforce.com/analytics/wave/wave.apexp#dashboard/*"
]
*/
export default class App extends React.Component {
    static propTypes = {
        dashboardId: PropTypes.string,
        dashboardImage: PropTypes.string,
        dashboardHeight: PropTypes.number,
    };
    constructor(props) {
        super();
        setAppContext(this);
        const auth = getAuth();
        const isLoggedIn = auth.isLoggedIn();
        const tokenResponse = auth.getTokenResponse();
        console.warn({tokenResponse});
        this.state = {
            dashboards: [],
            isDashboardLoaded: false,
            isLoggedIn,
            isLoading: false,
            isLoginValid: false, // TODO: use timestamp from auth response?
            isLightningLoaded: false,
            filterQuery: "",
            showErrorPopover: false,
            showImageSpinner: false,
            errorMessage: "",
        };
        this.dashboardsCache = {};
        if (isLoggedIn) {
            this.loadDashboards();
            this.loadLightning();
        }
    }

    componentDidMount() {
        window.addEventListener("message", this.onMessage);

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

        this.loadViewsAndUpdateToolbar(this.props.dashboardId);
        this.checkDashboardLoaded();
    }

    componentWillUnmount() {
        window.removeEventListener("message", this.onMessage);

        if (this.loadLightningTimeout_) {
            window.clearTimeout(this.loadLightningTimeout_);
        }
        if (this.loadLightningInterval) {
            window.clearInterval(this.loadLightningInterval);
        }
        this.clearCheckDashboardTimeout();
    }

    clearCheckDashboardTimeout() {
        if (this.checkDashboardTimeoutId) {
            window.clearTimeout(this.checkDashboardTimeoutId);
            this.checkDashboardTimeoutId = null;
        }
    }

    checkDashboardLoaded = () => {
        const {
            isDashboardLoaded,
            isLightningLoaded,
            isLoading,
            isLoggedIn,
            isLoginValid,
            showErrorPopover,
        } = this.state;

        if (this.checkDashboardTimeoutId) {
            this.checkDashboardTimeoutId = null;

            const {dashboardId} = this.props;

            if (isLoggedIn &&
                isLoginValid &&
                isLightningLoaded &&
                dashboardId &&
                !isDashboardLoaded) {
                this.showDashboardLoadError();
            }

            return;
        }

        if (showErrorPopover || isDashboardLoaded) {
            return;
        }

        this.checkDashboardTimeoutId = window.setTimeout(
            this.checkDashboardLoaded,
            CHECK_DASHBOARD_DELAY);
    };

    onMessage = msg => {
        if (!msg.data || !msg.data.image) {
            return;
        }
        console.debug("Got a postMessage screenshot!", msg);
        quip.apps.getRootRecord().set("dashboardImage", msg.data.image);
    };

    setDashboardId = dashboardId => {
        quip.apps.getRootRecord().set(DASHBOARD_KEY, dashboardId);
        this.loadViewsAndUpdateToolbar(dashboardId);
        this.clearCheckDashboardTimeout();
        this.checkDashboardLoaded();
    };

    setSavedViewId = savedViewId => {
        quip.apps.getRootRecord().set(SAVED_VIEW_KEY, savedViewId);
        this.showUnavailableError();
    };

    getSavedViewId = () => {
        return quip.apps.getRootRecord().get(SAVED_VIEW_KEY);
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

    clearDashboardId() {
        const rootRecord = quip.apps.getRootRecord();
        rootRecord.set(DASHBOARD_KEY, null);
        rootRecord.set(SAVED_VIEW_KEY, null);
        this.setState({isDashboardLoaded: false});
        this.loadViewsAndUpdateToolbar();
    }

    clearDashboardImage() {
        const rootRecord = quip.apps.getRootRecord();
        rootRecord.set("dashboardImage", null);
        this.setState({isDashboardLoaded: false});
    }

    clearDashboardsCache() {
        this.dashboardsCache = {};
        this.setState({dashboards: []});
    }

    loadViewsAndUpdateToolbar(dashboardId) {
        if (dashboardId) {
            this.loadViews(dashboardId).then(updateToolbar);
        } else {
            updateToolbar();
        }
    }

    loadViews(dashboardId) {
        if (!dashboardId) {
            return Promise.resolve([]);
        }

        const token = getAuth().getTokenResponse();
        const url = `${
            token.instance_url
        }/services/data/v45.0/wave/dashboards/${dashboardId}/savedviews?type=User`;

        return getAuth()
            .request({url})
            .then(response => (response.ok ? response.json().savedViews : []));
    }

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
            }/services/data/v43.0/wave/dashboards?sort=LastModified&q=${sanitizedFilterQuery}&pageSize=${DASHBOARDS_PAGE_SIZE}`;
            existingDashboards = [];
        } else if (nextPageUrl === null) {
            // If nextPageUrl is none, it means we have fetched all the results
            // corresponding to the query.
            return;
        } else {
            url = `${tokenResponse.instance_url}${nextPageUrl}`;
            existingDashboards = dashboards;
        }
        console.debug("loadDashboards", this.dashboardsCache, url);
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

    onDashboardLoaded = () => {
        console.debug("onDashboardLoaded!");
        this.setState({isDashboardLoaded: true});
    };

    showDashboardLoadError = () => {
        this.showError("Dashboard failed to load", errorTimeout.MEDIUM);
    };

    showUnavailableOnNativeError = () => {
        this.showError(
            "This functionality is only available on the Web",
            errorTimeout.MEDIUM);
    };

    showUnavailableError = () => {
        this.showError(
            "This functionality is not yet available",
            errorTimeout.MEDIUM);
    };

    showLoginFailedError = () => {
        this.showError("Unable to login to Salesforce", errorTimeout.LONG);
    };

    showImageSpinner = () => {
        this.setState({showImageSpinner: true});
        window.setTimeout(
            () => this.setState({showImageSpinner: false}),
            SPINNER_TIMEOUT);
    };

    showError = (message, timeout) => {
        this.setState({
            showErrorPopover: true,
            errorMessage: message,
        });

        if (timeout) {
            window.setTimeout(this.clearError, timeout);
        }
    };

    clearError = () => {
        this.setState({showErrorPopover: false, errorMessage: ""});
    };

    render() {
        const {dashboardHeight, dashboardId, dashboardImage} = this.props;
        const {
            dashboards,
            isDashboardLoaded,
            isLightningLoaded,
            isLoading,
            isLoggedIn,
            isLoginValid,
            totalDashboardLength,
            showErrorPopover,
            showImageSpinner,
            errorMessage,
        } = this.state;
        const height = dashboardHeight || DEFAULT_DASHBOARD_HEIGHT;
        const rootId = quip.apps.getRootRecordId();

        let spinner = null;
        let buttonPrompt = null;
        let image = null;
        let loginRefreshing = null;
        let dashboardPicker = null;
        let dashboard = null;
        let errorPopover = null;

        if (showErrorPopover) {
            errorPopover = <ErrorPopover errorMessage={errorMessage}/>;
        }

        if (isLoading) {
            spinner = <quip.apps.ui.Spinner size={25} loading={true}/>;
        } else {
            if (!isLoggedIn && !dashboardImage) {
                buttonPrompt = <ButtonPrompt
                    onClick={login}
                    text={quiptext("Connect to Salesforce")}/>;
            }
            if (dashboardImage && !isDashboardLoaded) {
                if (showImageSpinner) {
                    spinner = <quip.apps.ui.Spinner size={25} loading={true}/>;
                }
                image = <div
                    className={Styles.dashboardCachedImage}
                    onClick={!isLoggedIn ? login : this.showImageSpinner}
                    style={{height}}>
                    <img src={dashboardImage}/>
                </div>;
            }
            if (isLoggedIn && !isLoginValid && !dashboardImage) {
                loginRefreshing = <div
                    className={Styles.loginRefreshing}
                    style={{height}}/>;
            }
            if (isLoggedIn && isLoginValid && !dashboardId) {
                dashboardPicker = <DashboardPicker
                    dashboards={dashboards}
                    totalDashboardLength={totalDashboardLength}
                    setDashboardId={this.setDashboardId}
                    showUnavailableError={this.showUnavailableOnNativeError}
                    handleFilterChange={this.handleFilterChange}/>;
            }
            if (isLoggedIn &&
                isLoginValid &&
                isLightningLoaded &&
                dashboardId) {
                dashboard = <Dashboard
                    key={`${dashboardId}-${rootId}`}
                    dashboardId={dashboardId}
                    savedViewId={this.getSavedViewId()}
                    dashboardImage={dashboardImage}
                    onDashboardLoaded={this.onDashboardLoaded}/>;
            }
        }

        return <IconSettings
            onRequestIconPath={({category, name}) => `#${name}`}>
            <div
                className={Styles.App}
                style={{height}}
                onScroll={this.onScrollDashboardPicker}>
                <UtilitySprite/>
                {errorPopover}
                {buttonPrompt}
                {spinner}
                {image}
                {loginRefreshing}
                {dashboardPicker}
                {dashboard}
            </div>
        </IconSettings>;
    }
}
