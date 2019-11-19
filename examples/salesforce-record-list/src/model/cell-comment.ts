// Copyright 2019 Quip

import quip from "quip-apps-api";

/**
 * @fileoverview This class is just used so we can associate comments
 * with record:column pairs.
 */

export interface CellCommentProperties {
    recordId: string;
    columnName: string;
}

export default class CellComment extends quip.apps.Record {
    static ID = "salesforceListCellComment";
    static DATA_VERSION = 1;

    private domInstance_: Node;

    static getProperties() {
        return {
            recordId: "string",
            columnName: "string",
        };
    }

    isFor(recordId: string, columnName: string) {
        return (
            this.get("recordId") === recordId &&
            this.get("columnName") === columnName
        );
    }

    initialize() {}

    getDom() {
        return this.domInstance_;
    }

    setDom(instance: Node) {
        this.domInstance_ = instance;
    }

    supportsComments() {
        return !!this.domInstance_;
    }
}
