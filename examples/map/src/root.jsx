import quip from "quip";
import App from "./App.jsx";

class MapRoot extends quip.apps.RootRecord {
  static getProperties() {
    return {
      address: "string"
    };
  }
}

quip.apps.registerClass(MapRoot, "root");

quip.apps.initialize({
  initializationCallback: function (rootNode, params) {
    const rootRecord = quip.apps.getRootRecord();
    if (params.isCreation) {
      rootRecord.set("address", '');
    }
    ReactDOM.render(<App />, rootNode);
  }
});
