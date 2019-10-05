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
import RichTextRecord from "./rich-text-record";
import UrlAuth from "./url-auth";
import User from "./user";
import * as ui from "./ui";

const client = new Client();
const quip = {apps: client, elements: client};

const exportSymbol = (symbol: string, value: any) => {
    quip.apps[symbol] = value;
    quip.elements[symbol] = value;
};

for (const classMethod in Client) {
    exportSymbol(classMethod, Client[classMethod]);
}

exportSymbol("Auth", Auth);
exportSymbol("BaseOAuth", BaseOAuth);
exportSymbol("Blob", Blob);
exportSymbol("CanvasRecord", CanvasRecord);
exportSymbol("ChildEntity", Record);
exportSymbol("ClientError", ClientError);
exportSymbol("Entity", Record);
exportSymbol("ImageEntity", ImageRecord);
exportSymbol("ImageRecord", ImageRecord);
exportSymbol("OAuth1", OAuth1);
exportSymbol("OAuth2", OAuth2);
exportSymbol("Preferences", Preferences);
exportSymbol("Record", Record);
exportSymbol("RecordIndex", RecordIndex);
exportSymbol("RichTextRecord", RichTextRecord);
exportSymbol("RichTextEntity", RichTextRecord);
exportSymbol("RootEntity", RootRecord);
exportSymbol("RootRecord", RootRecord);
exportSymbol("RecordList", RecordList);
exportSymbol("UrlAuth", UrlAuth);
exportSymbol("User", User);
exportSymbol("ui", ui);

module.exports = quip;
