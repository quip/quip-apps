import quip from "quip";

export const updateAppToolbar = saveHandler => {
    quip.apps.updateToolbar({
        toolbarCommandIds: saveHandler ? ["save"] : [],
        menuCommands: [
            {
                id: "save",
                label: "Save",
                handler: saveHandler || (() => {}),
            },
        ],
    });
};
