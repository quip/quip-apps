import {ReactNode} from "react";
import Auth from "./auth";
import ClientBlob from "./blob";
import Preferences from "./preferences";
import Record, {RecordConstructor} from "./record";
import RecordList from "./record-list";
import RichTextRecord from "./rich-text-record";
import RootRecord from "./root-record";
import User from "./user";

interface ResizingOptions {
    minWidth?: number;
    minHeight?: number;
    maintainAspectRatio?: boolean;
    listener?: (width: number, height: number) => void;
}

export interface InitializationParameters {
    isCreation: boolean;
    creationUrl?: string;
    initOptions?: string;
    initOptionsSource?: string;
    creationBlobs?: Blob[];
    creationSource: CreationSource;
}

export interface BlobWithThumbnails {
    blob: ClientBlob;
    thumbnails?: Array<ClientBlob>;
}

enum QuipIcon {
    COMMENT_INLINE = 1,
    FULL_SCREEN = 2,
    CROP = 3,
    SALESFORCE_LOGO = 4,
    SYNCING = 5,
    IMAGE = 6,
    CALENDAR = 7,
    PROCESS_BAR = 8,
    KANBAN = 9,
    POLL = 10,
    COUNTDOWN = 11,
    PROJECT_TRACKER = 12,
    JIRA = 13,
    COMMENT_MENU_ITEM = 14,
}

export interface MenuCommand {
    id: string;
    label?: string | ReactNode[];
    sublabel?: string;
    // TODO: unsure what this type actually is
    handler?: (command: string, params: Object) => void;
    isHeader?: boolean;
    subCommands?: string[];
    actionId?: string;
    actionParams?: Object;
    actionStarted?: () => void;
    quipIcon?: QuipIcon | MenuIcons;
}

export interface ToolbarState {
    menuCommands?: MenuCommand[];
    toolbarCommandIds?: string[];
    disabledCommandIds?: string[];
    highlightedCommandIds?: string[];
    destructiveCommandIds?: string[];
    mobileToolbarCommandIds?: string[];
}

export interface InitOptions {
    menuCommands?: MenuCommand[];
    toolbarCommandIds?: string[] | undefined;
    mobileToolbarCommandIds?: string[] | undefined;
    toolbarState?: ToolbarState;
    destructiveCommandIds?: string[] | undefined;
    initializationCallback?: (
        element: Element,
        parameters: InitializationParameters
    ) => void;
}

export enum CreationSource {
    INSERT = "INSERT",
    COPY_DOCUMENT = "COPY_DOCUMENT",
    PASTE = "PASTE",
    TEMPLATE = "TEMPLATE",
}

export enum DocumentMenuActions {
    SHOW_FILE_PICKER = "SHOW_FILE_PICKER",
}

export enum DocumentMenuCommands {
    SEPARATOR = "SEPARATOR",
    MENU_MAIN = "MENU_MAIN",
    MOBILE_TOOLBAR_SECONDARY_MENU = "MOBILE_TOOLBAR_SECONDARY_MENU",
    MOBILE_TOOLBAR_TERTIARY_MENU = "MOBILE_TOOLBAR_TERTIARY_MENU",
    COPY_ANCHOR_LINK = "COPY_ANCHOR_LINK",
    CUT_ELEMENT = "CUT_ELEMENT",
    COPY_ELEMENT = "COPY_ELEMENT",
    DELETE_ELEMENT = "DELETE_ELEMENT",
    DELETE_APP = "DELETE_APP",
}

export enum EventType {
    ELEMENT_BLUR = "ELEMENT_BLUR",
    BLUR = "BLUR",
    DOCUMENT_THEME_UPDATE = "DOCUMENT_THEME_UPDATE",
    CONTAINER_SIZE_UPDATE = "CONTAINER_SIZE_UPDATE",
    WINDOW_SIZE_UPDATE = "WINDOW_SIZE_UPDATE",
    DOCUMENT_SIZE_UPDATE = "DOCUMENT_SIZE_UPDATE",
    USER_PREFERENCE_UPDATE = "USER_PREFERENCE_UPDATE",
    SITE_PREFERENCE_UPDATE = "SITE_PREFERENCE_UPDATE",
    ELEMENT_FOCUS = "ELEMENT_FOCUS",
    FOCUS = "FOCUS",
    DOCUMENT_MEMBERS_LOADED = "DOCUMENT_MEMBERS_LOADED",
    ALLOWLISTED_USERS_LOADED = "ALLOWLISTED_USERS_LOADED",
    DOCUMENT_EDITABLE_CHANGED = "DOCUMENT_EDITABLE_CHANGED",
    ONLINE_STATUS_CHANGED = "ONLINE_STATUS_CHANGED",
    WIDTH_UPDATE = "WIDTH_UPDATE",
    THREAD_MEMBERSHIP_CHANGED = "THREAD_MEMBERSHIP_CHANGED",
}

export enum MenuIcons {
    COMMENT_INLINE = "COMMENT_INLINE",
    FULL_SCREEN = "FULL_SCREEN",
    CROP = "CROP",
    SALESFORCE_LOGO = "SALESFORCE_LOGO",
    SYNCING = "SYNCING",
    JIRA = "JIRA",
    COMMENT_MENU_ITEM = "COMMENT_MENU_ITEM",
}

export const RootEntityConstructor = class {};

export default class Client {
    public authsValue: {[name: string]: Auth} = {};
    public blobsValue: {[id: string]: ClientBlob} = {};
    public boundingClientRectValue: {
        leftValue: number;
        topValue: number;
        rightValue: number;
        bottomValue: number;
        xValue: number;
        yValue: number;
        widthValue: number;
        heightValue: number;
    } = {
        leftValue: 0,
        topValue: 0,
        rightValue: 0,
        bottomValue: 0,
        xValue: 0,
        yValue: 0,
        widthValue: 800,
        heightValue: 400,
    };
    public configParamsValue: {[key: string]: any} = {};
    public containerWidthValue: number = 800;
    public currentDimensionsValue: {widthValue: number; heightValue: number} = {
        widthValue: 800,
        heightValue: 400,
    };
    public dateToPickValue: number = new Date().getTime();
    public displayWidthValue: number = 800;
    public documentMembersValue: User[] = [];
    public elementHtmlValue: string = "";
    public focusedRichTextRecordValue?: RichTextRecord;
    public isAndroidValue: boolean = false;
    public isApiVersionAtLeastValue: boolean = true;
    public isAppFocusedValue: boolean = true;
    public isDocumentEditableValue: boolean = true;
    public isThreadMemberValue: boolean = true;
    public isElementFocusedValue: boolean = true;
    public isExplorerTemplateValue: boolean = false;
    public isIOsValue: boolean = false;
    public isMacValue: boolean = true;
    public isMobileValue: boolean = false;
    public isOnlineValue: boolean = true;
    public isViewerLoggedInValue: boolean = true;
    public isViewerSiteAdminValue: boolean = false;
    public isWindowsValue: boolean = false;
    // TODO: improve type
    public peopleToSearchForValue: any[] = [];
    public quipAppIdValue: string = "mock-app-id";
    public quipAppVersionNumberValue: number = 0;
    public quipElementIdValue: string = "mock-element-id";
    public recordListsValue: {[id: string]: RecordList<any>} = {};
    public recordsValue: {[id: string]: Record} = {};
    public rootRecordIdValue: string = "mock-root-record-id";
    public selectedRecordValue?: Record;
    public shouldFillContainerValue: boolean = false;
    public sitePreferencesValue: Preferences = new Preferences();
    public threadIdValue?: string;
    public userPreferencesValue: Preferences = new Preferences();
    public usersValue: {[id: string]: User} = {};
    public viewerCanSeeCommentsValue: boolean = false;
    public viewingUserValue?: User;
    public viewportDimensionsValue: {
        widthValue: number;
        heightValue: number;
    } = {widthValue: 1200, heightValue: 800};
    public widthValue: number = 800;

    private rootRecord_?: RootRecord;

    private version_: string = "UNSET";

    constructor(
        elementConfigId: string,
        elementId: string,
        elementLocalId: string,
        window?: Window,
        bridgeToken?: string
    ) {
        // In production, these values will be dynamic. In this mock, they will
        // be whatever you set them to. You can set these values by setting them
        // directly on quip.apps.values[valueName].
        const viewingUser = new User();
        viewingUser.idValue = "mock-viewing-user";
        this.usersValue[viewingUser.id()] = viewingUser;
        this.viewingUserValue = viewingUser;
        this.documentMembersValue.push(viewingUser);
    }

    setVersion(version: string) {
        this.version_ = version;
    }

    addDetachedNode(node: Node) {}
    addDraggableNode(node: Node) {}
    addEventListener(type: EventType, listener: () => void) {}
    addAllowlistedlistedUser(userId: string) {}
    auth(name: string) {
        return this.authsValue[name];
    }
    clearEmbeddedIframe() {}
    createBlobFromData(data: ArrayBuffer, filename?: string): ClientBlob {
        return new ClientBlob();
    }
    deleteApp() {}
    deleteElement() {}
    disableResizing() {}
    dismissBackdrop(skipCallback?: boolean) {}
    enableResizing(options: ResizingOptions) {}
    exitApp() {}
    fetchElementHtml(styleId: number = 0, styleIdSuffix: string = "") {
        return this.elementHtmlValue;
    }
    forceUpdateDimensions() {}
    getApiVersion() {
        return `MOCK-${this.version_}`;
    }
    getBlobById(id: string) {
        return this.blobsValue[id];
    }
    getBoundingClientRect() {
        return this.boundingClientRectValue;
    }
    getConfigParam(p: string) {
        return this.configParamsValue[p];
    }
    getConfigParams() {
        return this.configParamsValue;
    }
    getContainerWidth() {
        return 800;
    }
    getCurrentDimensions() {
        return this.currentDimensionsValue;
    }
    getDisplayWidth() {
        return 800;
    }
    getDocumentMembers() {
        return this.documentMembersValue;
    }
    getFocusedRichTextRecord() {
        return this.focusedRichTextRecordValue;
    }
    getQuipAppId() {
        return this.quipAppIdValue;
    }
    getQuipAppVersionNumber() {
        return this.quipAppVersionNumberValue;
    }
    getQuipElementId() {
        return this.quipElementIdValue;
    }
    getRecordById(id: string) {
        return this.recordsValue[id];
    }
    getRecordListById(id: string) {
        return this.recordListsValue[id];
    }
    getRootEntity() {
        return this.getRootRecord();
    }
    getRootRecord(): RootRecord {
        if (!this.rootRecord_) {
            throw new Error(
                "calls to getRootRecord() before root record is registered are not allowed."
            );
        }
        return this.rootRecord_;
    }
    getRootRecordId() {
        return this.rootRecordIdValue;
    }
    getSelectedRecord() {
        return this.selectedRecordValue;
    }
    getSitePreferences() {
        return this.sitePreferencesValue;
    }
    getThreadId() {
        return this.threadIdValue;
    }
    getUserById(id: string) {
        return this.usersValue[id];
    }
    getUserPreferences() {
        return this.userPreferencesValue;
    }
    getViewingUser() {
        return this.viewingUserValue;
    }
    getViewportDimensions() {
        return this.viewportDimensionsValue;
    }
    getWidth() {
        return this.widthValue;
    }
    initialize(options: InitOptions) {}
    isAndroid() {
        return this.isAndroidValue;
    }
    isApiVersionAtLeast(minVersion: string) {
        return this.isApiVersionAtLeastValue;
    }
    isAppFocused() {
        return this.isAppFocusedValue;
    }
    isDocumentEditable() {
        return this.isDocumentEditableValue;
    }
    isThreadMember() {
        return this.isThreadMemberValue;
    }
    isElementFocused() {
        return this.isElementFocusedValue;
    }
    isExplorerTemplate() {
        return this.isExplorerTemplateValue;
    }
    isIOs() {
        return this.isIOsValue;
    }
    isMac() {
        return this.isMacValue;
    }
    isMobile() {
        return this.isMobileValue;
    }
    isOnline() {
        return this.isOnlineValue;
    }
    isViewerLoggedIn() {
        return this.isViewerLoggedInValue;
    }
    isViewerSiteAdmin() {
        return this.isViewerSiteAdminValue;
    }
    isWindows() {
        return this.isWindowsValue;
    }
    navigateToNextDocumentSection(createSection?: boolean) {}
    navigateToPreviousDocumentSection(createSection?: boolean) {}
    openLink(url: string) {}
    pickDate(
        callback: (dateMs: number) => void,
        options?: {
            initialDateMs?: number;
            anchor?: Element;
            offsetX?: number;
            offsetY?: number;
        }
    ) {
        callback(this.dateToPickValue);
    }
    pickUsers(
        callback: () => void,
        options?: {anchor?: Element; offsetX?: number; offsetY?: number}
    ) {
        callback();
    }
    recordQuipMetric(name: string, extra: {[key: string]: string}) {}
    registerClass(Class: RecordConstructor, id: string) {
        if (Class instanceof RootRecord) {
            if (this.rootRecord_) {
                throw new Error("Cannot register multiple root records");
            }
            this.rootRecord_ = new Class();
        }
    }
    registerEmbeddedIframe(node: Node) {}
    removeDetachedNode(node: Node) {}
    removeDraggableNode(node: Node) {}
    removeEventListener(type: EventType, listener: () => void) {}
    searchPeople(searchString: string, callback: (users: User[]) => void) {
        callback(this.peopleToSearchForValue);
    }
    sendMessage(text: string, mentionIds: string[]) {}
    setPayload(payload: string) {}
    setSelectedEntity(record: Record) {
        this.setSelectedRecord(record);
    }
    setSelectedRecord(record: Record) {
        this.selectedRecordValue = record;
    }
    setWidth(width: number) {
        this.widthValue = width;
    }
    setWidthAndAspectRatio(width: number, aspectRatio?: number) {
        this.setWidth(width);
    }
    shouldFillContainer() {
        return this.shouldFillContainerValue;
    }
    showBackdrop(onDismiss: () => void) {}
    showComments(recordId: string) {}
    showContextMenu(
        event: Event,
        commandIds: string[],
        highlightedCommands?: string[],
        disabledCommandIds?: string[],
        onDismiss?: () => void,
        contextArg?: Object
    ) {}
    showContextMenuFromButton(
        button: Element,
        commandIds: string[],
        highlightedCommands?: string[],
        disabledCommandIds?: string[],
        onDismiss?: () => void,
        contextArg?: Object
    ) {}
    showFilePicker(
        onFilesPicked: () => void,
        onFilesUploaded: (thumbnailBlobs: BlobWithThumbnails[]) => void,
        allowedTypes?: string[],
        requestedThumbnailWidths?: number[]
    ) {}
    startDisplayingAboveMenus() {}
    stopDisplayingAboveMenus() {}
    updateDisplayDimensions() {}
    updateTemplateParams(
        templateParams: {[name: string]: string},
        isTemplate?: boolean
    ) {}
    getTemplateParams(): Promise<{
        templateParams: {[key: string]: string};
        isTemplate: boolean;
        canShowTemplateFlow: boolean;
    }> { return Promise.resolve({templateParams: {}, isTemplate: false, canShowTemplateFlow: false});}
    updateToolbar(toolbarState: ToolbarState) {}
    updateToolbarCommandsState(
        disabledCommandIds: string[],
        highlightedCommandIds: string[]
    ) {}
    uploadFile(
        blob: Blob,
        onFilesUploaded: (thumbnailBlobs: BlobWithThumbnails[]) => void,
        requestedThumbnailWidths?: number[]
    ) {
        // TODO: respond?
    }
    viewerCanSeeComments() {
        return this.viewerCanSeeCommentsValue;
    }
}
