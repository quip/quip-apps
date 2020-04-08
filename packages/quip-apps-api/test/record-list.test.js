// Copyright 2019 Quip
const test = require("tape");
const RecordList = require("../dist/record-list").default;
const Record = require("../dist/record").default;

test("Adding a record to a list", t => {
    t.plan(4);
    class MyRecord extends Record {}
    MyRecord.getProperties = () => ({aString: "string"});
    class List extends RecordList {}
    const instance = new List(null, MyRecord);
    instance.add({aString: "bork"});
    t.equal(instance.count(), 1, "adding an item works");
    instance.add({aString: "beak"});
    t.equal(instance.count(), 2, "adding another item works");
    const item = instance.get(1);
    t.ok(item instanceof MyRecord, "item is the right type");
    t.ok(
        item.get("aString", "beak"),
        "item is initialized with the right value"
    );
});

test("Getting all records from a list", t => {
    t.plan(3);
    class MyRecord extends Record {}
    MyRecord.getProperties = () => ({aString: "string"});
    class List extends RecordList {}
    const instance = new List(null, MyRecord);
    instance.add({aString: "bork"});
    instance.add({aString: "beak"});
    const records = instance.getRecords();
    t.equal(records.length, 2);
    const secondRecord = records[1];
    t.ok(secondRecord instanceof MyRecord, "item 2 the right type");
    t.equal(secondRecord.get("aString"), "beak", "item 2 is the right item");
});

test("Adding a record to a list at an index", t => {
    t.plan(3);
    class MyRecord extends Record {}
    MyRecord.getProperties = () => ({aString: "string"});
    class List extends RecordList {}
    const instance = new List(null, MyRecord);
    instance.add({aString: "bork"});
    instance.add({aString: "beak"}, 0);
    instance.add({aString: "bark"}, 2);
    t.equal(instance.count(), 3, "the items are added");
    t.ok(instance.get(0).get("aString", "beak"), "adding at index 0 worked");
    t.ok(instance.get(2).get("aString", "bark"), "adding at index 2 worked");
});

test("Moving a record from one list to another", t => {
    t.plan(3);
    class MyRecord extends Record {}
    MyRecord.getProperties = () => ({aString: "string"});
    class List extends RecordList {}
    const instance1 = new List(null, MyRecord);
    const instance2 = new List(null, MyRecord);
    const record = instance1.add({aString: "bork"});
    instance2.move(record, 0);
    t.equal(instance1.count(), 0, "item was removed from prior list");
    t.equal(instance2.count(), 1, "item was added to new list");
    t.ok(instance2.get(0).get("aString", "bork"), "it's the same item");
});
