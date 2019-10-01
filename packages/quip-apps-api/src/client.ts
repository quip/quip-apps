// Copyright 2019 Quip
import pkg from "../package.json";
import Blob from "./blob";
import RootRecord from "./root-record";
import Preferences from "./preferences";
import User from "./user";

export default class Client {
    constructor() {
        // In production, these values will be dynamic. In this mock, they will
        // be whatever you set them to. You can set these values by setting them
        // directly on quip.apps.values[valueName].
        const viewingUser = new User();
        viewingUser.values.id = "mock-viewing-user";
        this.values = {
            auths: {},
            blobs: {},
            boundingClientRect: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                x: 0,
                y: 0,
                width: 800,
                height: 400,
            },
            configParams: {},
            containerWidth: 800,
            currentDimensions: {width: 800, height: 400},
            dateToPick: new Date().getTime(),
            displayWidth: 800,
            documentMembers: [],
            elementHtml: "",
            focusedRichTextRecord: null,
            isAndroid: false,
            isApiVersionAtLeast: true,
            isAppFocused: true,
            isDocumentEditable: true,
            isElementFocused: true,
            isExplorerTemplate: false,
            isIOs: false,
            isMac: true,
            isMobile: false,
            isOnline: true,
            isViewerLoggedIn: true,
            isViewerSiteAdmin: false,
            isWindows: false,
            peopleToSearchFor: [],
            quipAppId: "mock-app-id",
            quipAppVersionNumber: 0,
            quipElementId: "mock-element-id",
            recordLists: {},
            records: {},
            rootRecordId: "mock-root-record-id",
            selectedRecord: null,
            shouldFillContainer: false,
            sitePreferences: new Preferences(),
            threadId: "mock-thread-id",
            userPreferences: new Preferences(),
            users: {
                "mock-viewing-user": viewingUser,
            },
            usersToPick: [],
            viewerCanSeeComments: false,
            viewingUser,
            viewportDimensions: {width: 1200, height: 800},
            width: 800,
        };
    }
    addDetachedNode() {}
    addDraggableNode() {}
    addEventListener() {}
    addWhitelistedUser() {}
    auth(name) {
        return this.values.auths[name];
    }
    clearEmbeddedIframe() {}
    createBlobFromData() {
        return new Blob();
    }
    deleteApp() {}
    deleteElement() {}
    disableResizing() {}
    dismissBackdrop() {}
    enableResizing() {}
    fetchElementHtml() {
        return this.values.elementHtml;
    }
    forceUpdateDimensions() {}
    getApiVersion() {
        return `MOCK-${pkg.version}`;
    }
    getBlobById(id) {
        return this.values.blobs[id];
    }
    getBoundingClientRect() {
        return this.values.boundingClientRect;
    }
    getConfigParam(p) {
        return this.values.configParams[p];
    }
    getConfigParams() {
        return this.values.configParams;
    }
    getContainerWidth() {
        return 800;
    }
    getCurrentDimensions() {
        return this.values.currentDimensions;
    }
    getDisplayWidth() {
        return 800;
    }
    getDocumentMembers() {
        return this.values.documentMembers;
    }
    getFocusedRichTextRecord() {
        return this.values.focusedRichTextRecord;
    }
    getQuipAppId() {
        return this.values.quipAppId;
    }
    getQuipAppVersionNumber() {
        return this.values.quipAppVersionNumber;
    }
    getQuipElementId() {
        return this.values.quipElementId;
    }
    getRecordById(id) {
        return this.values.records[id];
    }
    getRecordListById(id) {
        return this.values.recordLists[id];
    }
    getRootEntity() {
        return this.getRootRecord();
    }
    getRootRecord() {
        return this.rootRecord_;
    }
    getRootRecordId() {
        return this.values.rootRecordId;
    }
    getSelectedRecord() {
        return this.values.selectedRecord;
    }
    getSitePreferences() {
        return this.values.sitePreferences;
    }
    getThreadId() {
        return this.values.threadId;
    }
    getUserById(id) {
        return this.values.users[id];
    }
    getUserPreferences() {
        return this.values.userPreferences;
    }
    getViewingUser() {
        return this.values.viewingUser;
    }
    getViewportDimensions() {
        return this.values.viewportDimensions;
    }
    getWidth() {
        return this.values.width;
    }
    initialize() {}
    isAndroid() {
        return this.values.isAndroid;
    }
    isApiVersionAtLeast() {
        return this.values.isApiVersionAtLeast;
    }
    isAppFocused() {
        return this.values.isAppFocused;
    }
    isDocumentEditable() {
        return this.values.isDocumentEditable;
    }
    isElementFocused() {
        return this.values.isElementFocused;
    }
    isExplorerTemplate() {
        return this.values.isExplorerTemplate;
    }
    isIOs() {
        return this.values.isIOs;
    }
    isMac() {
        return this.values.isMac;
    }
    isMobile() {
        return this.values.isMobile;
    }
    isOnline() {
        return this.values.isOnline;
    }
    isViewerLoggedIn() {
        return this.values.isViewerLoggedIn;
    }
    isViewerSiteAdmin() {
        return this.values.isViewerSiteAdmin;
    }
    isWindows() {
        return this.values.isWindows;
    }
    navigateToNextDocumentSection() {}
    navigateToPreviousDocumentSection() {}
    openLink() {}
    pickDate(callback) {
        callback(this.dateToPick);
    }
    pickUsers(callback) {
        callback(this.usersToPick);
    }
    recordQuipMetric() {}
    registerClass(Class, id) {
        if (Class instanceof RootRecord) {
            if (this.rootRecord_) {
                throw new Error("Cannot register multiple root records");
            }
            this.rootRecord_ = new Class();
        }
    }
    registerEmbeddedIframe() {}
    removeDetachedNode() {}
    removeDraggableNode() {}
    removeEventListener() {}
    searchPeople(callback) {
        callback(this.peopleToSearchFor);
    }
    sendMessage() {}
    setSelectedEntity(record) {
        this.setSelectedRecord(record);
    }
    setSelectedRecord(record) {
        this.values.selectedRecord = record;
    }
    setWidth(width) {
        this.values.width = width;
    }
    setWidthAndAspectRatio(width, aspectRatio) {
        this.setWidth(width);
    }
    shouldFillContainer() {
        return this.values.shouldFillContainer;
    }
    showBackdrop() {}
    showComments() {}
    showContextMenu() {}
    showContextMenuFromButton() {}
    showFilePicker() {}
    startDisplayingAboveMenus() {}
    stopDisplayingAboveMenus() {}
    updateDisplayDimensions() {}
    updateToolbar() {}
    updateToolbarCommandsState() {}
    uploadFile(blob, onFilesUploaded) {
        onFilesUploaded({
            success: false,
            filePb: undefined,
            thumbnailFilePbs: undefined,
        });
    }
    viewerCanSeeComments() {
        return this.values.viewerCanSeeComments;
    }
}

Client.CreationSource = {
    INSERT: 1,
    COPY_DOCUMENT: 2,
    PASTE: 3,
    TEMPLATE: 4,
};

Client.DocumentMenuActions = {SHOW_FILE_PICKER: 1};

Client.DocumentMenuCommands = {
    SEPARATOR: 1,
    MENU_MAIN: 2,
    COPY_ANCHOR_LINK: 3,
    CUT_ELEMENT: 4,
    COPY_ELEMENT: 5,
    DELETE_ELEMENT: 6,
    DELETE_APP: 7,
};

Client.EventType = {
    ELEMENT_BLUR: 1,
    BLUR: 2,
    DOCUMENT_THEME_UPDATE: 3,
    CONTAINER_SIZE_UPDATE: 4,
    WINDOW_SIZE_UPDATE: 5,
    DOCUMENT_SIZE_UPDATE: 6,
    USER_PREFERENCE_UPDATE: 7,
    SITE_PREFERENCE_UPDATE: 8,
    ELEMENT_FOCUS: 9,
    FOCUS: 10,
    DOCUMENT_MEMBERS_LOADED: 11,
    WHITELISTED_USERS_LOADED: 12,
    DOCUMENT_EDITABLE_CHANGED: 13,
    ONLINE_STATUS_CHANGED: 14,
    WIDTH_UPDATE: 15,
};

Client.MenuIcons = {
    COMMENT_INLINE: 1,
    FULL_SCREEN: 2,
    CROP: 3,
    SALESFORCE_LOGO: 4,
    SYNCING: 5,
    JIRA: 6,
};

Client.RootEntityConstructor = class {};
