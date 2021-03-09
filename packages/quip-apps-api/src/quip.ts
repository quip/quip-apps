import Auth_ from "./auth";
import BaseOAuth_ from "./base-oauth";
import Blob_ from "./blob";
import CanvasRecord_ from "./canvas-record";
import Client_, * as clientExports from "./client";
import ClientError_ from "./client-error";
import ImageRecord_ from "./image-record";
import OAuth1_ from "./oauth-1";
import OAuth2_ from "./oauth-2";
import Preferences_ from "./preferences";
import Record_ from "./record";
import RecordIndex_ from "./record-index";
import RecordList_ from "./record-list";
import registerMigration from "./register-migration";
import RichTextRecord_ from "./rich-text-record";
import RootRecord_ from "./root-record";
import * as ui from "./ui";
import UrlAuth_ from "./url-auth";
import User_ from "./user";

const client = new Client_("", "", "");
const api = Object.assign(client, clientExports, {
    Auth: Auth_,
    BaseOAuth: BaseOAuth_,
    Blob: Blob_,
    CanvasRecord: CanvasRecord_,
    Record: Record_,
    Entity: Record_,
    ChildEntity: Record_,
    ClientError: ClientError_,
    ImageRecord: ImageRecord_,
    ImageEntity: ImageRecord_,
    OAuth1: OAuth1_,
    OAuth2: OAuth2_,
    Preferences: Preferences_,
    RecordIndex: RecordIndex_,
    RootRecord: RootRecord_,
    RootEntity: RootRecord_,
    RecordList: RecordList_,
    RichTextRecord: RichTextRecord_,
    RichTextEntity: RichTextRecord_,
    UrlAuth: UrlAuth_,
    User: User_,
    ui,
    registerMigration,
});

const quip = {
    apps: api,
    elements: api,
};
export = quip;
