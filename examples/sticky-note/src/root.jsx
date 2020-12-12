import quip from "quip";
import App from "./App.jsx";

class StickyNoteRoot extends quip.apps.RootRecord {
    static getProperties() {
        return {
            stickyNote: quip.apps.RichTextRecord,
        };
    }
}
quip.apps.registerClass(StickyNoteRoot, "root");

quip.apps.initialize({
    initializationCallback: function (rootNode, params) {
        let rootRecord = quip.apps.getRootRecord();
        if (params.isCreation) {
            rootRecord.set("stickyNote", {});
        }
        ReactDOM.render(
            <App richTextRecord={rootRecord.get("stickyNote")}/>,
            rootNode);
    },
});
