import quip from "quip";
import App from "./App.jsx";

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        ReactDOM.render(<App/>, rootNode);
    },
});
