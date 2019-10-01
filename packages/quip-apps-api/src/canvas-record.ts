// Copyright 2019 Quip

const Record = require("./record");

class CanvasRecord extends Record {
    constructor(...args) {
        super(...args);
    }
    commitCrop() {}
}

class CanvasRecordCommentAnchorRecord extends Record {
    constructor(...args) {
        super(...args);
        this.values.xFraction = 0;
        this.values.yFraction = 0;
    }
    getXFraction() {
        return this.values.xFraction;
    }
    getYFraction() {
        return this.values.yFraction;
    }
}

CanvasRecord.CommentAnchorRecord = CanvasRecordCommentAnchorRecord;

module.exports = CanvasRecord;
