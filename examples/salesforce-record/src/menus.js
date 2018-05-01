// Copyright 2017 Quip

import {getRecordComponent, getRecordPickerComponent} from "./root.jsx";
import {BaseMenu} from "../../shared/base-field-builder/base-menu.js";

let selectedFieldEntity;
let isLogoutInProgress_ = false;

export class FieldBuilderMenu extends BaseMenu {
    promptLogin_(onLoggedIn, onMismatchedInstance, onLoggedInFailed) {
        if (quip.apps
                .getRootEntity()
                .getClient()
                .isLoggedIn() &&
            quip.apps
                .getRootEntity()
                .getClient()
                .onSourceInstance()) {
            onLoggedIn();
        } else {
            quip.apps
                .getRootEntity()
                .login(onLoggedIn, onMismatchedInstance, onLoggedInFailed);
        }
    }

    allMenuCommands() {
        return [
            {
                id: "refresh-record",
                label: quiptext("Refresh Now"),
                handler: () => {
                    this.promptLogin_(
                        () => {
                            this.refreshRecord_();
                        },
                        () => {
                            getRecordPickerComponent().showMismatchedInstanceErrorDialog(
                                "refresh-record");
                        });
                },
            },
            {
                id: "change-record",
                label: quiptext("Change Record…"),
                handler: () => {
                    this.promptLogin_(
                        () => {
                            this.changeRecord_();
                        },
                        () => {
                            getRecordPickerComponent().showMismatchedInstanceErrorDialog(
                                "change-record");
                        });
                },
            },
            {
                id: "add-field",
                label: quiptext("Add Field"),
                handler: () => {
                    this.promptLogin_(
                        () => {
                            this.addField_();
                        },
                        () => {
                            getRecordPickerComponent().showMismatchedInstanceErrorDialog(
                                "add-field");
                        });
                },
            },
            {
                id: "save-data",
                label: quiptext("Save to Salesforce"),
                quipIcon: quip.apps.MenuIcons.SYNCING,
                handler: () => {
                    this.promptLogin_(
                        () => {
                            this.saveData_();
                        },
                        () => {
                            getRecordPickerComponent().showMismatchedInstanceErrorDialog(
                                "save-data");
                        });
                },
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
                handler: () => {
                    this.promptLogin_(
                        () => {
                            this.reconnectAsMe_();
                        },
                        () => {
                            getRecordPickerComponent().showMismatchedInstanceErrorDialog(
                                "reconnect-as-me");
                        });
                },
            },
            {
                id: "logout",
                label: quiptext("Log Out"),
                handler: () => {
                    isLogoutInProgress_ = true;
                    this.refreshToolbar();
                    quip.apps.getRootEntity().logout(() => {
                        isLogoutInProgress_ = false;
                        quip.apps.getRootEntity().clearCachedData();
                        this.updateToolbar(
                            quip.apps.getRootEntity().getSelectedRecord());
                        this.refreshToolbar();
                    });
                },
            },
            {
                id: "revert-changes",
                label: quiptext("Discard Changes"),
                handler: () => {
                    selectedFieldEntity.revertToOriginal();
                },
            },
            {
                id: "remove-field",
                label: quiptext("Hide Field"),
                handler: () => {
                    selectedFieldEntity.remove();
                },
            },
            {
                id: "sync-field-edits",
                label: quiptext("Save to Salesforce"),
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

    refreshToolbar() {
        quip.apps.updateToolbarCommandsState(this.getDisabledCommands_(), []);
    }

    updateToolbar(recordEntity) {
        const menuCommands = this.allMenuCommands();
        if (recordEntity.isPlaceholder()) {
            const highlightedCommandIds = [];
            const mainMenuSubCommands = [];
            if (quip.apps
                    .getRootEntity()
                    .getClient()
                    .isLoggedIn()) {
                mainMenuSubCommands.push("current-instance");
                mainMenuSubCommands.push("logout");
                mainMenuSubCommands.push(
                    quip.apps.DocumentMenuCommands.SEPARATOR);

                const updatedMenuCommands = [
                    {
                        id: quip.apps.DocumentMenuCommands.MENU_MAIN,
                        subCommands: mainMenuSubCommands,
                    },
                ];
                updatedMenuCommands.push({
                    id: "current-instance",
                    label: quip.apps
                        .getRootEntity()
                        .getClient()
                        .getHostname(),
                    isHeader: true,
                });
                const allMenuCommands = [
                    ...updatedMenuCommands,
                    ...menuCommands,
                ];
                quip.apps.updateToolbar({
                    menuCommands: allMenuCommands,
                    highlightedCommandIds: highlightedCommandIds,
                });
            } else {
                const updatedMenuCommands = [
                    {
                        id: quip.apps.DocumentMenuCommands.MENU_MAIN,
                        subCommands: ["logout"],
                    },
                ];
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
        ];
        if (quip.apps
                .getRootEntity()
                .getClient()
                .isLoggedIn()) {
            mainMenuSubCommands.push(quip.apps.DocumentMenuCommands.SEPARATOR);
            mainMenuSubCommands.push("current-instance");
            mainMenuSubCommands.push("logout");
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

        if (quip.apps
                .getRootEntity()
                .getClient()
                .isLoggedIn()) {
            updatedMenuCommands.push({
                id: "current-instance",
                label: quip.apps
                    .getRootEntity()
                    .getClient()
                    .getHostname(),
                isHeader: true,
            });
        }
        const allMenuCommands = [...updatedMenuCommands, ...menuCommands];
        quip.apps.updateToolbar({menuCommands: allMenuCommands});
    }

    refreshRecord_() {
        const selectedRecord = quip.apps.getRootEntity().getSelectedRecord();
        if (selectedRecord) {
            this.promptLogin_(() => {
                selectedRecord.reload();
            });
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
