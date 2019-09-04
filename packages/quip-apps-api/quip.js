// Copyright 2019 Quip

const Auth = require("./auth");
const BaseOAuth = require("./base-oauth");
const Blob = require("./blob");
const CanvasRecord = require("./canvas-record");
const Client = require("./client");
const ClientError = require("./client-error");
const ImageRecord = require("./image-record");
const OAuth1 = require("./oauth-1");
const OAuth2 = require("./oauth-2");
const Preferences = require("./preferences");
const Record = require("./record");
const RecordIndex = require("./record-index");
const RichTextRecord = require("./rich-text-record");
const RootRecord = require("./root-record");
const RecordList = require("./record-list");
const UrlAuth = require("./url-auth");
const User = require("./user");
const ui = require("./ui");

const client = new Client();
const quip = {apps: client, elements: client};

const exportSymbol = (symbol, value) => {
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
