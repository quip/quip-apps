import quip from "quip";
import {start} from "./App.js";

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        start(rootNode);
    },
});
