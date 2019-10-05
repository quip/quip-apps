// Copyright 2019 Quip

import Record from "./record";

class CanvasRecordCommentAnchorRecord extends Record {
    public xFractionValue: number = 0;
    public yFractionValue: number = 0;

    getXFraction() {
        return this.xFractionValue;
    }
    getYFraction() {
        return this.yFractionValue;
    }
}

export default class CanvasRecord extends Record {
    public static CommentAnchorRecord = CanvasRecordCommentAnchorRecord;
    commitCrop() {}
}
