import quip from "quip";
import App from "./App.jsx";

class StickyNoteRoot extends quip.apps.RootRecord {
    static getProperties() {
        return {
            stickyNote: StickyNoteRichTextRecord,
        };
    }
}
quip.apps.registerClass(StickyNoteRoot, "root");

class StickyNoteRichTextRecord extends quip.apps.RichTextRecord {
    static getProperties() {
        return {};
    }
    static getDefaultProperties = () => ({
        RichText_placeholderText: "Add a title",
    });
    supportsComments() {
        return true;
    }
}
quip.apps.registerClass(StickyNoteRichTextRecord, "stickyNote");

quip.apps.initialize({
    initializationCallback: function(rootNode, params) {
        let rootRecord = quip.apps.getRootRecord();
        if (params.isCreation) {
            rootRecord.set("stickyNote", {});
        }
        ReactDOM.render(
            <App richTextRecord={rootRecord.get("stickyNote")} />,
            rootNode,
        );
    },
});
