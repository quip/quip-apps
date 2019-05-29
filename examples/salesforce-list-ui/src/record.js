class MyRecord extends quip.apps.Record {
    static getProperties = () => ({
        id: "string",
    });

    getDom() {
        return this.node;
    }

    setDom(node) {
        this.node = node;
    }

    supportsComments() {
        return true;
    }
}

quip.apps.registerClass(MyRecord, "my-record");

class RootRecord extends quip.apps.RootRecord {
    static getProperties = () => ({
        recordId: "string",
        myRecords: quip.apps.RecordList.Type(MyRecord),
        listViewData: "object",
        selection: "array",
    });

    static getDefaultProperties = () => ({
        recordId: "",
        myRecords: [],
        selection: [],
        listViewData: {},
    });
}
quip.apps.registerClass(RootRecord, "root-record");
