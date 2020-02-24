// Copyright 2020 Quip
import Record from "../record";
import RootRecord from "../root-record";

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
    const statics = record.constructor as typeof Record;
    // Don't allow new defaults to exist on old records.
    // @ts-ignore since we break encapsulation on purpose.
    record.data_ = {};
    const properties = statics.getProperties();
    for (const key in data) {
        const node = data[key];
        const hasType = !!properties[key];
        if (hasType && node && node.t === PropertyType.RECORD) {
            record.clear(key);
            record.set(key, {});
            const child = record.get(key);
            applyRecordSnapshot(child, node.v);
        } else if (hasType && node && node.t === PropertyType.RECORD_LIST) {
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
        } else {
            record.set(key, node ? node.v : undefined);
        }
    }
}

export default function applySnapshot(record: RootRecord, snapshot: Snapshot) {
    const data = snapshot.data;
    applyRecordSnapshot(record, data);
}
