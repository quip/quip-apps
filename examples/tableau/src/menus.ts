import quip, {MenuCommand} from "quip-apps-api";
import {AppData} from "./model/root";
import { ViewSize } from "./model/tableau";

/**
 * Menu Actions are created at runtime based on a root record in
 * our Main component (since they can call actions on the main component and
 * trigger methods there). However, the menu is created before this component
 * and passed into it. The menuActions object is a lookup for menu actions
 * that may not exist yet but are guaranteed to exist at runtime.
 */
const err = (name: string) => () => {
    throw new Error(`MenuAction not implemented: ${name}`);
};
export interface MenuActions {
    login: () => void;
    logout: () => void;
    changeView: () => void;
    setViewSize: (size: ViewSize) => void;
    openParameters: () => void;
    openFilters: () => void;
}
export const menuActions: MenuActions = {
    // Set the default implementation of menu actions here.
    // At runtime this `err` implementation should be replaced
    // by the constructor of the Main component
    login: err("login"),
    logout: err("logout"),
    changeView: err("changeView"),
    setViewSize: err("setViewSize"),
    openParameters: err("openParameters"),
    openFilters: err("openFilters"),
};

export class Menu {
    /**
     * Update the app's displayed data as a function of the app data. This
     * method is called by the Main components listener on the RootEntity.
     * @param data
     */
    updateToolbar(data: AppData) {
        const subCommands: string[] = this.getMainMenuSubCommandIds_(data);
        const menuCommands: MenuCommand[] = subCommands.length
            ? [
                  {
                      id: quip.apps.DocumentMenuCommands.MENU_MAIN,
                      subCommands,
                  },
                  ...this.allCommands_,
              ]
            : this.allCommands_;

        quip.apps.updateToolbar({
            toolbarCommandIds: this.getToolbarCommandIds_(data),
            menuCommands,
            highlightedCommandIds: this.getHighlightedCommandIds_(data),
            disabledCommandIds: this.getDisabledCommandIds_(data),
        });
    }

    /**
     * This property defines all the available MenuCommands for the app.
     * The actual menu commands that appear on the app are defined
     * within the `updateToolbar` method in this class.
     */
    private readonly allCommands_: MenuCommand[] = [
        {
            id: "login",
            label: "Log In",
            handler: () => menuActions.login(),
        },
        {
            id: "logout",
            label: "Log Out",
            handler: () => menuActions.logout(),
        },
        {
            id: "change-view",
            label: "Change Dashboard…",
            handler: () => menuActions.changeView(),
        },
        {
            id: "set-view-size-auto",
            label: "Automatic",
            handler: () => menuActions.setViewSize(ViewSize.Auto),
        },
        {
            id: "set-view-size-desktop",
            label: "Desktop",
            handler: () => menuActions.setViewSize(ViewSize.Desktop),
        },
        {
            id: "set-view-size-tablet",
            label: "Tablet",
            handler: () => menuActions.setViewSize(ViewSize.Tablet),
        },
        {
            id: "set-view-size-mobile",
            label: "Mobile",
            handler: () => menuActions.setViewSize(ViewSize.Mobile),
        },
        {
            id: "open-parameters",
            label: "Parameters…",
            handler: () => menuActions.openParameters(),
        },
        {
            id: "open-filters",
            label: "Filters…",
            handler: () => menuActions.openFilters(),
        },
    ];

    private getToolbarCommandIds_(data: AppData): string[] {
        const toolbarCommandIds_: string[] = [];
        return toolbarCommandIds_;
    }

    private getMainMenuSubCommandIds_(data: AppData): string[] {
        const mainMenuSubCommandIds: string[] = [];
        return mainMenuSubCommandIds;
    }

    private getHighlightedCommandIds_(data: AppData): string[] {
        const highlightedCommandIds: string[] = [];
        return highlightedCommandIds;
    }

    private getDisabledCommandIds_(data: AppData): string[] {
        const disabledCommandIds: string[] = [];
        return disabledCommandIds;
    }
}
