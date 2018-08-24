import quip from "quip";
import App from "./App.jsx";
import Connect from "./connectRecord";
import {getAllMenuCommands, getToolbarCommandIds, updateToolbar} from "./menus";

Object.prototype.isReactComponent;

export function getAuth() {
    return quip.apps.auth("EinsteinAnalytics");
}

quip.apps.initialize({
    initializationCallback: function(rootNode, {isCreation}) {
        const rootRecord = quip.apps.getRootRecord();
        const ConnectedApp = Connect(rootRecord, App);
        ReactDOM.render(<ConnectedApp/>, rootNode);
        updateToolbar();
    },
    menuCommands: getAllMenuCommands(),
    toolbarCommandIds: [],
});
