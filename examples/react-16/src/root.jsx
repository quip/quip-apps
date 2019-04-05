import quip from "quip";
import App from "./App.jsx";
import ReactDOM from "react-dom";

quip.apps.initialize({
  initializationCallback: function(rootNode) {
    ReactDOM.render(<App />, rootNode);
  }
});
