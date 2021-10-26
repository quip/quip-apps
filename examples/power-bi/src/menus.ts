import quip, {MenuCommand} from "quip-apps-api";
import Client from "./model/client";
import {AppData, RootEntity} from "./model/root";

const err = (name: string) => () => {
    throw new Error(`MenuAction not implemented: ${name}`);
};

export interface MenuActions {
    logIn: () => void;
    logOut: () => void;
    clearReport: () => void;
    templateMode: () => void;
    open: () => void;
}

export const menuActions: MenuActions = {
    logIn: err("log-in"),
    logOut: err("log-out"),
    clearReport: err("clear-report"),
    open: err("open"),
    templateMode: err("template-mode"),
};

export class Menu {
    updateToolbar(record: RootEntity, client: Client) {
        const subCommands: string[] = this.getMainMenuSubCommandIds_(record, client);
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
            toolbarCommandIds: this.getToolbarCommandIds_(record),
            menuCommands,
            highlightedCommandIds: this.getHighlightedCommandIds_(record),
            disabledCommandIds: this.getDisabledCommandIds_(record),
        });
    }

    private readonly allCommands_: MenuCommand[] = [
        {
            id: "log-in",
            label: "Log In",
            handler: () => menuActions.logIn(),
        },
        {
            id: "log-out",
            label: "Log Out",
            handler: () => menuActions.logOut(),
        },
        {
            id: "clear-report",
            label: "Change Report…",
            handler: () => menuActions.clearReport(),
        },
        {
            id: "template-mode",
            label: "Template Mode",
            handler: () => menuActions.templateMode(),
        },
        {
            id: "open",
            label: "Open in Power BI…",
            handler: () => menuActions.open(),
        },
    ];

    private getToolbarCommandIds_(record: RootEntity): string[] {
        return [
            quip.apps.DocumentMenuCommands.MENU_MAIN
        ];
    }

    private getMainMenuSubCommandIds_(record: RootEntity, client: Client): string[] {
        const data = record.getData();
        const mainMenuSubCommandIds: string[] = [
            "template-mode",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            client.loggedIn ? "log-out" : "log-in",
        ];
        if (data.reportId) {
            mainMenuSubCommandIds.unshift("clear-report");
        }
        if (data.reportLink) {
            mainMenuSubCommandIds.unshift("open");
        }
        return mainMenuSubCommandIds;
    }

    private getHighlightedCommandIds_(record: RootEntity): string[] {
        const highlightedCommands = [];
        if (record.isTemplateMode()) {
            highlightedCommands.push("template-mode");
        }
        return highlightedCommands;
    }

    private getDisabledCommandIds_(record: RootEntity): string[] {
        return [];
    }
}
