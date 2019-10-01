// Copyright 2019 Quip

import Client from "./client";

export default class Blob {
    public values: {
        data?: ArrayBuffer;
        filename?: string;
        id?: string;
        hasLoadedData: boolean;
        imageHeight: number;
        imageWidth: number;
    };
    constructor(client: Client, filePb: Object) {
        this.values = {
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
    onDataLoaded(
        loadedCallback: (blob: Blob) => void,
        failedCallback?: (blob: Blob) => void
    ) {}
    openInLightbox() {}
    url() {
        // TODO: not sure this type coercion is always safe
        return URL.createObjectURL(
            new window.Blob([this.values.data as BlobPart])
        );
    }
}
