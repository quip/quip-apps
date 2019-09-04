// Copyright 2019 Quip

class RecordIndex {
    constructor() {
        this.values = {
            id: "mock-record-index",
            entries: [],
        };
    }
    count() {
        return this.values.entries.length;
    }
    id() {
        return this.values.id;
    }
    listen(listener) {}
    unlisten(listener) {}
}

module.exports = RecordIndex;
