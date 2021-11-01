import quip, {MenuCommand} from "quip-apps-api";
import {AppData, ViewWidth} from "./model/root";

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
    setViewWidth: (size: ViewWidth) => void;
    openParameters: () => void;
    openFilters: () => void;
    openInTableau: () => void;
}
export const menuActions: MenuActions = {
    // Set the default implementation of menu actions here.
    // At runtime this `err` implementation should be replaced
    // by the constructor of the Main component
    login: err("login"),
    logout: err("logout"),
    changeView: err("changeView"),
    setViewWidth: err("setViewWidth"),
    openParameters: err("openParameters"),
    openFilters: err("openFilters"),
    openInTableau: err("openInTableau"),
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
            id: "set-width",
            label: "Set Width…",
            subCommands: Object.keys(ViewWidth)
                .filter((k) => isNaN(+k))
                .map((sizeName) => `set-width-${sizeName}`),
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
        {
            id: "open-in-tableau",
            label: "Open in Tableau",
            handler: () => menuActions.openInTableau(),
        },
        ...Object.keys(ViewWidth)
            .filter((k) => isNaN(+k))
            .map((sizeName) => ({
                id: `set-width-${sizeName}`,
                label: sizeName,
                handler: () =>
                    menuActions.setViewWidth(
                        ViewWidth[sizeName as keyof typeof ViewWidth]
                    ),
            })),
    ];

    private getToolbarCommandIds_(data: AppData): string[] {
        const toolbarCommandIds_: string[] = [
            quip.apps.DocumentMenuCommands.MENU_MAIN,
        ];
        if (data.viewUrl) {
            toolbarCommandIds_.push("open-in-tableau");
            toolbarCommandIds_.push(quip.apps.DocumentMenuCommands.SEPARATOR);
            toolbarCommandIds_.push("open-parameters");
            toolbarCommandIds_.push("open-filters");
            toolbarCommandIds_.push(quip.apps.DocumentMenuCommands.SEPARATOR);
            toolbarCommandIds_.push("set-width");
        }
        return toolbarCommandIds_;
    }

    private getMainMenuSubCommandIds_(data: AppData): string[] {
        const mainMenuSubCommandIds: string[] = [];
        if (data.viewUrl) {
            mainMenuSubCommandIds.push("change-view");
            mainMenuSubCommandIds.push(
                quip.apps.DocumentMenuCommands.SEPARATOR
            );
        }
        mainMenuSubCommandIds.push(data.loggedIn ? "logout" : "login");
        return mainMenuSubCommandIds;
    }

    private getHighlightedCommandIds_(data: AppData): string[] {
        const highlightedCommandIds: string[] = [];
        if (data.viewUrl) {
            highlightedCommandIds.push(`set-width-${data.width}px`);
        }
        return highlightedCommandIds;
    }

    private getDisabledCommandIds_(data: AppData): string[] {
        const disabledCommandIds: string[] = [];
        return disabledCommandIds;
    }
}
