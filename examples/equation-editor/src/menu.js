// Copyright 2018 Quip

/** @enum {string} */
const Command = {
    DISPLAY: "display",
    DISPLAY_SIZE_HEADER: "display-size-header",
    DISPLAY_SMALL: "display-small",
    DISPLAY_MEDIUM: "display-medium",
    DISPLAY_LARGE: "display-large",
    DISPLAY_ALIGN_HEADER: "display-align-header",
    DISPLAY_LEFT: "display-left",
    DISPLAY_CENTER: "display-center",
    DISPLAY_RIGHT: "display-right"
};

class PropertyCommand {
    constructor(label, propertyName, propertyValue) {
        this.label = label;
        this.propertyName = propertyName;
        this.propertyValue = propertyValue;
    }

    isHighlighted(rootRecord) {
        return rootRecord.get(this.propertyName) === this.propertyValue;
    }
}

const DISPLAY_PROPERTY_COMMANDS = {
    [Command.DISPLAY_SMALL]: new PropertyCommand("Small", "size", "small"),
    [Command.DISPLAY_MEDIUM]: new PropertyCommand("Medium", "size", "medium"),
    [Command.DISPLAY_LARGE]: new PropertyCommand("Large", "size", "large"),
    [Command.DISPLAY_LEFT]: new PropertyCommand("Left", "align", "left"),
    [Command.DISPLAY_CENTER]: new PropertyCommand("Center", "align", "center"),
    [Command.DISPLAY_RIGHT]: new PropertyCommand("Right", "align", "right")
};

export function getMenuCommands() {
    return [
        {
            id: Command.DISPLAY,
            label: "Display",
            subCommands: [
                Command.DISPLAY_SIZE_HEADER,
                Command.DISPLAY_SMALL,
                Command.DISPLAY_MEDIUM,
                Command.DISPLAY_LARGE,
                quip.apps.DocumentMenuCommands.SEPARATOR,
                Command.DISPLAY_ALIGN_HEADER,
                Command.DISPLAY_LEFT,
                Command.DISPLAY_CENTER,
                Command.DISPLAY_RIGHT,
            ],
        },
        {
            id: Command.DISPLAY_SIZE_HEADER,
            label: "Size",
            isHeader: true,
        },
        {
            id: Command.DISPLAY_ALIGN_HEADER,
            label: "Align",
            isHeader: true,
        },
        ...Object.keys(DISPLAY_PROPERTY_COMMANDS).map(id => {
            const command = DISPLAY_PROPERTY_COMMANDS[id];
            return {
                id: id,
                label: command.label,
                handler: () => {
                    quip.apps.getRootRecord().set(
                        command.propertyName, command.propertyValue);
                },
            }
        })
    ];
}

function getToolbarCommandIds() {
    return [Command.DISPLAY];
}

function getHighlightedCommandIds(rootEntity) {
    return Object.keys(DISPLAY_PROPERTY_COMMANDS).filter(id => {
        const command = DISPLAY_PROPERTY_COMMANDS[id];
        return command.isHighlighted(rootEntity);
    });
}

export default {
    getMenuCommands,
    getToolbarCommandIds,
    getHighlightedCommandIds,
};

