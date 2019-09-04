// Copyright 2019 Quip

const RecordList = require("./record-list");
const ClientError = require("./client-error");

class Record {
    constructor() {
        // These values are public so that consumers can set these in tests
        // directly.
        this.values = {
            id: "test-id",
            uniqueId: "test-unique-id",
            isDeleted: false,
            childrenIndex: 0,
            position: "aaa",
            dataVersion: 1,
            parentId: "parent-record-id",
            parent: null, // Record
            parentRecord: null, // Record
            containingList: null, // RecordList
            previousSibling: null,
            nextSibling: null,
            commentCount: 0,
            children: [], // Records
        };
        const propTypes = this.constructor.getProperties();
        let defaultProps = {};
        if ("getDefaultProperties" in this.constructor) {
            defaultProps = this.constructor.getDefaultProperties();
        }
        this.data_ = {};
        for (const key in propTypes) {
            const value = defaultProps[key];
            if (value !== undefined) {
                this.set(key, value);
            }
        }
        this.initialize();
    }

    initialize() {}

    listen(listener) {
        // TODO
    }

    unlisten(listener) {
        // TODO
    }

    getChildrenIndex() {
        return this.values.childrenIndex;
    }

    id() {
        return this.values.id;
    }

    getId() {
        return this.id();
    }

    getUniqueId() {
        return this.values.uniqueId;
    }

    isDeleted() {
        return this.values.isDeleted;
    }

    getData() {
        return this.data_;
    }

    getPosition() {
        return this.values.position;
    }

    get(key) {
        // TODO: this is not exactly accurate for special types
        return this.data_[key];
    }

    has(key) {
        return key in this.data_;
    }

    set(key, value) {
        const propTypes = this.constructor.getProperties();
        const Type = propTypes[key];
        if (Type.prototype instanceof Record) {
            const record = new Type();
            for (const key in value) {
                record.set(key, value[key]);
            }
            value = record;
        } else if (Type.TYPE_SENTINAL === RecordList.TYPE_SENTINAL) {
            const list = new RecordList(null, Type.RecordConstructor);
            if (value) {
                for (const i in value) {
                    list.add(value[i]);
                }
            }
            value = list;
        }
        this.data_[key] = value;
    }

    clear(key, skipDelete) {
        const record = this.data_[key];
        delete this.data_[key];
        if (skipDelete) {
            return record;
        }
    }

    clearData() {
        for (const key in this.data_) {
            this.clear(key);
        }
    }

    setDataVersion(version) {
        this.values.dataVersion = version;
    }

    getParent() {
        return this.values.parent;
    }

    getParentId() {
        return this.values.parentId;
    }

    getParentRecord() {
        return this.values.parentRecord;
    }

    getContainingList() {
        return this.values.containingList;
    }

    setDeleted() {}

    delete() {
        this.values.isDeleted = true;
    }

    getPreviousSibling() {
        return this.values.previousSibling;
    }

    getNextSibling() {
        return this.values.nextSibling;
    }

    createSiblingBefore() {}

    createSiblingAfter() {}

    getChildren() {
        return this.values.children;
    }
    getCommentCount() {
        return this.values.commentCount;
    }
    getDataVersion() {
        return this.values.dataVersion;
    }
    getDom() {
        throw new ClientError(
            "Please override getDom() to return the DOM node for this " +
                "Record instance."
        );
    }
    isHighlightHidden() {
        return this.values.isHighlightHidden;
    }
    listenToComments(listener) {}
    notifyListeners() {
        // TODO: this should probably trigger something to better simulate prod
    }
    setOrphanedState() {}
    supportsComments() {
        // override to change this
        return false;
    }
    unlistenToComments(listener) {}
}

module.exports = Record;
