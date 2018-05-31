// Copyright 2017 Quip

import {getRecordComponent, getRecordPickerComponent} from "./root.jsx";
import {AUTH_CONFIG_NAMES} from "./config.js";
import {BaseMenu} from "../../shared/base-field-builder/base-menu.js";
import {MismatchedInstanceError} from "./client";

let selectedFieldEntity;
let isLogoutInProgress_ = false;

export class FieldBuilderMenu extends BaseMenu {
    allMenuCommands() {
        const wrapHandlerWithLogin = (menuCommand, handler) => () =>
            getRecordPickerComponent()
                .ensureLoggedIn(menuCommand)
                .then(handler)
                .catch(err => {
                    console.warn(
                        `${menuCommand} handler failed because not logged in.`);
                });
        return [
            {
                id: "refresh-record",
                label: quiptext("Refresh Now"),
                handler: wrapHandlerWithLogin("refresh-record", () =>
                    this.refreshRecord_()
                ),
            },
            {
                id: "change-record",
                label: quiptext("Change Record…"),
                handler: wrapHandlerWithLogin("change-record", () =>
                    this.changeRecord_()
                ),
            },
            {
                id: "add-field",
                label: quiptext("Add Field"),
                handler: wrapHandlerWithLogin("add-field", () =>
                    this.addField_()
                ),
            },
            {
                id: "save-data",
                label: quiptext("Save to Salesforce"),
                quipIcon: quip.apps.MenuIcons.SYNCING,
                handler: wrapHandlerWithLogin("save-data", () =>
                    this.saveData_()
                ),
            },
            {
                id: "open-in-salesforce",
                label: quiptext("Open in Salesforce"),
                handler: () => {
                    const selectedRecord = quip.apps
                        .getRootEntity()
                        .getSelectedRecord();
                    selectedRecord.openLink();
                },
            },
            {
                id: "reconnect-as-me",
                label: quiptext("Take Over…"),
                handler: wrapHandlerWithLogin("reconnect-as-me", () =>
                    this.reconnectAsMe_()
                ),
            },
            {
                id: "revert-changes",
                label: quiptext("Discard Changes"),
                handler: () => selectedFieldEntity.revertToOriginal(),
            },
            {
                id: "remove-field",
                label: quiptext("Hide Field"),
                handler: () => selectedFieldEntity.remove(),
            },
        ];
    }

    showFieldContextMenu(e, button, fieldEntity) {
        selectedFieldEntity = fieldEntity;
        const commands = ["remove-field"];
        quip.apps.showContextMenuFromButton(button, commands);
    }

    showDraftContextMenu(e, button, fieldEntity) {
        selectedFieldEntity = fieldEntity;
        const commands = ["revert-changes"];
        quip.apps.showContextMenuFromButton(button, commands);
    }

    showRecordPickerContextMenu(e, button, commands, onDismiss) {
        quip.apps.showContextMenuFromButton(
            button,
            commands,
            [],
            [],
            onDismiss);
    }

    getDisabledCommands_() {
        const disabledCommands = [];
        const selectedRecord = quip.apps.getRootEntity().getSelectedRecord();
        if (!selectedRecord ||
            (quip.apps.isExplorerTemplate && quip.apps.isExplorerTemplate()) ||
            (quip.apps
                .getRootEntity()
                .getClient()
                .isLoggedIn() &&
                !quip.apps
                    .getRootEntity()
                    .getClient()
                    .onSourceInstance())) {
            disabledCommands.push("refresh-record");
            disabledCommands.push("change-record");
            disabledCommands.push("add-field");
            disabledCommands.push("save-data");
            disabledCommands.push("open-in-salesforce");
        } else {
            if (selectedRecord.isPlaceholder() ||
                (quip.apps.getViewingUser() !== null &&
                    selectedRecord.getOwnerId() ===
                        quip.apps.getViewingUser().getId())) {
            }
            if (!selectedRecord.isDirty() || selectedRecord.saveInProgress()) {
                disabledCommands.push("save-data");
            }
        }
        if (!quip.apps
                .getRootEntity()
                .getClient()
                .isLoggedIn() ||
            isLogoutInProgress_) {
            disabledCommands.push("logout");
        }
        return disabledCommands;
    }

    isCommandDisabled_(id) {
        return this.getDisabledCommands_().indexOf(id) >= 0;
    }

    refreshToolbar() {
        quip.apps.updateToolbarCommandsState(this.getDisabledCommands_(), []);
    }

    updateToolbar(recordEntity) {
        const menuCommands = this.allMenuCommands();
        const toolbarCommandIds = this.getToolbarCommandIds(recordEntity);
        const instanceCommands = this.getInstanceCommands_();
        const hasInstanceCommands = Object.keys(instanceCommands).length > 0;

        if (recordEntity.isPlaceholder()) {
            this.updateMenuForPlaceholderRecord_(
                menuCommands,
                toolbarCommandIds,
                instanceCommands);
            return;
        }
        const mainMenuSubCommands = [
            "record-header",
            "change-record",
            "open-in-salesforce",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "last-updated-time",
            "refresh-record",
        ];
        if (hasInstanceCommands) {
            mainMenuSubCommands.push(
                quip.apps.DocumentMenuCommands.SEPARATOR,
                ...Object.keys(instanceCommands));
        }

        let lastUpdatedLabel = BaseMenu.getLastUpdatedString(recordEntity);
        const recordOwner = recordEntity.getOwner();
        if (recordOwner !== null) {
            lastUpdatedLabel +=
                " • " +
                quiptext("Connected as %(name)s", {
                    "name": recordOwner.getName(),
                });
        }
        const updatedMenuCommands = [
            {
                id: quip.apps.DocumentMenuCommands.MENU_MAIN,
                subCommands: mainMenuSubCommands,
            },
            {
                id: "record-header",
                label:
                    recordEntity.getHeaderName() +
                    "\n" +
                    quip.apps.getRootEntity().getHostname(),
                isHeader: true,
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
        });
    }

    updateMenuForPlaceholderRecord_(
        menuCommands,
        toolbarCommandIds,
        instanceCommands) {
        const updatedMenuCommands = [
            {
                id: quip.apps.DocumentMenuCommands.MENU_MAIN,
                subCommands: Object.keys(instanceCommands),
            },
            ...Object.values(this.getInstanceCommands_()),
        ];
        const allMenuCommands = [...updatedMenuCommands, ...menuCommands];
        quip.apps.updateToolbar({
            toolbarCommandIds,
            menuCommands: allMenuCommands,
            highlightedCommandIds: [],
        });
    }

    getInstanceCommands_() {
        const rootEntity = quip.apps.getRootEntity();
        const isLoggedIn = rootEntity.getClient().isLoggedIn();

        const commands = {};
        if (isLoggedIn) {
            commands["current-instance"] = {
                id: "current-instance",
                label: rootEntity.getClient().getHostname(),
                isHeader: true,
            };
        }
        if (quip.apps.getRootEntity().hasSandboxAuth()) {
            commands["toggle-sandbox"] = {
                id: "toggle-sandbox",
                label: rootEntity.useSandbox()
                    ? quiptext("Use Production")
                    : quiptext("Use Sandbox"),
                handler: () => quip.apps.getRootEntity().toggleUseSandbox(),
            };
        }
        if (isLoggedIn) {
            commands["logout"] = {
                id: "logout",
                label: quiptext("Log Out"),
                handler: () => this.logout_(),
            };
        } else {
            commands["login"] = {
                id: "login",
                label: quiptext("Log In"),
                handler: () =>
                    getRecordPickerComponent().ensureLoggedIn("login"),
            };
        }
        return commands;
    }

    logout_() {
        isLogoutInProgress_ = true;
        this.refreshToolbar();
        return quip.apps
            .getRootEntity()
            .logout()
            .then(() => {
                isLogoutInProgress_ = false;
                quip.apps.getRootEntity().clearCachedData();
                this.updateToolbar(
                    quip.apps.getRootEntity().getSelectedRecord());
                this.refreshToolbar();
            });
    }

    getToolbarCommandIds(recordEntity) {
        const commandIds = this.getDefaultToolbarCommandIds();
        if (!recordEntity.isPlaceholder() &&
            !this.isCommandDisabled_("add-field")) {
            commandIds.push("add-field");
        }
        return commandIds;
    }

    getDefaultToolbarCommandIds() {
        return [quip.apps.DocumentMenuCommands.MENU_MAIN, "save-data"];
    }

    refreshRecord_() {
        const selectedRecord = quip.apps.getRootEntity().getSelectedRecord();
        if (selectedRecord) {
            selectedRecord.reload();
        }
    }

    addField_() {
        getRecordComponent().showFieldPicker();
        quip.apps
            .getRootEntity()
            .getSelectedRecord()
            .fetchData()
            .then(response => {})
            .catch(error => {
                getRecordComponent().errorHandling(error);
            });
        quip.apps
            .getRootEntity()
            .getSelectedRecord()
            .updateOwnerIdWithCurrentViewerId();
        this.updateToolbar(quip.apps.getRootEntity().getSelectedRecord());
    }

    changeRecord_() {
        getRecordPickerComponent().restoreToDefaultState();
        getRecordPickerComponent().fetchData();
        quip.apps
            .getRootEntity()
            .getSelectedRecord()
            .clearError();
        getRecordComponent().clearError();
        this.updateToolbar(quip.apps.getRootEntity().getSelectedRecord());
    }

    saveData_() {
        getRecordComponent().hideFieldPicker();
        getRecordComponent().saveRecord();
        quip.apps.getRootEntity().getSelectedRecord();
        this.updateToolbar(quip.apps.getRootEntity().getSelectedRecord());
    }

    reconnectAsMe_() {
        quip.apps.getRootEntity().fetchData();
        quip.apps
            .getRootEntity()
            .getSelectedRecord()
            .updateOwnerIdWithCurrentViewerId();
        this.updateToolbar(quip.apps.getRootEntity().getSelectedRecord());
    }

    executeMenuOption(menuCommand) {
        switch (menuCommand) {
            case "add-field":
                this.addField_();
                break;
            case "change-record":
                this.changeRecord_();
                break;
            case "save-data":
                this.saveData_();
                break;
            case "reconnect-as-me":
                this.reconnectAsMe_();
                break;
            default:
                break;
        }
    }
}
