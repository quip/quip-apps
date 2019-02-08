import {getAuth} from "./root.jsx";

let AppContext;

export function setAppContext(c) {
    AppContext = c;
}

const heights = [400, 600, 699, 800, 1000];

export const DEFAULT_DASHBOARD_HEIGHT = 699;
export const DEFAULT_SAVED_VIEW_ID = "viewNotSet";

export function getAllMenuCommands(savedViews) {
    const commands = [
        {
            id: "login",
            label: quiptext("Sign in"),
            handler: login,
        },
        {
            id: "logout",
            label: quiptext("Sign out"),
            handler: logout,
        },
        {
            id: "setHeight",
            label: quiptext("Set Height"),
            subCommands: heights.map(h => h.toString()),
        },
        ...heights.map(h => ({
            id: h.toString(),
            label: `${h}px`,
            handler: () => {
                quip.apps.getRootRecord().set("dashboardHeight", h);
                updateCommandsState();
            },
            isHeader: false,
        })),
        {
            id: "openInAnalyticsStudio",
            label: quiptext("Open in Analytics Studio"),
            handler: () => {
                const instanceUrl = getAuth().getTokenResponse().instance_url;
                const dashboardId = quip.apps
                    .getRootRecord()
                    .get("dashboardId");
                const dashboardUrl = `${instanceUrl}/analytics/wave/wave.apexp#dashboard/${dashboardId}`;
                console.debug({dashboardUrl});
                quip.apps.openLink(dashboardUrl);
            },
        },
        {
            id: "clearDashboardId",
            label: quiptext("Change Dashboard"),
            handler: () => {
                if (quip.apps.isNative()) {
                    AppContext.showUnavailableOnNativeError();
                    return;
                }

                AppContext.clearDashboardId();
                AppContext.clearDashboardImage();
            },
        },
    ];

    if (savedViews && savedViews.length > 0) {
        const views = savedViews.slice(0);
        views.unshift({
            id: DEFAULT_SAVED_VIEW_ID,
            label: quiptext("None"),
        });
        commands.push({
            id: "loadView",
            label: quiptext("Load View"),
            subCommands: views.map(view => view.id),
        });
        views.forEach(view => {
            commands.push({
                id: view.id,
                label: view.label,
                isHeader: false,
                handler: () => {
                    AppContext.setSavedViewId(view.id);
                    updateCommandsState();
                },
            });
        });
    }

    return commands;
}

export function login() {
    setLoading();
    getAuth()
        .login({prompt: "login"})
        .then(updateIsLoggedIn)
        .catch(loginFailed)
        .finally(clearLoading);
}

export function logout() {
    setLoading();
    getAuth()
        .logout()
        .then(() => {
            updateIsLoggedIn();
            AppContext.clearDashboardsCache();
            AppContext.clearDashboardImage();
        })
        .finally(clearLoading);
}

export function updateIsLoggedIn() {
    quip.apps.getUserPreferences().save({"logged_in": getAuth().isLoggedIn()});
    updateToolbar();
}

export function loginFailed(err) {
    AppContext.showLoginFailedError();
}

export function setLoading() {
    AppContext.setState({isLoading: true});
}

export function clearLoading() {
    AppContext.setState({isLoading: false});
}

export function updateToolbar(savedViews) {
    const toolbarCommandIds = getToolbarCommandIds(savedViews);
    const allMenuCommands = getAllMenuCommands(savedViews);
    const updatedMenuCommands = [
        ...allMenuCommands,
        {
            id: quip.apps.DocumentMenuCommands.MENU_MAIN,
            subCommands: getMainMenuSubCommandIds(),
        },
    ];

    quip.apps.updateToolbar({
        toolbarCommandIds,
        menuCommands: updatedMenuCommands,
    });

    updateCommandsState();
}

export function updateCommandsState() {
    const viewId = AppContext.getSavedViewId() || DEFAULT_SAVED_VIEW_ID;
    const height =
        quip.apps.getRootRecord().get("dashboardHeight") ||
        DEFAULT_DASHBOARD_HEIGHT;
    quip.apps.updateToolbarCommandsState([], [height, viewId]);
}

export function getMainMenuSubCommandIds() {
    const isLoggedIn = getAuth().isLoggedIn();
    const dashboardId = quip.apps.getRootRecord().get("dashboardId");
    let mainMenuSubCommandIds = [];
    if (isLoggedIn && dashboardId) {
        mainMenuSubCommandIds.push("clearDashboardId");
    }
    if (isLoggedIn) {
        mainMenuSubCommandIds.push("logout");
    } else {
        mainMenuSubCommandIds.push("login");
    }
    return mainMenuSubCommandIds;
}

export function getToolbarCommandIds(savedViews) {
    const isLoggedIn = getAuth().isLoggedIn();
    const dashboardId = quip.apps.getRootRecord().get("dashboardId");
    const inSlides = quip.apps.inGridLayout && quip.apps.inGridLayout();
    let toolbarCommandIds = [quip.apps.DocumentMenuCommands.MENU_MAIN];
    if (isLoggedIn && dashboardId) {
        if (!inSlides) {
            toolbarCommandIds.push("setHeight");
        }
        if (savedViews && savedViews.length > 0) {
            toolbarCommandIds.push("loadView");
        }
        toolbarCommandIds.push("openInAnalyticsStudio");
    }
    return toolbarCommandIds;
}
