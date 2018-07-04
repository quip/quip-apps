import quip from "quip";
import App from "./App";

import registerModel from './model';

registerModel();

let app;
const setApp = (a) => {
    app = a;
};

const colors = [
    quip.apps.ui.ColorMap.RED.KEY,
    quip.apps.ui.ColorMap.ORANGE.KEY,
    quip.apps.ui.ColorMap.YELLOW.KEY,
    quip.apps.ui.ColorMap.GREEN.KEY,
    quip.apps.ui.ColorMap.BLUE.KEY,
    quip.apps.ui.ColorMap.VIOLET.KEY,
];

quip.apps.initialize({
    initializationCallback: function(rootNode, { isCreation }) {
        const rootRecord = quip.apps.getRootRecord();
        if (isCreation) {
            rootRecord.seed();
        }

        ReactDOM.render(<App record={rootRecord} setApp={setApp} />, rootNode);
    },
    menuCommands: [
        {
            id: quip.apps.DocumentMenuCommands.MENU_MAIN,
            subCommands: ['terms'],
        },
        {
            id: 'changeSymbol',
            label: 'Change Asset',
            handler: () => {
                app && app.openPickerHandler();
            }
        },
        {
            id: 'terms',
            label: 'Terms of Use',
            handler: () => {
                app && app.openTermsHandler();
            }
        },
        {
            id: "color",
            label: quiptext("Color"),
            subCommands: colors,
        },
        ...colors.map(color => ({
            id: color,
            label: quip.apps.ui.ColorMap[color].LABEL,
            handler: () => {
                app && app.updateColor(color);
            },
            isHeader: false,
        }))
    ],
    toolbarCommandIds: ['color', 'changeSymbol', quip.apps.DocumentMenuCommands.MENU_MAIN]
});
