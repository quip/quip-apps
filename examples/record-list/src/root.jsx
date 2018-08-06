import quip from "quip";
import App from "./App.jsx";

class SectionRecord extends quip.apps.Record {
    static getProperties = () => ({
        createdAt: "number",
    });

    static getDefaultProperties = () => ({
        createdAt: new Date().getTime(),
    });
}

quip.apps.registerClass(SectionRecord, "section-record");

class RootRecord extends quip.apps.RootRecord {
    static getProperties = () => ({
        sections: quip.apps.RecordList.Type(SectionRecord),
    });

    static getDefaultProperties = () => ({
        sections: [],
    });

    add() {
        const sections = this.get("sections");
        const newSection = sections.add(SectionRecord.getDefaultProperties());
        console.debug("added", {newSection});
    }
}

quip.apps.registerClass(RootRecord, "root-record");

quip.apps.initialize({
    initializationCallback: function(rootNode, params) {
        if (params.isCreation) {
            quip.apps.getRootRecord().add();
        }
        ReactDOM.render(<App />, rootNode);
    },
});
