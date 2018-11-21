// Copyright 2017 Quip

import {BaseMenu} from "../../shared/base-field-builder/base-menu.js";

let selectedFieldEntity;

export class JiraMenu extends BaseMenu {
    promptLogin_(onLoggedIn) {
        if (this.isLoggedIn()) {
            onLoggedIn();
        } else if (this.auth_) {
            this.auth_
                .login({
                    "instance_url": quip.apps.getRootRecord().getInstanceUrl(),
                })
                .then(() => {
                    onLoggedIn();
                })
                .catch(error => {});
        }
    }

    init(auth, client) {
        this.auth_ = auth;
        this.client_ = client;
    }

    setLogoutCallback(callback) {
        this.onLogout_ = callback;
    }

    setSelectedRecordNode(node) {
        this.selectedRecordNode_ =
            node != null ? node.getWrappedComponent() : null;
    }

    setRecordListNode(node) {
        this.recordListNode_ = node;
    }

    setClearRecordCallback(callback) {
        this.onClearRecord_ = callback;
    }

    setCurrentValueCallback(callback) {
        this.onCurrentValue_ = callback;
    }

    allMenuCommands() {
        let that = this;
        return [
            {
                id: "original-contents",
                label: quiptext("See Current Value…"),
                handler: () => {
                    this.onCurrentValue_(selectedFieldEntity);
                },
            },
            {
                id: "deleteColumn",
                label: quiptext("Delete Column"),
                handler: (name, context) => {
                    context[name]();
                    this.recordListNode_.clearGlobalError();
                    this.recordListNode_.clearAllRecordErrors();
                },
            },
            {
                id: "deleteRow",
                label: quiptext("Delete Row"),
                handler: (name, context) => {
                    const cell = context[name]();
                    const record = quip.apps.getRecordById(cell.contents.id);
                    const rootRecord = quip.apps.getRootRecord();
                    rootRecord.get("cachedRecords").move(record);
                    if (rootRecord.getRecords().length == 0) {
                        this.recordListNode_.clearGlobalError();
                        this.recordListNode_.clearAllRecordErrors();
                        this.onClearRecord_();
                        this.updateToolbar(null);
                    }
                },
            },
            {
                id: "refresh-record",
                label: quiptext("Refresh Now"),
                handler: () => {
                    this.promptLogin_(() => {
                        const rootRecord = quip.apps.getRootEntity();
                        const selectedRecord = rootRecord.getSelectedRecord();
                        const records = rootRecord.getRecords();
                        if (selectedRecord) {
                            selectedRecord.clearError();
                            selectedRecord
                                .reloadAndUpdateFields()
                                .then(response => {
                                    this.selectedRecordNode_.errorHandling(
                                        selectedRecord.getError());
                                })
                                .catch(error => {
                                    this.selectedRecordNode_.errorHandling(
                                        error);
                                });
                        } else if (records.length > 0) {
                            this.recordListNode_.clearGlobalError();
                            this.recordListNode_.clearAllRecordErrors();
                            const promises = [];
                            records.forEach(record => {
                                record.clearError();
                                const promise = record
                                    .reloadAndUpdateFields()
                                    .then(() => {
                                        this.recordListNode_.recordErrorHandling(
                                            record,
                                            record.getError());
                                    })
                                    .catch(error => {
                                        record.setError(error);
                                        this.recordListNode_.recordErrorHandling(
                                            record,
                                            error);
                                    });
                                promises.push(promise);
                            });
                            Promise.all(promises).then(() => {
                                this.recordListNode_.globalErrorHandling();
                            });
                        }
                    });
                },
            },
            {
                id: "open-link",
                label: quiptext("Open in Jira"),
                handler: (name, context) => {
                    const rootRecord = quip.apps.getRootEntity();
                    if (context) {
                        const value = context[name]();
                        const url = this.client_.getIssueUrl(value);
                        quip.apps.openLink(url);
                    } else if (rootRecord.getFilterId()) {
                        const url = this.client_.getFilterUrl(
                            rootRecord.getFilterId());
                        quip.apps.openLink(url);
                    } else if (rootRecord.getSelectedRecord()) {
                        rootRecord.getSelectedRecord().openLink();
                    }
                },
            },
            {
                id: "select-issues",
                label: quiptext("Select Issue(s)…"),
                handler: () => {
                    if (that.recordListNode_) {
                        that.recordListNode_.clearGlobalError();
                        that.recordListNode_.clearAllRecordErrors();
                    }
                    this.promptLogin_(() => {
                        this.onClearRecord_();
                        this.updateToolbar(null);
                    });
                },
            },
            {
                id: "add-column",
                label: quiptext("Add Column"),
                handler: () => {
                    this.promptLogin_(() => {
                        if (that.selectedRecordNode_) {
                            const rootRecord = quip.apps.getRootEntity();
                            const selectedRecord = rootRecord.getSelectedRecord();
                            if (!selectedRecord.isOwner()) {
                                const ownerId = quip.apps
                                    .getViewingUser()
                                    .getId();
                                rootRecord.setOwnerId(ownerId);
                                selectedRecord.setOwnerId(ownerId);
                                selectedRecord.reloadAndUpdateFields();
                            }
                            that.selectedRecordNode_.showFieldPicker();
                        } else {
                            that.recordListNode_.showFieldPicker();
                        }
                    });
                },
            },
            {
                id: "save-data",
                label: quiptext("Save to Jira"),
                quipIcon: quip.apps.MenuIcons.SYNCING,
                handler: () => {
                    this.promptLogin_(() => {
                        const selectedRecord = quip.apps
                            .getRootEntity()
                            .getSelectedRecord();
                        const records = quip.apps.getRootEntity().getRecords();
                        if (selectedRecord) {
                            that.selectedRecordNode_.hideFieldPicker();
                            selectedRecord
                                .save()
                                .then(response => {
                                    this.updateToolbar(selectedRecord);
                                    that.selectedRecordNode_.errorHandling(
                                        selectedRecord.getError());
                                })
                                .catch(error => {
                                    that.selectedRecordNode_.errorHandling(
                                        error);
                                    this.refreshToolbar();
                                });
                        } else {
                            that.recordListNode_.hideFieldPicker();
                            that.recordListNode_.clearGlobalError();
                            that.recordListNode_.clearAllRecordErrors();
                            let promises = [];
                            for (let record of records) {
                                const promise = record.save();
                                promises.push(promise);
                                promise
                                    .then(response => {
                                        this.updateToolbar(record);
                                        that.recordListNode_.recordErrorHandling(
                                            record,
                                            record.getError());
                                    })
                                    .catch(error => {
                                        that.recordListNode_.recordErrorHandling(
                                            record,
                                            error);
                                        this.refreshToolbar();
                                    });
                            }
                            Promise.all(promises).then(() => {
                                that.recordListNode_.globalErrorHandling();
                                this.updateToolbar(records[0]);
                                this.refreshToolbar();
                            });
                        }
                        this.updateToolbar(
                            selectedRecord ||
                                quip.apps.getRootEntity().getRecords()[0]);
                        this.refreshToolbar();
                    });
                },
            },
            {
                id: "revert-changes",
                label: quiptext("Revert Changes"),
                handler: () => {
                    selectedFieldEntity.revertToOriginal();
                },
            },
            {
                id: "remove-field",
                label: quiptext("Remove Field"),
                handler: () => {
                    selectedFieldEntity.remove();
                },
            },
            {
                id: "sync-field-edits",
                label: quiptext("Save to Jira"),
                handler: () => {
                    this.promptLogin_(() => {
                        selectedFieldEntity
                            .getParentRecord()
                            .save([selectedFieldEntity])
                            .then(() => {
                                this.updateToolbar(
                                    selectedFieldEntity.getParentRecord());
                                this.refreshToolbar();
                            })
                            .catch(error => {
                                this.updateToolbar(
                                    selectedFieldEntity.getParentRecord());
                                this.refreshToolbar();
                            });
                        this.updateToolbar(
                            selectedFieldEntity.getParentRecord());
                        this.refreshToolbar();
                    });
                },
            },
            {
                id: "reconnect-as-me",
                label: quiptext("Take Over…"),
                handler: () => {
                    this.promptLogin_(() => {
                        const rootRecord = quip.apps.getRootEntity();
                        const selectedRecord = rootRecord.getSelectedRecord();
                        const records = rootRecord.getRecords();
                        const ownerId = quip.apps.getViewingUser().getId();
                        rootRecord.setOwnerId(ownerId);
                        if (selectedRecord) {
                            selectedRecord.setOwnerId(ownerId);
                            selectedRecord.reloadAndUpdateFields();
                            this.updateToolbar(selectedRecord);
                        } else if (records.length > 0) {
                            records.forEach(record => {
                                record.setOwnerId(ownerId);
                                record.reloadAndUpdateFields();
                            });
                            this.updateToolbar(records[0]);
                        }
                    });
                },
            },
            {
                id: "logout",
                label: quiptext("Log Out"),
                handler: () => {
                    this.onLogout_();
                },
            },
        ];
    }

    showFieldContextMenu(e, button, fieldEntity) {
        const commands = ["remove-field"];
        selectedFieldEntity = fieldEntity;
        quip.apps.showContextMenuFromButton(button, commands);
    }

    showDraftContextMenu(e, button, fieldEntity) {
        selectedFieldEntity = fieldEntity;

        const disabledCommands = [];
        if (quip.apps.isExplorerTemplate && quip.apps.isExplorerTemplate()) {
            disabledCommands.push("sync-field-edits");
        }

        const commands = [
            "original-contents",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "sync-field-edits",
            "revert-changes",
        ];
        quip.apps.showContextMenuFromButton(
            button,
            commands,
            [],
            disabledCommands);
    }

    getDisabledCommands_() {
        const disabledCommands = [];
        const rootRecord = quip.apps.getRootEntity();
        const selectedRecord = rootRecord.getSelectedRecord();
        const records = rootRecord.getRecords();
        if (!selectedRecord &&
            records.length == 0 &&
            !rootRecord.getFilterId()) {
            disabledCommands.push("refresh-record");
            disabledCommands.push("open-link");
            disabledCommands.push("select-issues");
            disabledCommands.push("add-column");
            disabledCommands.push("save-data");
            disabledCommands.push("reconnect-as-me");
        } else if (selectedRecord) {
            if (!selectedRecord.isDirty() || selectedRecord.saveInProgress()) {
                disabledCommands.push("save-data");
            }
        } else if (records.length > 0) {
            let disable = false;
            let hasDirty = false;
            for (let record of records) {
                if (record.isDirty()) {
                    hasDirty = true;
                    if (record.saveInProgress()) {
                        disable = true;
                        break;
                    }
                }
            }
            if (disable || !hasDirty) {
                disabledCommands.push("save-data");
            }
            if (!rootRecord.getFilterId()) {
                disabledCommands.push("open-link");
            }
        } else {
            // Filter with no items.
            disabledCommands.push("add-column");
            disabledCommands.push("save-data");
        }

        if (quip.apps.isExplorerTemplate && quip.apps.isExplorerTemplate()) {
            disabledCommands.push("add-columns");
            disabledCommands.push("select-issues");
            disabledCommands.push("logout");
            disabledCommands.push("reconnect-as-me");
            disabledCommands.push("refresh-record");
            disabledCommands.push("save-data");
        } else {
            if (rootRecord.isOwner()) {
                disabledCommands.push("reconnect-as-me");
            }
            if (!this.isLoggedIn()) {
                disabledCommands.push("logout");
            }
            if (quip.apps.isMobile()) {
                disabledCommands.push("select-issues");
            }
        }

        return disabledCommands;
    }

    isLoggedIn() {
        return (
            this.auth_ &&
            this.auth_.isLoggedIn() &&
            (this.auth_.getTokenResponseParam("instance_url") ===
                quip.apps.getRootRecord().getInstanceUrl() ||
                this.auth_.getTokenResponseParam("instance_url") ===
                    quip.apps.getRootRecord().getAlternativeOAuthBaseUrl())
        );
    }

    refreshToolbar() {
        quip.apps.updateToolbarCommandsState(this.getDisabledCommands_(), []);
    }

    getInterestingRecord(records) {
        let selectedRecord;
        records.forEach(record => {
            // Determines which record to use to display the save string.
            if (!selectedRecord) {
                selectedRecord = record;
            } else if (record.saveInProgress()) {
                selectedRecord = record;
            } else if (record.isDirty() && !selectedRecord.saveInProgress()) {
                selectedRecord = record;
            } else if (record.getLastFetchedTime() >
                    selectedRecord.getLastFetchedTime() &&
                !selectedRecord.isDirty() &&
                !selectedRecord.saveInProgress) {
                selectedRecord = record;
            }
        });
        return selectedRecord;
    }

    updateToolbar(recordEntity) {
        const menuCommands = this.allMenuCommands();
        const rootRecord = quip.apps.getRootEntity();

        let headerName;
        let lastUpdatedRecord;
        let lastUpdatedString;
        let syncingLabel = quiptext("Save to Jira");
        let addColumnLabel = quiptext("Edit Columns");
        if (rootRecord.getFilterId()) {
            headerName = rootRecord.get("filterName");
            lastUpdatedString = BaseMenu.getLastUpdatedStringFromTime(
                rootRecord.get("filterLastFetchedTime"));
            const interestingRecord = this.getInterestingRecord(
                rootRecord.getRecords());
            lastUpdatedRecord = interestingRecord;
            syncingLabel = interestingRecord
                ? BaseMenu.getSyncingString(interestingRecord)
                : syncingLabel;
        } else if (rootRecord.getRecords().length > 0) {
            headerName = rootRecord.getRecords().reduce((text, record) => {
                if (text.length > 0) {
                    text = text.concat(", ");
                }
                return text.concat(record.getFieldData("key").value);
            }, "");
            const interestingRecord = this.getInterestingRecord(
                rootRecord.getRecords());
            lastUpdatedRecord = interestingRecord;
            lastUpdatedString = BaseMenu.getLastUpdatedString(
                interestingRecord);
            syncingLabel = BaseMenu.getSyncingString(interestingRecord);
        } else if (recordEntity) {
            headerName = recordEntity.getHeaderName();
            lastUpdatedString = BaseMenu.getLastUpdatedString(recordEntity);
            lastUpdatedRecord = recordEntity;
            syncingLabel = BaseMenu.getSyncingString(recordEntity);
            addColumnLabel = quiptext("Add Field");
        }

        // Add owner to updated label.
        if (lastUpdatedRecord) {
            const recordOwner = lastUpdatedRecord.getOwner();
            if (recordOwner !== null) {
                lastUpdatedString +=
                    " • " +
                    quiptext("Connected as %(name)s", {
                        "name": recordOwner.getName(),
                    });
            }
        }

        const syncingMenu = menuCommands.find(menu => menu.id === "save-data");
        if (syncingMenu) {
            syncingMenu.label = syncingLabel;
        }

        const addColumnMenu = menuCommands.find(
            menu => menu.id === "add-column");
        if (addColumnMenu) {
            addColumnMenu.label = addColumnLabel;
        }

        const subMenuCommands = [];
        if ((recordEntity && !recordEntity.isPlaceholder()) ||
            rootRecord.getFilterId()) {
            subMenuCommands.push("record-header");
            subMenuCommands.push("add-column");
            subMenuCommands.push("open-link");
            subMenuCommands.push("select-issues");
            subMenuCommands.push(quip.apps.DocumentMenuCommands.SEPARATOR);
            subMenuCommands.push("last-updated-time");
            subMenuCommands.push("refresh-record");
            subMenuCommands.push("reconnect-as-me");
            subMenuCommands.push(quip.apps.DocumentMenuCommands.SEPARATOR);
        }

        if (rootRecord.getInstanceUrl()) {
            subMenuCommands.push("current-instance");
        }
        subMenuCommands.push("logout");

        const updatedMenuCommands = [
            {
                id: "record-header",
                label: headerName,
                isHeader: true,
            },
            {
                id: "last-updated-time",
                label: lastUpdatedString,
                isHeader: true,
            },
        ];

        if (quip.apps.getRootEntity().getInstanceUrl()) {
            updatedMenuCommands.push({
                id: "current-instance",
                label: quip.apps.getRootEntity().getInstanceUrl(),
                isHeader: true,
            });
        }

        updatedMenuCommands.push({
            id: quip.apps.DocumentMenuCommands.MENU_MAIN,
            subCommands: subMenuCommands,
        });
        const allMenuCommands = [...updatedMenuCommands, ...menuCommands];
        quip.apps.updateToolbar({menuCommands: allMenuCommands});
    }
}
