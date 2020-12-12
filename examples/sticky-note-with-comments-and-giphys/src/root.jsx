import quip from "quip";
import App from "./App.jsx";

/**
 * The following two records represent a RootRecord with a single child
 * record `stickyNote` which is an instance of `StickyNoteRichTextRecord`.
 */
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
    // getDom() also needs to be implemented, but we'll do that
    // with a `ref` function when we embed the `quip.apps.ui.CommentsTrigger`
}
quip.apps.registerClass(StickyNoteRichTextRecord, "stickyNote");

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
