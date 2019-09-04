// Copyright 2019 Quip
const test = require("tape");
const Record = require("../record");
const RecordList = require("../record-list");

test("Default Properties", t => {
    t.plan(4);
    class RecordWithDefaults extends Record {}
    RecordWithDefaults.getProperties = () => {
        return {
            aString: "string",
            anObject: "object",
        };
    };
    RecordWithDefaults.getDefaultProperties = () => {
        return {aString: "foo", notExist: "bark"};
    };
    const r = new RecordWithDefaults();
    t.ok(r.get("aString"), "property was defaulted");
    t.equal(r.get("aString"), "foo", "default property is correct");
    t.notOk(r.get("anObject"), "non defaulted property does not exist");
    t.notOk(
        r.get("notExist"),
        "a default value not defined in properties does not exist"
    );
});

test("Setting a Record Value", t => {
    t.plan(3);
    class ChildRecord extends Record {}
    ChildRecord.getProperties = () => {
        return {aString: "string"};
    };
    class RecordWithChild extends Record {}
    RecordWithChild.getProperties = () => {
        return {
            child: ChildRecord,
        };
    };
    const r = new RecordWithChild();
    r.set("child", {aString: "boop"});
    const child = r.get("child");
    t.ok(child, "child has a value");
    t.ok(child instanceof ChildRecord, "child is of the right type");
    t.equal(
        child.get("aString"),
        "boop",
        "child is initialized with the right properties"
    );
});

test("Setting a Record List Value", t => {
    t.plan(5);
    class ChildRecord extends Record {}
    ChildRecord.getProperties = () => {
        return {aString: "string"};
    };
    class RecordWithList extends Record {}
    RecordWithList.getProperties = () => {
        return {
            list: RecordList.Type(ChildRecord),
        };
    };
    const r = new RecordWithList();
    r.set("list", [{aString: "beep"}, {aString: "boop"}]);
    const list = r.get("list");
    t.ok(list, "list has a value");
    t.ok(list instanceof RecordList, "list is of the right type");
    t.equal(list.count(), 2, "list is of the right size");
    t.ok(list.get(0) instanceof ChildRecord, "list item is of the right type");
    t.equal(
        list.get(0).get("aString"),
        "beep",
        "list item is initialized with the right properties"
    );
});
