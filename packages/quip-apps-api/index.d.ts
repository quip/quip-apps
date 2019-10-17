// Copyright Quip 2019

import Auth_ from "./src/auth";
import BaseOAuth_, {
    HttpResponse as HttpResponse_,
    HttpHeaders as HttpHeaders_,
} from "./src/base-oauth";
import Blob_ from "./src/blob";
import CanvasRecord_, {
    CanvasRecordCommentAnchorRecord as CanvasRecordCommentAnchorRecord_,
} from "./src/canvas-record";
import Record_, {
    RecordConstructor as RecordConstructor_,
    RecordType as RecordType_,
    RecordParams as RecordParams_,
} from "./src/record";
import ClientError_ from "./src/client-error";
import ImageRecord_ from "./src/image-record";
import OAuth1_ from "./src/oauth-1";
import OAuth2_ from "./src/oauth-2";
import Preferences_ from "./src/preferences";
import RecordIndex_ from "./src/record-index";
import RootRecord_ from "./src/root-record";
import RecordList_ from "./src/record-list";
import Client_, {
    ElementsEventType as ElementsEventType_,
    BlobWithThumbnails as BlobWithThumbnails_,
    MenuCommand as MenuCommand_,
    CreationSource as CreationSource_,
    DocumentMenuCommands as DocumentMenuCommands_,
    EventType as EventType_,
    MenuIcons as MenuIcons_,
    RootEntityConstructor as RootEntityConstructor_,
} from "./src/client";
import * as clientExports from "./src/client";
import RichTextRecord_ from "./src/rich-text-record";
import UrlAuth_ from "./src/url-auth";
import User_ from "./src/user";
import * as ui from "./src/ui";

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
    export type ElementsEventType = ElementsEventType_;
    export type BlobWithThumbnails = BlobWithThumbnails_;
    export type MenuCommand = MenuCommand_;
    export type CreationSource = typeof CreationSource_;
    export type DocumentMenuCommands = typeof DocumentMenuCommands_;
    export type EventType = typeof EventType_;
    export type MenuIcons = typeof MenuIcons_;
    export type RootEntityConstructor = typeof RootEntityConstructor_;
    export type RecordConstructor = RecordConstructor_;
    export type RecordType = RecordType_;
    export type RecordParams = RecordParams_;
}
