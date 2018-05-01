// Copyright 2017 Quip

import {spring} from "react-motion";

import Board from "./board.jsx";
import {
    allMenuCommands,
    onSelectedCardChanged,
    refreshToolbar,
} from "./menus.js";
import {BoardRecord, CardRecord, ColumnRecord} from "./model.jsx";

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

import "./root.less";

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
quip.apps.registerClass(ColumnRecord, ColumnRecord.CONSTRUCTOR_KEY);
quip.apps.registerClass(CardRecord, CardRecord.CONSTRUCTOR_KEY);

quip.apps.initialize({
    menuCommands: allMenuCommands(),
    toolbarCommandIds: ["insert-column"],
    initializationCallback: (root, {isCreation, creationSource}) => {
        const boardRecord = quip.apps.getRootRecord();
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
        ReactDOM.render(
            <Board
                entity={boardRecord}
                onSelectedCardChanged={onSelectedCardChanged}
                focusOnMount={justCreated}/>,
            root);
        refreshToolbar();
    },
});
