import quip from "quip";
import App from "./App.jsx";

quip.elements.initialize({
    initializationCallback: function(rootNode) {
        ReactDOM.render(<App />, rootNode);
    },
});
