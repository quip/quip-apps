import React from "react";
import ReactDOM from "react-dom";
import quip from "quip-apps-api";

import App from "./App";

import {allMenuCommands} from "./menus";

import "./root.less";
import {RootRecord} from "./model";

quip.apps.initialize({
    menuCommands: allMenuCommands(),
    toolbarCommandIds: ["set-display-month"],

    initializationCallback: function (
        root,
        // @ts-ignore TODO remove after adding quip-apps-private
        {isCreation, creationSource, payload}
    ) {
        const rootRecord = quip.apps.getRootRecord() as RootRecord;

        let isNew = false;
        if (isCreation) {
            rootRecord.setDisplayMonth(new Date());
            isNew = true;
        } else if (quip.apps.CreationSource &&
            creationSource === quip.apps.CreationSource.TEMPLATE) {
            rootRecord.clearData();
            rootRecord.setDisplayMonth(new Date());
            isNew = true;
        }

        // Populating the initial options.
        // We assume that if rootRecord doesn't have any events, we should read
        // from the payload (if present). This is to support creation from API.
        if ((isNew || !rootRecord.getEvents().length) && payload) {
            let initOptions: {[key: string]: any} | null = null;
            try {
                initOptions = JSON.parse(payload);
            } catch (e) {
                // Ignore parse errors here. Presumably the metrics and local
                // logs are enough to debug.
                console.error(`Invalid JSON in payload: ${payload}`);
            }

            if (initOptions) {
                if (initOptions["displayMonth"]) {
                    rootRecord.populateDisplayMonth(
                        initOptions["displayMonth"]);
                }
                if (initOptions["events"]) {
                    rootRecord.populateEvents(initOptions["events"]);
                }
            }
        }
        ReactDOM.render(<App rootNode={root} rootRecord={rootRecord}/>, root);
    },
});
