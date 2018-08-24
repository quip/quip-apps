import {getAuth} from "./root.jsx";

export function getAllMenuCommands() {
    return [
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
            id: "height",
            label: quiptext("Height"),
            handler: () => {},
        },
        {
            id: "clearDashboardId",
            label: quiptext("Change Dashboard"),
            handler: () => {
                const rootRecord = quip.apps.getRootRecord();
                rootRecord.set("dashboardId", null);
                updateToolbar();
            },
        },
    ];
}

export function login() {
    getAuth()
        .login()
        .then(updateIsLoggedIn);
}
export function logout() {
    getAuth()
        .logout()
        .then(updateIsLoggedIn);
}

export function updateIsLoggedIn() {
    quip.apps.getUserPreferences().save({"logged_in": getAuth().isLoggedIn()});
    updateToolbar();
}
export function updateToolbar() {
    const toolbarCommandIds = getToolbarCommandIds();
    console.debug("updateToolbar", {toolbarCommandIds});
    quip.apps.updateToolbar({toolbarCommandIds});
}

export function getToolbarCommandIds() {
    const isLoggedIn = getAuth().isLoggedIn();
    const dashboardId = quip.apps.getRootRecord().get("dashboardId");
    let toolbarCommandIds = [];
    if (isLoggedIn && dashboardId) {
        toolbarCommandIds.push("clearDashboardId");
    }
    if (isLoggedIn) {
        toolbarCommandIds.push("logout");
    }
    return toolbarCommandIds;
}
