// Copyright 2017 Quip

import { kDefaultColumnColors } from "./model.jsx";

const colors = kDefaultColumnColors;

let selectedCard;
export function onSelectedCardChanged(newSelectedCard) {
    selectedCard = newSelectedCard;
    quip.elements.setSelectedRecord(newSelectedCard);
    refreshToolbar();
}

export function refreshToolbar() {
    quip.elements.updateToolbarCommandsState(
        getDisabledCommands(selectedCard),
        getHighlightedCommands(selectedCard),
    );
}

export function allMenuCommands() {
    return [
        {
            id: "insert-column",
            label: "Add Column",
            handler: () => {
                quip.elements.getRootEntity().addColumn();
            },
        },
        {
            id: "delete-card",
            label: "Delete",
            handler: (name, context) => {
                context.cardEntity.deleteCard();
            },
        },
        {
            id: "delete-column",
            label: "Delete",
            handler: (name, context) => {
                context.cardEntity.getColumn().deleteColumn();
            },
        },
        {
            id: "comment",
            label: "Comment",
            handler: (name, context) => {
                quip.elements.showComments(context.cardEntity.id());
            },
        },
        {
            id: "automatic-color",
            label: "Automatic",
            handler: (name, context) => {
                context.cardEntity.clearColor();
                refreshToolbar();
            },
        },
        ...colors.map(color => ({
            id: color,
            label: color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
            handler: (name, context) => {
                const cardEntity = context.cardEntity;
                if (cardEntity.isHeader()) {
                    cardEntity.getColumn().setColor(color);
                } else {
                    cardEntity.setColor(color);
                }
                refreshToolbar();
            },
        })),
    ];
}

export function showCardContextMenu(e, cardEntity, onDismiss) {
    let commands;
    if (cardEntity.isHeader()) {
        commands = [
            ...colors,
            quip.elements.DocumentMenuCommands.SEPARATOR,
            "delete-column",
        ];
    } else {
        commands = [
            "automatic-color",
            ...colors,
            quip.elements.DocumentMenuCommands.SEPARATOR,
            "comment",
            "delete-card",
        ];
    }
    quip.elements.showContextMenuFromButton(
        e,
        commands,
        getHighlightedCommands(cardEntity),
        null,
        onDismiss,
        {
            cardEntity: cardEntity,
        },
    );
}

function getHighlightedCommands(cardEntity) {
    if (!cardEntity) {
        return [];
    } else {
        const cardColor = cardEntity.isHeader()
            ? cardEntity.getColumn().getColor()
            : cardEntity.getIntrinsicColor();
        return !cardEntity.isHeader() && !cardColor
            ? ["automatic-color"]
            : [cardColor];
    }
}

function getDisabledCommands(cardEntity) {
    if (!cardEntity) {
        return [
            "delete-card",
            "delete-column",
            "comment",
            "automatic-color",
            ...colors,
        ];
    } else if (cardEntity.isHeader()) {
        return ["delete-card", "comment", "automatic-color"];
    } else {
        return [];
    }
}
