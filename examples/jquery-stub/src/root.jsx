import quip from "quip";
import {start} from "./App.jsx";

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        start(rootNode);
    },
});
