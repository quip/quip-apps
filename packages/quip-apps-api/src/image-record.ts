import Record from "./record";
import CanvasRecord from "./canvas-record";
import {BlobWithThumbnails} from "./client";

export default class ImageRecord extends Record {
    public canvasRecordValue: CanvasRecord = new CanvasRecord();
    public originalImageHeightValue: number = 0;
    public originalImageWidthValue: number = 0;
    public hasImageValue: boolean = false;

    chooseFile() {}
    commitCrop(
        fractionLeft: number,
        fractionTop: number,
        fractionWidth: number,
        fractionHeight: number,
        cropInitiatedKey?: number
    ) {}
    downloadOriginal() {}
    getCanvasRecord() {
        return this.canvasRecordValue;
    }
    getOriginalImageHeight() {
        return this.originalImageHeightValue;
    }
    getOriginalImageWidth() {
        return this.originalImageWidthValue;
    }
    handleShowFilePickerAction(blobsWithThumbnails: BlobWithThumbnails[]) {}
    handleShowFilePickerActionStarted() {}
    hasImage() {
        return this.hasImageValue;
    }
    openInLightbox() {}
    uploadFile(blob: Blob) {}
}
