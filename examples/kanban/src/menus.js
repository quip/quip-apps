// Copyright 2017 Quip

import {localizedColorLabel} from "quip-apps-compat";

import {kDefaultColumnColors} from "./model.jsx";

const colors = kDefaultColumnColors;

let selectedCard;
export function onSelectedCardChanged(newSelectedCard) {
    selectedCard = newSelectedCard;
    quip.apps.setSelectedRecord(newSelectedCard);
    refreshToolbar();
}

export function refreshToolbar() {
    quip.apps.updateToolbarCommandsState(
        getDisabledCommands(selectedCard),
        getHighlightedCommands(selectedCard));
}

export function allMenuCommands() {
    return [
        {
            id: "insert-column",
            label: quiptext("Add Column"),
            handler: () => {
                quip.apps.getRootRecord().addColumn();
            },
        },
        {
            id: "delete-card",
            label: quiptext("Delete"),
            handler: (name, context) => {
                context.cardRecord.deleteCard();
            },
        },
        {
            id: "delete-column",
            label: quiptext("Delete"),
            handler: (name, context) => {
                context.cardRecord.getColumn().deleteColumn();
            },
        },
        {
            id: "comment",
            label: quiptext("Comment"),
            handler: (name, context) => {
                quip.apps.showComments(context.cardRecord.id());
            },
        },
        {
            id: "automatic-color",
            label: quiptext("Automatic"),
            handler: (name, context) => {
                context.cardRecord.clearColor();
                refreshToolbar();
            },
        },
        ...colors.map(color => ({
            id: color,
            label: localizedColorLabel(color),
            handler: (name, context) => {
                const cardRecord = context.cardRecord;
                if (cardRecord.isHeader()) {
                    cardRecord.getColumn().setColor(color);
                } else {
                    cardRecord.setColor(color);
                }
                refreshToolbar();
            },
        })),
    ];
}

export function showCardContextMenu(e, cardRecord, onDismiss) {
    let commands;
    if (cardRecord.isHeader()) {
        commands = [
            ...colors,
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "delete-column",
        ];
    } else {
        commands = [
            "automatic-color",
            ...colors,
            quip.apps.DocumentMenuCommands.SEPARATOR,
        ];
        if (quip.apps.viewerCanSeeComments()) {
            commands.push("comment");
        }
        commands.push("delete-card");
    }
    quip.apps.showContextMenuFromButton(
        e,
        commands,
        getHighlightedCommands(cardRecord),
        null,
        onDismiss,
        {
            cardRecord: cardRecord,
        });
}

function getHighlightedCommands(cardRecord) {
    if (!cardRecord) {
        return [];
    } else {
        const cardColor = cardRecord.isHeader()
            ? cardRecord.getColumn().getColor()
            : cardRecord.getIntrinsicColor();
        return !cardRecord.isHeader() && !cardColor
            ? ["automatic-color"]
            : [cardColor];
    }
}

function getDisabledCommands(cardRecord) {
    if (!cardRecord) {
        return [
            "delete-card",
            "delete-column",
            "comment",
            "automatic-color",
            ...colors,
        ];
    } else if (cardRecord.isHeader()) {
        return ["delete-card", "comment", "automatic-color"];
    } else {
        return [];
    }
}
