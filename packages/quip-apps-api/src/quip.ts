// Copyright 2019 Quip

import Auth_ from "./auth";
import BaseOAuth_ from "./base-oauth";
import Blob_ from "./blob";
import CanvasRecord_ from "./canvas-record";
import Record_ from "./record";
import ClientError_ from "./client-error";
import ImageRecord_ from "./image-record";
import OAuth1_ from "./oauth-1";
import OAuth2_ from "./oauth-2";
import Preferences_ from "./preferences";
import RecordIndex_ from "./record-index";
import RootRecord_ from "./root-record";
import RecordList_ from "./record-list";
import Client_ from "./client";
import * as clientExports from "./client";
import RichTextRecord_ from "./rich-text-record";
import UrlAuth_ from "./url-auth";
import User_ from "./user";
import * as ui from "./ui";

const client = new Client_("", "", "", window, "");
const api = Object.assign(client, clientExports, {
    Auth: Auth_,
    BaseOAuth: BaseOAuth_,
    Blob: Blob_,
    CanvasRecord: CanvasRecord_,
    Record: Record_,
    ClientError: ClientError_,
    ImageRecord: ImageRecord_,
    OAuth1: OAuth1_,
    OAuth2: OAuth2_,
    Preferences: Preferences_,
    RecordIndex: RecordIndex_,
    RootRecord: RootRecord_,
    RecordList: RecordList_,
    RichTextRecord: RichTextRecord_,
    UrlAuth: UrlAuth_,
    User: User_,
    ui,
});
const quip = {apps: api, elements: api};
namespace quip {
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

        export type MenuCommand = clientExports.MenuCommand;
    }
}
export = quip;
