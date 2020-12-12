// Copyright 2017 Quip

import React from "react";
import ReactDOM from "react-dom";
import quip from "quip-apps-api";
import quiptext from "quiptext";
import {spring} from "react-motion";
import Board from "./board.jsx";
import {
    allMenuCommands,
    onSelectedCardChanged,
    refreshToolbar,
} from "./menus.js";
import {BoardRecord, CardRecord, ColumnRecord} from "./model";
import "./root.less";

const kInitialColumns = [
    {
        headerText: quiptext("To Do"),
        numCards: 1,
    },
    {
        headerText: quiptext("In Progress"),
        numCards: 1,
    },
    {
        headerText: quiptext("Done"),
        numCards: 1,
    },
];

export function animateTo(value) {
    return spring(value, {
        stiffness: 210,
        damping: 20,
    });
}

let cardToFocus;
let cardFocusListeners = [];
export function getCardToFocus() {
    return cardToFocus;
}
export function focusCard(cardRecord) {
    cardToFocus = cardRecord;
    cardFocusListeners.forEach(listener => listener());
}
export function listenForCardFocus(listener) {
    cardFocusListeners.push(listener);
}
export function unlistenForCardFocus(listener) {
    var index = cardFocusListeners.indexOf(listener);
    if (index !== -1) {
        cardFocusListeners.splice(index, 1);
    }
}

function ensureBoardPopulated(boardRecord) {
    kInitialColumns.forEach(column => {
        const columnRecord = boardRecord.addColumn(column.headerText);
        while (columnRecord.getCards().length - 1 < column.numCards) {
            focusCard(columnRecord.addCard(false));
        }
    });
}

quip.apps.registerClass(BoardRecord, "Root");
// @ts-ignore TODO(GASPAR) remove after adding types ColumnRecord
quip.apps.registerClass(ColumnRecord, ColumnRecord.CONSTRUCTOR_KEY);
// @ts-ignore TODO(GASPAR) remove after adding types CardRecord
quip.apps.registerClass(CardRecord, CardRecord.CONSTRUCTOR_KEY);

quip.apps.initialize({
    menuCommands: allMenuCommands(),
    toolbarCommandIds: ["insert-column"],
    // @ts-ignore for payload, remove after moving to quip-apps-private
    initializationCallback: (root, {isCreation, creationSource, payload}) => {
        const boardRecord = quip.apps.getRootRecord() as BoardRecord;
        let justCreated = false;
        if (isCreation) {
            ensureBoardPopulated(boardRecord);
            //quip.apps.sendMessage("created a Kanban Board");
            justCreated = true;
        } else if (quip.apps.CreationSource &&
            creationSource === quip.apps.CreationSource.TEMPLATE) {
            boardRecord.clearData();
            ensureBoardPopulated(boardRecord);
            justCreated = true;
        }

        // Populating kanban board from init options.
        // We assume that if rootRecord doesn't have any columns, we should read
        // from the payload (if present). This is to support creation from API.
        if ((justCreated || !boardRecord.getColumns().length) && payload) {
            let initOptions: {[key: string]: any} | null = null;
            try {
                initOptions = JSON.parse(payload);
            } catch (e) {
                // Ignore parse errors here. Presumably the metrics and local
                // logs are enough to debug.
                console.error(`Invalid JSON in payload: ${payload}`);
            }

            if (initOptions) {
                if (!initOptions["columns"]) {
                    console.error(
                        "Invalid payload: 'columns' property not set");
                } else {
                    boardRecord.populateColumns(initOptions["columns"]);
                }
            }
        }

        ReactDOM.render(
            <Board
                entity={boardRecord}
                onSelectedCardChanged={onSelectedCardChanged}
                focusOnMount={justCreated}/>,
            root);
        refreshToolbar();
    },
});
