import quip from "quip";
import App from "./App.jsx";
import Connect from "./connectRecord";

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        const ConnectedApp = Connect(quip.apps.getRootRecord(), App);
        ReactDOM.render(<ConnectedApp/>, rootNode);
    },
});
