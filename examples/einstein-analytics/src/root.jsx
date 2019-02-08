import quip from "quip";
import App from "./App.jsx";
import Connect from "./connectRecord";
import {getAllMenuCommands, updateToolbar} from "./menus";

Object.prototype.isReactComponent;

export function getAuth() {
    return quip.apps.auth("EinsteinAnalytics");
}

quip.apps.initialize({
    initializationCallback: function(rootNode, {creationUrl, isCreation}) {
        const rootRecord = quip.apps.getRootRecord();
        const ConnectedApp = Connect(rootRecord, App);
        console.debug("initializationCallback", {creationUrl, isCreation});
        if (isCreation && creationUrl) {
            const dashboardId = creationUrl.split("wave.apexp#dashboard/")[1];
            console.debug("got creationUrl", {dashboardId});
            rootRecord.set("dashboardId", dashboardId);
        }
        ReactDOM.render(<ConnectedApp/>, rootNode);
        updateToolbar();
    },
    menuCommands: getAllMenuCommands(),
    toolbarCommandIds: [],
});
