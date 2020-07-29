import quip, {MenuCommand} from "quip-apps-api";
import {AppData} from "./model/root";

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
    // Your menu action definitions here
    // `toggleHighlight` is an example that will flip a boolean
    // `isHighlighted` on the RootEntity.
    toggleHighlight: () => void;
}
export const menuActions: MenuActions = {
    // Set the default implementation of menu actions here.
    // At runtime this `err` implementation should be replaced
    // by the constructor of the Main component
    toggleHighlight: err("toggle-highlight"),
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
            id: "toggle-highlight",
            label: "Toggle Highlight",
            handler: () => menuActions.toggleHighlight(),
        },
    ];

    private getToolbarCommandIds_(data: AppData): string[] {
        const toolbarCommandIds_: string[] = ["toggle-highlight"];
        return toolbarCommandIds_;
    }

    private getMainMenuSubCommandIds_(data: AppData): string[] {
        const mainMenuSubCommandIds: string[] = [];
        return mainMenuSubCommandIds;
    }

    private getHighlightedCommandIds_(data: AppData): string[] {
        const {isHighlighted} = data;
        const highlightedCommandIds: string[] = isHighlighted
            ? ["toggle-highlight"]
            : [];
        return highlightedCommandIds;
    }

    private getDisabledCommandIds_(data: AppData): string[] {
        const disabledCommandIds: string[] = [];
        return disabledCommandIds;
    }
}
