// Copyright 2019 Quip

import quip, {MenuCommand} from "quip-apps-api";
import _ from "quiptext";
import {MenuActions} from "./lib/menu-actions";
import {lastUpdatedString} from "./lib/util";
import {AUTH_CONFIG_NAMES} from "./config";
import {AppData} from "./model/root";
import {SalesforceListData} from "./model/salesforce-list";

export class ListMenu {
    private actions_: MenuActions;
    constructor(actions: MenuActions) {
        this.actions_ = actions;
    }
    allMenuCommands() {
        return [
            {
                id: "refresh-list",
                label: _("Refresh Now") as string,
                handler: () => this.actions_.refreshList(),
            },
            {
                id: "change-list",
                label: _("Select Different List View") as string,
                handler: () => this.actions_.showListPicker(),
            },
            {
                id: "open-in-salesforce",
                label: _("Open in Salesforce") as string,
                handler: () => this.actions_.openInSalesforce(),
            },
            {
                id: "manage-columns",
                label: _("Manage Columns") as string,
                handler: () => this.actions_.showManageColumns(),
            },
            {
                id: "synced-to-salesforce",
                label: _("Synced to Salesforce") as string,
                 
                isHeader: true,
            },
            {
                id: "syncing-to-salesforce",
                label: _("Syncing to Salesforce") as string,
                quipIcon: quip.elements.MenuIcons.SYNCING,
                isHeader: true,
            },
            {
                id: "save-to-salesforce",
                label: _("Save to Salesforce") as string,
                quipIcon: quip.elements.MenuIcons.SYNCING,
                handler: () => this.actions_.save(),
            },
            {
                id: "discard-all-changes",
                label: _("Discard All Changes") as string,
                handler: () => this.actions_.resetData(),
            },
            {
                id: "add-comment",
                quipIcon: quip.elements.MenuIcons.COMMENT_INLINE,
                handler: () => this.actions_.toggleCommenting(),
            },
            {
                id: "hide-column",
                label: _("Hide Column") as string,
                handler: (id: string, {colName}: {colName: string}) =>
                    this.actions_.hideColumn(colName),
            },
            {
                id: "wrap-cells",
                label: _("Wrap Cells") as string,
                handler: () => this.actions_.toggleTruncateContent(),
            },
        ];
    }

    highlightedCommandIds_(data: AppData) {
        const {truncateContent, useSandboxAuth} = data;
        const highlightedCommandIds = [];
        if (truncateContent) {
            highlightedCommandIds.push("wrap-cells");
        }
        if (useSandboxAuth) {
            highlightedCommandIds.push("toggle-sandbox");
        }
        return highlightedCommandIds;
    }

    disabledCommandIds_(data: AppData) {
        const {isLoggedIn} = data;
        const disabledCommandIds = [];
        if (isLoggedIn) {
            disabledCommandIds.push("toggle-sandbox");
        }
        return disabledCommandIds;
    }

    updateToolbar(data: AppData) {
        const {selectedList} = data;
        const {isPlaceholder, lastFetchedTime, ownerId} = selectedList;
        const listOwner = quip.apps.getUserById(ownerId);
        const menuCommands = this.allMenuCommands();
        const toolbarCommandIds = this.getToolbarCommandIds(data);
        const instanceCommands = this.getInstanceCommands_(data);
        const hasInstanceCommands = Object.keys(instanceCommands).length > 0;

        if (isPlaceholder) {
            this.updateMenuForPlaceholderList_(
                menuCommands,
                toolbarCommandIds,
                instanceCommands,
                data);
            return;
        }
        const mainMenuSubCommands = [
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "last-updated-time",
        ];
        if (!isPlaceholder) {
            mainMenuSubCommands.push(
                "open-in-salesforce",
                "refresh-list",
                "change-list",
                "manage-columns",
                "wrap-cells");
        }
        if (hasInstanceCommands) {
            mainMenuSubCommands.push(
                quip.apps.DocumentMenuCommands.SEPARATOR,
                ...Object.keys(instanceCommands));
        }

        let lastUpdatedLabel = _("Last Updated %(time)s", {
            "time": lastUpdatedString(lastFetchedTime),
        }) as string;
        if (listOwner) {
            lastUpdatedLabel +=
                " • " +
                _("Connected as %(name)s", {
                    "name": listOwner.getName(),
                });
        }
        const updatedMenuCommands: MenuCommand[] = [
            {
                id: quip.apps.DocumentMenuCommands.MENU_MAIN,
                subCommands: mainMenuSubCommands,
            },
            {
                id: "last-updated-time",
                label: lastUpdatedLabel,
                isHeader: true,
            },
        ];
        updatedMenuCommands.push(...Object.values(instanceCommands));

        const allMenuCommands = [...updatedMenuCommands, ...menuCommands];
        quip.apps.updateToolbar({
            toolbarCommandIds,
            menuCommands: allMenuCommands,
            highlightedCommandIds: this.highlightedCommandIds_(data),
            disabledCommandIds: this.disabledCommandIds_(data),
        });
    }

    updateMenuForPlaceholderList_(
        menuCommands: MenuCommand[],
        toolbarCommandIds: string[],
        instanceCommands: {[id: string]: MenuCommand},
        data: AppData
    ) {
        const updatedMenuCommands = [
            {
                id: quip.apps.DocumentMenuCommands.MENU_MAIN,
                subCommands: Object.keys(instanceCommands),
            },
            ...Object.values(this.getInstanceCommands_(data)),
        ];
        const allMenuCommands = [...updatedMenuCommands, ...menuCommands];
        quip.apps.updateToolbar({
            toolbarCommandIds,
            menuCommands: allMenuCommands,
            highlightedCommandIds: this.highlightedCommandIds_(data),
            disabledCommandIds: this.disabledCommandIds_(data),
        });
    }

    getInstanceCommands_(data: AppData) {
        const {isLoggedIn, instanceUrl} = data;
        const commands: {[id: string]: MenuCommand} = {};
        if (isLoggedIn) {
            commands["current-instance"] = {
                id: "current-instance",
                label: instanceUrl.replace(/^https?:\/\//, ""),
                isHeader: true,
            };
            commands["logout"] = {
                id: "logout",
                label: _("Log Out") as string,
                handler: () => this.actions_.logout(),
            };
        } else {
            commands["login"] = {
                id: "login",
                label: _("Log In") as string,
                handler: () => this.actions_.login(),
            };
        }
        if (quip.apps.auth(AUTH_CONFIG_NAMES.SANDBOX)) {
            commands["toggle-sandbox"] = {
                id: "toggle-sandbox",
                label: _("Use Sandbox") as string,
                handler: () => this.actions_.toggleSandbox(),
            };
        }
        return commands;
    }

    getToolbarCommandIds({
        isReadOnly,
        selectedList,
        isSaving,
    }: {
        isReadOnly: boolean;
        selectedList: SalesforceListData;
        isSaving: boolean;
    }) {
        const toolbarIds = this.getDefaultToolbarCommandIds();
        if (!selectedList.isPlaceholder) {
            if (!isReadOnly) {
                if (isSaving) {
                    toolbarIds.push("syncing-to-salesforce");
                } else if (selectedList.isDirty) {
                    toolbarIds.push(
                        "save-to-salesforce",
                        quip.apps.DocumentMenuCommands.SEPARATOR,
                        "discard-all-changes");
                } else {
                    toolbarIds.push("synced-to-salesforce");
                }
                toolbarIds.push(quip.apps.DocumentMenuCommands.SEPARATOR);
            }
            toolbarIds.push("add-comment");
        }
        return toolbarIds;
    }

    getDefaultToolbarCommandIds() {
        return [quip.apps.DocumentMenuCommands.MENU_MAIN];
    }
}
