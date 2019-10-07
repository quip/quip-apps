// Copyright 2019 Quip

import Auth from "./auth";
import BaseOAuth from "./base-oauth";
import Blob from "./blob";
import CanvasRecord from "./canvas-record";
import Record from "./record";
import ClientError from "./client-error";
import ImageRecord from "./image-record";
import OAuth1 from "./oauth-1";
import OAuth2 from "./oauth-2";
import Preferences from "./preferences";
import RecordIndex from "./record-index";
import RootRecord from "./root-record";
import RecordList from "./record-list";
import Client from "./client";
import * as clientExports from "./client";
import RichTextRecord from "./rich-text-record";
import UrlAuth from "./url-auth";
import User from "./user";
import * as ui from "./ui";

const client = new Client("", "", "", window, "");
const api = Object.assign(client, clientExports, {
    Auth,
    BaseOAuth,
    Blob,
    CanvasRecord,
    Record,
    ClientError,
    ImageRecord,
    OAuth1,
    OAuth2,
    Preferences,
    RecordIndex,
    RootRecord,
    RecordList,
    RichTextRecord,
    UrlAuth,
    User,
    ui,
});

const quip = {apps: api, elements: api};
export default quip;
