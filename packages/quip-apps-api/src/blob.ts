// Copyright 2019 Quip

export default class Blob {
    public dataValue?: ArrayBuffer;
    public filenameValue?: string;
    public idValue?: string;
    public hasLoadedDataValue: boolean = false;
    public imageHeightValue: number = 0;
    public imageWidthValue: number = 0;

    getId() {
        return this.idValue;
    }
    id() {
        return this.getId();
    }
    data() {
        return this.getData();
    }
    getData() {
        return this.dataValue;
    }
    downloadAsFile() {}
    filename() {
        return this.getFilename();
    }
    getFilename() {
        return this.filenameValue;
    }
    hasLoadedData() {
        return this.hasLoadedDataValue;
    }
    imageHeight() {
        return this.imageHeightValue;
    }
    imageWidth() {
        return this.imageWidthValue;
    }
    onDataLoaded(
        loadedCallback: (blob: Blob) => void,
        failedCallback?: (blob: Blob) => void
    ) {}
    openInLightbox() {}
    url() {
        // TODO: not sure this type coercion is always safe
        return URL.createObjectURL(
            new window.Blob([this.dataValue as BlobPart])
        );
    }
}
