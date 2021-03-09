import Auth_ from "./dist/auth";
import BaseOAuth_, {
    HttpHeaders as HttpHeaders_,
    HttpResponse as HttpResponse_,
} from "./dist/base-oauth";
import Blob_ from "./dist/blob";
import CanvasRecord_, {
    CanvasRecordCommentAnchorRecord as CanvasRecordCommentAnchorRecord_,
} from "./dist/canvas-record";
import * as clientExports from "./dist/client";
import Client_, {
    BlobWithThumbnails as BlobWithThumbnails_,
    CreationSource as CreationSource_,
    DocumentMenuCommands as DocumentMenuCommands_,
    EventType as EventType_,
    InitOptions as InitOptions_,
    MenuCommand as MenuCommand_,
    MenuIcons as MenuIcons_,
    RootEntityConstructor as RootEntityConstructor_,
    ToolbarState as ToolbarState_,
} from "./dist/client";
import ClientError_ from "./dist/client-error";
import ImageRecord_ from "./dist/image-record";
import OAuth1_ from "./dist/oauth-1";
import OAuth2_ from "./dist/oauth-2";
import Preferences_ from "./dist/preferences";
import Record_, {
    RecordConstructor as RecordConstructor_,
    RecordParams as RecordParams_,
    RecordPropertyDefinition as RecordPropertyDefinition_,
    RecordType as RecordType_,
} from "./dist/record";
import RecordIndex_ from "./dist/record-index";
import RecordList_ from "./dist/record-list";
import registerMigration, {
    MigrationFn as MigrationFn_,
} from "./dist/register-migration";
import RichTextRecord_ from "./dist/rich-text-record";
import RootRecord_ from "./dist/root-record";
import * as ui from "./dist/ui";
import UrlAuth_ from "./dist/url-auth";
import User_ from "./dist/user";

declare type QuipAPI = Client_ &
    typeof clientExports & {
        Auth: typeof Auth_;
        BaseOAuth: typeof BaseOAuth_;
        Blob: typeof Blob_;
        CanvasRecord: typeof CanvasRecord_;
        Record: typeof Record_;
        ClientError: typeof ClientError_;
        ImageRecord: typeof ImageRecord_;
        OAuth1: typeof OAuth1_;
        OAuth2: typeof OAuth2_;
        Preferences: typeof Preferences_;
        RecordIndex: typeof RecordIndex_;
        RootRecord: typeof RootRecord_;
        RecordList: typeof RecordList_;
        RichTextRecord: typeof RichTextRecord_;
        UrlAuth: typeof UrlAuth_;
        User: typeof User_;
        ui: typeof ui;
        registerMigration: typeof registerMigration;
    };

declare const quip: {
    apps: QuipAPI;
    elements: QuipAPI;
};

export = quip;
export as namespace quip;

declare namespace quip {
    export namespace apps {
        export type Auth = Auth_;
        export type BaseOAuth = BaseOAuth_;
        export type Blob = Blob_;
        export type CanvasRecord = CanvasRecord_;
        export type Record = Record_;
        export type ClientError = ClientError_;
        export type ImageRecord = ImageRecord_;
        export type OAuth1 = OAuth1_;
        export type OAuth2 = OAuth2_;
        export type Preferences = Preferences_;
        export type RecordIndex<T extends Record> = RecordIndex_<T>;
        export type RootRecord = RootRecord_;
        export type RecordList<T extends Record> = RecordList_<T>;
        export type RichTextRecord = RichTextRecord_;
        export type UrlAuth = UrlAuth_;
        export type User = User_;
    }
    export type HttpResponse<T = Object> = HttpResponse_<T>;
    export type HttpHeaders = HttpHeaders_;
    export type CanvasRecordCommentAnchorRecord = CanvasRecordCommentAnchorRecord_;
    export type BlobWithThumbnails = BlobWithThumbnails_;
    export type MenuCommand = MenuCommand_;
    export type ToolbarState = ToolbarState_;
    export type CreationSource = typeof CreationSource_;
    export type DocumentMenuCommands = typeof DocumentMenuCommands_;
    export type EventType = typeof EventType_;
    export type MenuIcons = typeof MenuIcons_;
    export type RootEntityConstructor = typeof RootEntityConstructor_;
    export type RecordConstructor = RecordConstructor_;
    export type RecordParams = RecordParams_;
    export type RecordPropertyDefinition = RecordPropertyDefinition_;
    export type RecordType = RecordType_;
    export type MigrationFn = MigrationFn_;
    export type InitOptions = InitOptions_;
}
