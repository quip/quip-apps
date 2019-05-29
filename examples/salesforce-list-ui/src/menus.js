import {getAuth} from "./connectRecord";

const lightningUrl = url => `${url.split(".")[0]}.lightning.force.com`;

let AppContext;

export function setAppContext(c) {
    AppContext = c;
}

export function getAllMenuCommands() {
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
            id: "clearRecordId",
            label: quiptext("Change Record"),
            handler: () => {
                AppContext.clearRecordId();
            },
        },
        {
            id: "openInSalesforce",
            label: quiptext("Open in Salesforce"),
            handler: () => {
                const rootRecord = quip.apps.getRootRecord();
                const instanceUrl = getAuth().getTokenResponse().instance_url;
                const listViewData = rootRecord.get("listViewData");
                const listReference = listViewData.info.listReference;
                const url = `${lightningUrl(
                    instanceUrl
                )}/lightning/o/${listReference.objectApiName}/list?filterName=${listReference.id}`;
                console.debug("openLink", url);
                quip.apps.openLink(url);
            },
        },
    ];

    return commands;
}

export function login() {
    AppContext.login();
}

export function logout() {
    AppContext.logout();
}

export function updateToolbar() {
    const toolbarCommandIds = getToolbarCommandIds();
    const allMenuCommands = getAllMenuCommands();
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
}

export function getMainMenuSubCommandIds() {
    const isLoggedIn = getAuth().isLoggedIn();
    let mainMenuSubCommandIds = [];
    if (isLoggedIn) {
        mainMenuSubCommandIds.push("logout");
    } else {
        mainMenuSubCommandIds.push("login");
    }
    return mainMenuSubCommandIds;
}

export function getToolbarCommandIds() {
    const isLoggedIn = getAuth().isLoggedIn();
    const recordId = quip.apps.getRootRecord().get("recordId");
    let toolbarCommandIds = [quip.apps.DocumentMenuCommands.MENU_MAIN];
    if (isLoggedIn && recordId) {
        toolbarCommandIds.push("openInSalesforce");
    }
    return toolbarCommandIds;
}
