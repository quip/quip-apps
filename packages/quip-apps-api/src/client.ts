// Copyright 2019 Quip
import ClientBlob from "./blob";
import Auth from "./auth";
import Record, {RecordConstructor} from "./record";
import RecordList from "./record-list";
import RootRecord from "./root-record";
import RichTextRecord from "./rich-text-record";
import Preferences from "./preferences";
import User from "./user";

export enum ElementsEventType {
    ELEMENT_BLUR = "BLUR",
    BLUR = "BLUR",
    DOCUMENT_THEME_UPDATE = "DOCUMENT_THEME_UPDATE",
    CONTAINER_SIZE_UPDATE = "CONTAINER_SIZE_UPDATE",
    WINDOW_SIZE_UPDATE = "WINDOW_SIZE_UPDATE",
    // Temporary alias
    DOCUMENT_SIZE_UPDATE = "DOCUMENT_SIZE_UPDATE",
    USER_PREFERENCE_UPDATE = "USER_PREFERENCE_UPDATE",
    SITE_PREFERENCE_UPDATE = "SITE_PREFERENCE_UPDATE",
    ELEMENT_FOCUS = "FOCUS",
    FOCUS = "FOCUS",
    DOCUMENT_MEMBERS_LOADED = "DOCUMENT_MEMBERS_LOADED",
    WHITELISTED_USERS_LOADED = "WHITELISTED_USERS_LOADED",
    DOCUMENT_EDITABLE_CHANGED = "DOCUMENT_EDITABLE_CHANGED",
    ONLINE_STATUS_CHANGED = "ONLINE_STATUS_CHANGED",
    WIDTH_UPDATE = "WIDTH_UPDATE",
}

interface ResizingOptions {
    minWidth?: number;
    minHeight?: number;
    maintainAspectRatio?: boolean;
    listener?: (width: number, height: number) => void;
}

interface InitializationParameters {
    isCreation: boolean;
    creationUrl?: string;
    initOptions?: string;
    creationBlobs?: Blob[];
    creationSource: string;
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
}

export interface MenuCommand {
    id: string;
    label?: string;
    sublabel?: string;
    // TODO: unsure what this type actually is
    handler?: (command: string, params: Object) => void;
    isHeader?: boolean;
    subCommands?: string[];
    actionId?: string;
    actionParams?: Object;
    actionStarted?: () => void;
    quipIcon?: QuipIcon;
}

interface ToolbarState {
    menuCommands?: MenuCommand[];
    toolbarCommandIds?: string[];
    disabledCommandIds?: string[];
    highlightedCommandIds?: string[];
}

interface InitOptions {
    menuCommands?: MenuCommand[];
    toolbarCommandIds?: string[] | undefined;
    initializationCallback?: (
        element: Element,
        parameters: InitializationParameters
    ) => void;
}

export const CreationSource = {
    INSERT: 1,
    COPY_DOCUMENT: 2,
    PASTE: 3,
    TEMPLATE: 4,
};

export const DocumentMenuActions = {SHOW_FILE_PICKER: "1"};

export const DocumentMenuCommands = {
    SEPARATOR: "1",
    MENU_MAIN: "2",
    COPY_ANCHOR_LINK: "3",
    CUT_ELEMENT: "4",
    COPY_ELEMENT: "5",
    DELETE_ELEMENT: "6",
    DELETE_APP: "7",
};

export const EventType = {
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

export const MenuIcons = {
    COMMENT_INLINE: 1,
    FULL_SCREEN: 2,
    CROP: 3,
    SALESFORCE_LOGO: 4,
    SYNCING: 5,
    JIRA: 6,
};

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
    addEventListener(type: ElementsEventType, listener: () => void) {}
    addWhitelistedUser(userId: string) {}
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
    isApiVersionAtLeast() {
        return this.isApiVersionAtLeastValue;
    }
    isAppFocused() {
        return this.isAppFocusedValue;
    }
    isDocumentEditable() {
        return this.isDocumentEditableValue;
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
    removeEventListener(node: Node) {}
    searchPeople(searchString: string, callback: (users: User[]) => void) {
        callback(this.peopleToSearchForValue);
    }
    sendMessage(text: string, mentionIds: string[]) {}
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
