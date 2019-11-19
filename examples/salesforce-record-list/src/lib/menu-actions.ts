// Copyright 2019 Quip

/**
 * @fileoverview Menu Actions are created at runtime based on a root record in
 * our Main component (since they can call actions on the main component and
 * trigger methods there). However, the menu is created before this component
 * and passed into it. This file is used as an in-memory lookup for menu actions
 * that may not exist yet but are guaranteed to exist at runtime.
 */

const err = (name: string) => () => {
    throw new Error(`Action not implemented: ${name}`);
};
export interface MenuActions {
    save: () => Promise<void>;
    refreshList: () => Promise<void>;
    openInSalesforce: () => void;
    showListPicker: () => void;
    showManageColumns: () => void;
    resetData: () => void;
    logout: () => Promise<void>;
    login: () => Promise<void>;
    toggleCommenting: () => void;
    hideColumn: (colName: string) => void;
    toggleTruncateContent: () => void;
    toggleSandbox: () => void;
}
const menuActions: MenuActions = {
    save: err("save"),
    refreshList: err("refreshList"),
    openInSalesforce: err("openInSalesforce"),
    showListPicker: err("showListPicker"),
    showManageColumns: err("showManageColumns"),
    resetData: err("resetData"),
    logout: err("logout"),
    login: err("login"),
    toggleCommenting: err("toggleCommenting"),
    hideColumn: err("hideColumn"),
    toggleTruncateContent: err("toggleTruncateContent"),
    toggleSandbox: err("toggleSandbox"),
};
export default menuActions;
