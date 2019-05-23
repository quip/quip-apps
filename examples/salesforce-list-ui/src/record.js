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
        myRecords: quip.apps.RecordList.Type(MyRecord),
        listViewData: "object",
        selection: "array",
    });

    static getDefaultProperties = () => ({
        myRecords: [],
        selection: [],
        listViewData: {},
    });
}
quip.apps.registerClass(RootRecord, "root-record");
