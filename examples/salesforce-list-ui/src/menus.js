import {getAuth} from "./connectRecord";

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
    let toolbarCommandIds = [quip.apps.DocumentMenuCommands.MENU_MAIN];
    return toolbarCommandIds;
}
