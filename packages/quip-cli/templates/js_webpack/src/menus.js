import quip from "quip-apps-api";
/**
 * Menu Actions are created at runtime based on a root record in
 * our Main component (since they can call actions on the main component and
 * trigger methods there). However, the menu is created before this component
 * and passed into it. The menuActions object is a lookup for menu actions
 * that may not exist yet but are guaranteed to exist at runtime.
 */
const err = (name) => () => {
    throw new Error(`MenuAction not implemented: ${name}`);
};
export const menuActions = {
    // Set the default implementation of menu actions here.
    // At runtime this `err` implementation should be replaced
    // by the constructor of the Main component
    toggleHighlight: err("toggle-highlight"),
};
export class Menu {
    constructor() {
        /**
         * This property defines all the available MenuCommands for the app.
         * The actual menu commands that appear on the app are defined
         * within the `updateToolbar` method in this class.
         */
        this.allCommands_ = [
            {
                id: "toggle-highlight",
                label: "Toggle Highlight",
                handler: () => menuActions.toggleHighlight(),
            },
        ];
    }
    /**
     * Update the app's displayed data as a function of the app data. This
     * method is called by the Main components listener on the RootEntity.
     * @param data
     */
    updateToolbar(data) {
        const subCommands = this.getMainMenuSubCommandIds_(data);
        const menuCommands = subCommands.length
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
    getToolbarCommandIds_(data) {
        const toolbarCommandIds_ = ["toggle-highlight"];
        return toolbarCommandIds_;
    }
    getMainMenuSubCommandIds_(data) {
        const mainMenuSubCommandIds = [];
        return mainMenuSubCommandIds;
    }
    getHighlightedCommandIds_(data) {
        const {isHighlighted} = data;
        const highlightedCommandIds = isHighlighted ? ["toggle-highlight"] : [];
        return highlightedCommandIds;
    }
    getDisabledCommandIds_(data) {
        const disabledCommandIds = [];
        return disabledCommandIds;
    }
}
