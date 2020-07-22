// Copyright 2020 Quip
import quip from "quip-apps-api";

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

function applyRecordSnapshot(
    record: quip.apps.Record,
    data: SnapshotNode,
    legacyTypes: quip.RecordPropertyDefinition = {}
) {
    const statics = record.constructor as typeof quip.apps.Record;
    // Don't allow new defaults to exist on old records.
    // @ts-ignore since we break encapsulation on purpose.
    record.data_ = {};
    const localProperties: quip.RecordPropertyDefinition = {};
    const childProperties: {
        [child: string]: quip.RecordPropertyDefinition;
    } = {};
    // child legacy types are specified using dot notation, so we split these
    // into two buckets: local, and child properties. Local properties are
    // defined on this snapshot, the rest are mapped to their key name.
    for (const [prop, type] of Object.entries(legacyTypes)) {
        const parts = prop.split(".");
        if (parts.length === 1) {
            localProperties[prop] = type;
        } else {
            childProperties[parts[0]] = childProperties[parts[0]] || {};
            childProperties[parts[0]][parts.slice(1).join(".")] = type;
        }
    }
    const recordProps =
        (statics.getProperties && statics.getProperties()) || {};
    const properties: quip.RecordPropertyDefinition = {
        ...recordProps,
        ...localProperties,
    };
    const previousGetProps = statics.getProperties;
    (record.constructor as typeof quip.apps.Record).getProperties = () =>
        properties;
    for (const key in data) {
        const node = data[key];
        const hasType = !!properties[key];
        if (hasType && node && node.t === PropertyType.RECORD) {
            record.clear(key);
            record.set(key, {});
            const child = record.get(key);
            applyRecordSnapshot(child, node.v, childProperties[key]);
        } else if (hasType && node && node.t === PropertyType.RECORD_LIST) {
            record.clear(key);
            record.set(key, []);
            const list = record.get(key);
            const children = node.children;
            if (children) {
                children.forEach(childData => {
                    const child = list.add({});
                    applyRecordSnapshot(child, childData, childProperties[key]);
                });
            }
        } else if (!node || node.t !== PropertyType.RECORD_LIST) {
            record.set(key, node ? node.v : undefined);
        }
    }
    (record.constructor as typeof quip.apps.Record).getProperties = previousGetProps;
}

export default function applySnapshot(
    record: quip.apps.RootRecord,
    snapshot: Snapshot,
    legacyTypes: quip.RecordPropertyDefinition = {}
) {
    const data = snapshot.data;
    applyRecordSnapshot(record, data, legacyTypes);
}
