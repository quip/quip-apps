import {getVizUrl} from "./App.jsx";
let AppContext;

export function setAppContext(c) {
    AppContext = c;
}

export function getAllMenuCommands() {
    const commands = [
        {
            id: "changeDashboard",
            label: quiptext("Change Dashboard"),
            handler: () => {
                AppContext.openUrlDialog();
            },
        },
    ];

    return commands;
}
