// Copyright 2020 Quip
import RootRecord from "../root-record";
import Record from "../record";

enum PropertyType {
    PRIMITIVE = 0,
    RECORD = 1,
    RECORD_LIST = 2,
}

interface SnapshotNode {
    [key: string]: {
        t: PropertyType;
        v: any;
        children?: Array<SnapshotNode>;
    };
}

interface Snapshot {
    data: SnapshotNode;
}

function applyRecordSnapshot(record: Record, data: SnapshotNode) {
    for (let key in data) {
        const node = data[key];
        if (node.t === PropertyType.PRIMITIVE) {
            // Not sure if there's a way to allow deprecation of records and
            // lists, but for primitives you can just delete the key and it
            // should still snapshot ok
            // @ts-ignore since we intentionally violate encapsulation
            record.data_[key] = node.v;
        } else if (node.t === PropertyType.RECORD) {
            record.clear(key);
            record.set(key, {});
            const child = record.get(key);
            applyRecordSnapshot(child, node.v);
        } else if (node.t === PropertyType.RECORD_LIST) {
            record.clear(key);
            record.set(key, []);
            const list = record.get(key);
            const children = node.children;
            if (children) {
                children.forEach(childData => {
                    const child = list.add({});
                    applyRecordSnapshot(child, childData);
                });
            }
        }
    }
}

export default function applySnapshot(record: RootRecord, snapshot: Snapshot) {
    const data = snapshot.data;
    applyRecordSnapshot(record, data);
}
