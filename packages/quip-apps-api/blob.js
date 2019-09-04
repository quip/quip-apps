// Copyright 2019 Quip

class Blob {
    constructor() {
        this.values = {
            data: null, // ArrayBuffer
            filename: null,
            id: null,
            hasLoadedData: false,
            imageHeight: 0,
            imageWidth: 0,
        };
    }
    getId() {
        return this.values.id;
    }
    id() {
        return this.getId();
    }
    data() {
        return this.getData();
    }
    getData() {
        return this.values.data;
    }
    downloadAsFile() {}
    filename() {
        return this.getFilename();
    }
    getFilename() {
        return this.values.filename;
    }
    hasLoadedData() {
        return this.values.hasLoadedData;
    }
    imageHeight() {
        return this.values.imageHeight;
    }
    imageWidth() {
        return this.values.imageWidth;
    }
    onDataLoaded(loadedCallback, failedCallback) {}
    openInLightbox() {}
    url() {
        return URL.createObjectURL(new window.Blob([this.values.data]));
    }
}

module.exports = Blob;
