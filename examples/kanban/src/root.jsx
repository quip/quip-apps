// Copyright 2017 Quip

import { spring } from "react-motion";

import Board from "./board.jsx";
import {
    allMenuCommands,
    onSelectedCardChanged,
    refreshToolbar,
} from "./menus.js";
import { BoardEntity, CardEntity, ColumnEntity } from "./model.jsx";

const kInitialColumns = [
    {
        headerText: "To Do",
        numCards: 1,
    },
    {
        headerText: "In Progress",
        numCards: 1,
    },
    {
        headerText: "Done",
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
export function focusCard(cardEntity) {
    cardToFocus = cardEntity;
    for (const listener of cardFocusListeners) {
        listener();
    }
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

function ensureBoardPopulated(boardEntity) {
    for (let column of kInitialColumns) {
        const columnEntity = boardEntity.addColumn(column.headerText);
        while (columnEntity.getCards().length - 1 < column.numCards) {
            focusCard(columnEntity.addCard(false));
        }
    }
}

quip.elements.enableDataModelV2();
quip.elements.registerClass(BoardEntity, "Root");
quip.elements.registerClass(ColumnEntity, ColumnEntity.CONSTRUCTOR_KEY);
quip.elements.registerClass(CardEntity, CardEntity.CONSTRUCTOR_KEY);

quip.elements.enableSizingV2();

quip.elements.initialize({
    menuCommands: allMenuCommands(),
    toolbarCommandIds: ["insert-column"],
    initializationCallback: (root, params) => {
        const boardEntity = quip.elements.getRootEntity();
        const justCreated = params.isCreation;
        if (justCreated) {
            ensureBoardPopulated(boardEntity);
            //quip.elements.sendMessage("created a Kanban Board");
        }
        ReactDOM.render(
            <Board
                entity={boardEntity}
                onSelectedCardChanged={onSelectedCardChanged}
                focusOnMount={justCreated}
            />,
            root,
        );
        refreshToolbar();
    },
});
