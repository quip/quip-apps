import quip from "quip";

export const updateAppToolbar = (
    refreshHandler,
    saveHandler,
    discardHandler,
) => {
    let commands = [];
    if (refreshHandler) {
        commands.push("refresh");
    }
    if (saveHandler) {
        commands.push("save");
    }
    if (discardHandler) {
        commands.push("discard");
    }
    quip.apps.updateToolbar({
        toolbarCommandIds: commands,
        menuCommands: [
            {
                id: "save",
                label: "Save",
                handler: saveHandler || (() => {}),
            },
            {
                id: "refresh",
                label: "Refresh",
                handler: refreshHandler || (() => {}),
            },
            {
                id: "discard",
                label: "Discard",
                handler: discardHandler || (() => {}),
            },
        ],
    });
};
