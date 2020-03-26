import quip from "quip";

import App from "./App.jsx";
import Connect from "./connectRecord";

import {getAllMenuCommands} from "./menus";

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        const rootRecord = quip.apps.getRootRecord();
        const ConnectedApp = Connect(rootRecord, App);
        ReactDOM.render(<ConnectedApp />, rootNode);
    },
    menuCommands: getAllMenuCommands(),
    toolbarCommandIds: ["changeDashboard"],
});
