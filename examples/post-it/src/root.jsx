import quip from "quip";
import App from "./App.jsx";

class PostItRoot extends quip.apps.RootRecord {
    static getProperties() {
        return {
            postIt: quip.apps.RichTextRecord,
        };
    }
}
quip.apps.registerClass(PostItRoot, "root");

quip.apps.initialize({
    initializationCallback: function(rootNode, params) {
        let rootRecord = quip.apps.getRootRecord();
        if (params.isCreation) {
            rootRecord.set("postIt", {});
        }
        ReactDOM.render(
            <App richTextRecord={rootRecord.get("postIt")} />,
            rootNode,
        );
    },
});
