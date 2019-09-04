// Copyright 2019 Quip

class RecordList {
    constructor(_, RecordConstructor) {
        this.values = {
            id: "mock-record-list",
            records: [],
            isDeleted: false,
        };
        this.recordConstructor_ = RecordConstructor;
    }

    getId() {
        return this.values.id;
    }

    getRecords() {
        return this.values.records;
    }

    count() {
        return this.values.records.length;
    }

    add(value, index) {
        const RecordConstructor = this.recordConstructor_;
        const item = new RecordConstructor();
        item.parent_ = this;
        for (const key in value) {
            item.set(key, value[key]);
        }
        if (index === undefined) {
            this.values.records.push(item);
        } else {
            this.values.records.splice(index, 0, item);
        }
        return item;
    }

    contains(item) {
        return !!this.values.records.find(i => i === item);
    }

    delete() {
        this.values.isDeleted = true;
    }

    get(index) {
        return this.values.records[index];
    }

    indexOf(item) {
        return this.values.records.findIndex(i => i === item);
    }

    isDeleted() {
        this.values.isDeleted;
    }

    move(item, index) {
        const parent = item.parent_;
        if (index < 0) {
            return false;
        }
        if (parent) {
            parent.remove(item);
            this.values.records.splice(index, 0, item);
        }
        return true;
    }

    remove(item) {
        const idx = this.indexOf(item);
        if (idx > -1) {
            this.values.records.splice(idx, 1);
            return true;
        }
        return false;
    }

    listen(listener) {}
    unlisten(listener) {}
}

RecordList.TYPE_SENTINAL = {};

RecordList.Type = RecordConstructor => {
    return {
        TYPE_SENTINAL: RecordList.TYPE_SENTINAL,
        RecordConstructor,
    };
};

module.exports = RecordList;
