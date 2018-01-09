// Copyright 2017 Quip

import {getRecordComponent, getRecordPickerComponent} from "./root.jsx";
import {BaseMenu} from "../../shared/base-field-builder/base-menu.js";

let selectedFieldEntity;

export class FieldBuilderMenu extends BaseMenu {
    promptLogin_(onLoggedIn) {
        if (quip.apps.getRootEntity().getClient().isLoggedIn()) {
            onLoggedIn();
        } else {
            quip.apps.getRootEntity().login(onLoggedIn);
        }
    }

    allMenuCommands() {
        return [
            {
                id: "refresh-record",
                label: "Refresh Now",
                handler: () => {
                    const selectedRecord = quip.apps
                        .getRootEntity()
                        .getSelectedRecord();
                    selectedRecord.reload();
                },
            },
            {
                id: "change-record",
                label: "Change Record…",
                handler: () => {
                    this.promptLogin_(() => {
                        getRecordPickerComponent().restoreToDefaultState();
                        getRecordPickerComponent().fetchData();
                        this.updateToolbar(
                            quip.apps.getRootEntity().getSelectedRecord());
                    });
                },
            },
            {
                id: "add-field",
                label: "Add Field",
                handler: () => {
                    this.promptLogin_(() => {
                        getRecordComponent().showFieldPicker();
                        quip.apps
                            .getRootEntity()
                            .getSelectedRecord()
                            .fetchData();
                        quip.apps
                            .getRootEntity()
                            .getSelectedRecord()
                            .updateOwnerIdWithCurrentViewerId();
                        this.updateToolbar(
                            quip.apps.getRootEntity().getSelectedRecord());
                    });
                },
            },
            {
                id: "save-data",
                label: "Save to Salesforce",
                quipIcon: quip.apps.MenuIcons.SYNCING,
                handler: () => {
                    this.promptLogin_(() => {
                        getRecordComponent().hideFieldPicker();
                        getRecordComponent().saveRecord();
                        quip.apps.getRootEntity().getSelectedRecord();
                        this.updateToolbar(
                            quip.apps.getRootEntity().getSelectedRecord());
                    });
                },
            },
            {
                id: "open-in-salesforce",
                label: "Open in Salesforce",
                handler: () => {
                    const selectedRecord = quip.apps
                        .getRootEntity()
                        .getSelectedRecord();
                    selectedRecord.openLink();
                },
            },
            {
                id: "reconnect-as-me",
                label: "Take Over…",
                handler: () => {
                    this.promptLogin_(() => {
                        quip.apps.getRootEntity().fetchData();
                        quip.apps
                            .getRootEntity()
                            .getSelectedRecord()
                            .updateOwnerIdWithCurrentViewerId();
                        this.updateToolbar(
                            quip.apps.getRootEntity().getSelectedRecord());
                    });
                },
            },
            {
                id: "logout",
                label: "Log Out",
                handler: () => {
                    quip.apps.getRootEntity().logout(() => {
                        this.updateToolbar(
                            quip.apps.getRootEntity().getSelectedRecord());
                    });
                },
            },
            {
                id: "revert-changes",
                label: "Discard Changes",
                handler: () => {
                    selectedFieldEntity.revertToOriginal();
                },
            },
            {
                id: "remove-field",
                label: "Hide Field",
                handler: () => {
                    selectedFieldEntity.remove();
                },
            },
            {
                id: "sync-field-edits",
                label: "Save to Salesforce",
                handler: () => {
                    //TODO
                },
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
            (quip.apps.isExplorerTemplate && quip.apps.isExplorerTemplate())) {
            disabledCommands.push("refresh-record");
            disabledCommands.push("change-record");
            disabledCommands.push("add-field");
            disabledCommands.push("save-data");
            disabledCommands.push("reconnect-as-me");
            disabledCommands.push("open-in-salesforce");
        } else {
            if (selectedRecord.isPlaceholder() ||
                (quip.apps.getViewingUser() !== null &&
                    selectedRecord.getOwnerId() ===
                        quip.apps.getViewingUser().getId())) {
                disabledCommands.push("reconnect-as-me");
            }
            if (!selectedRecord.isDirty() || selectedRecord.saveInProgress()) {
                disabledCommands.push("save-data");
            }
        }
        if (!quip.apps.getRootEntity().getClient().isLoggedIn()) {
            disabledCommands.push("logout");
        }
        return disabledCommands;
    }

    refreshToolbar() {
        quip.apps.updateToolbarCommandsState(this.getDisabledCommands_(), []);
    }

    updateToolbar(recordEntity) {
        const menuCommands = this.allMenuCommands();
        if (recordEntity.isPlaceholder()) {
            const highlightedCommandIds = [];
            const mainMenuSubCommands = [];
            if (quip.apps.getRootEntity().getClient().isLoggedIn()) {
                mainMenuSubCommands.push("current-instance");
                mainMenuSubCommands.push("logout");
                mainMenuSubCommands.push(
                    quip.apps.DocumentMenuCommands.SEPARATOR);

                const currentStatus = menuCommands.find(
                    menu => menu.id === "current-instance");
                if (currentStatus) {
                    currentStatus.label = quip.apps
                        .getRootEntity()
                        .getClient()
                        .getHostname();
                }
                const updatedMenuCommands = [
                    {
                        id: quip.apps.DocumentMenuCommands.MENU_MAIN,
                        subCommands: mainMenuSubCommands,
                    },
                ];
                if (quip.apps.getRootEntity().getClient().isLoggedIn()) {
                    updatedMenuCommands.push({
                        id: "current-instance",
                        label: quip.apps
                            .getRootEntity()
                            .getClient()
                            .getHostname(),
                        isHeader: true,
                    });
                }
                const allMenuCommands = [
                    ...updatedMenuCommands,
                    ...menuCommands,
                ];
                quip.apps.updateToolbar({
                    menuCommands: allMenuCommands,
                    highlightedCommandIds: highlightedCommandIds,
                });
            }
            return;
        }
        const syncingMenu = menuCommands.find(menu => menu.id === "save-data");
        if (syncingMenu) {
            syncingMenu.label = BaseMenu.getSyncingString(recordEntity);
        }
        const mainMenuSubCommands = [
            "record-header",
            "add-field",
            "change-record",
            "open-in-salesforce",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "last-updated-time",
            "refresh-record",
            "reconnect-as-me",
        ];
        if (quip.apps.getRootEntity().getClient().isLoggedIn()) {
            mainMenuSubCommands.push(quip.apps.DocumentMenuCommands.SEPARATOR);
            mainMenuSubCommands.push("current-instance");
            mainMenuSubCommands.push("logout");
        }

        let lastUpdatedLabel = BaseMenu.getLastUpdatedString(recordEntity);
        const recordOwner = recordEntity.getOwner();
        if (recordOwner !== null) {
            lastUpdatedLabel += " • Connected as " + recordOwner.getName();
        }

        const updatedMenuCommands = [
            {
                id: quip.apps.DocumentMenuCommands.MENU_MAIN,
                subCommands: mainMenuSubCommands,
            },
            {
                id: "record-header",
                label: recordEntity.getHeaderName(),
                isHeader: true,
            },
            {
                id: "last-updated-time",
                label: lastUpdatedLabel,
                isHeader: true,
            },
        ];

        if (quip.apps.getRootEntity().getClient().isLoggedIn()) {
            updatedMenuCommands.push({
                id: "current-instance",
                label: quip.apps.getRootEntity().getClient().getHostname(),
                isHeader: true,
            });
        }
        const allMenuCommands = [...updatedMenuCommands, ...menuCommands];
        quip.apps.updateToolbar({menuCommands: allMenuCommands});
    }
}
