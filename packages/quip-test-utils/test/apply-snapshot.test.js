const test = require("tape");
const quip = require("quip-apps-api");
const {applySnapshot} = require("../dist/test-utils");

test("Test Utils: applySnapshot", t => {
    t.plan(13);

    const record = new Root();
    applySnapshot(record, snapshot, {
        sibling: ACustomClass,
        "child.oldProp": ACustomClass,
        "child.aList.oldProp": ACustomClass,
    });

    t.equal(
        record.get("rootName"),
        snapshot.data.rootName.v,
        "root name is copied over"
    );
    const child = record.get("child");

    t.ok(child, "child is created");
    t.ok(child instanceof ChildRecord, "child is right type");

    const sibling = record.get("sibling");
    t.ok(sibling, "legacy child is created");
    t.ok(sibling instanceof ACustomClass, "legacy child is right type");

    t.equal(
        child.get("aString"),
        snapshot.data.child.v.aString.v,
        "child string is copied"
    );
    t.deepEqual(
        child.get("anObject"),
        snapshot.data.child.v.anObject.v,
        "child object is copied over"
    );
    t.ok(
        child.get("oldProp") instanceof ACustomClass,
        "child legacy prop is right type"
    );

    const list = child.get("aList");
    t.ok(list instanceof quip.apps.RecordList, "child list is a RecordList");
    t.equal(list.count(), 2, "list has the right number of children");
    const children = list.getRecords();
    t.equal(
        children[0].get("name"),
        snapshot.data.child.v.aList.children[0].name.v,
        "first child has correct name"
    );
    t.equal(
        children[1].get("name"),
        snapshot.data.child.v.aList.children[1].name.v,
        "second child has correct name"
    );
    t.ok(
        children[0].get("oldProp") instanceof ACustomClass,
        "list child legacy prop is right type"
    );
});

class ACustomClass extends quip.apps.Record {}

class ListChild extends quip.apps.Record {
    static getProperties() {
        return {
            name: "string",
        };
    }
}

class ChildRecord extends quip.apps.Record {
    static getProperties() {
        return {
            aString: "string",
            anObject: "object",
            aList: quip.apps.RecordList.Type(ListChild),
        };
    }
}

class Root extends quip.apps.RootRecord {
    static getProperties() {
        return {
            rootName: "string",
            child: ChildRecord,
        };
    }
}

const snapshot = {
    "element_config_id": "test",
    "height": 420,
    "width": 800,
    "local_id": "test",
    "data_version": 0,
    "creation_usec": 1579287440630000,
    "template_params": "",
    "is_template": false,
    "data": {
        "rootName": {
            "t": 0,
            "v": "My Root Name",
        },
        "sibling": {
            "t": 1,
            "v": {},
        },
        "child": {
            "t": 1,
            "v": {
                "oldProp": {
                    "t": 1,
                    "v": {},
                },
                "aString": {
                    "t": 0,
                    "v": "foo",
                },
                "anObject": {
                    "t": 0,
                    "v": {"key": "val"},
                },
                "aList": {
                    "t": 2,
                    "v": {
                        "itemConstructorKey": {
                            "t": 0,
                            "v": "listChild",
                        },
                        "itemRecordType": {
                            "t": 0,
                            "v": 0,
                        },
                    },
                    "children": [
                        {
                            "name": {
                                "t": 0,
                                "v": "thing one",
                            },
                            "oldProp": {
                                "t": 1,
                                "v": {},
                            },
                        },
                        {
                            "name": {
                                "t": 0,
                                "v": "thing two",
                            },
                        },
                    ],
                },
            },
        },
    },
};
