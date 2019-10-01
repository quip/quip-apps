// Copyright 2019 Quip

const Record = require("./record");
const CanvasRecord = require("./canvas-record");

class ImageRecord extends Record {
    constructor(...args) {
        super(...args);
        this.values.canvasRecord = new CanvasRecord();
        this.values.originalImageHeight = 0;
        this.values.originalImageWidth = 0;
        this.values.hasImage = false;
    }
    chooseFile() {}
    commitCrop() {}
    downloadOriginal() {}
    getCanvasRecord() {
        return this.values.canvasRecord;
    }
    getOriginalImageHeight() {
        return this.values.originalImageHeight;
    }
    getOriginalImageWidth() {
        return this.values.originalImageWidth;
    }
    handleShowFilePickerAction() {}
    handleShowFilePickerActionStarted() {}
    hasImage() {
        return this.values.hasImage;
    }
    openInLightbox() {}
    uploadFile() {}
}

module.exports = ImageRecord;
