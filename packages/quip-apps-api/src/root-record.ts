// Copyright 2019 Quip

import Record from "./record";
import ClientError from "./client-error";

export default class RootRecord extends Record {
    getParent() {
        throw new ClientError(
            "getParent() is not supported on the root record."
        );
    }

    getParentRecord() {
        throw new ClientError(
            "getParentRecord() is not supported on the root record."
        );
    }

    getContainingList() {
        throw new ClientError(
            "getContainingList() is not supported on the root record."
        );
    }

    setDeleted() {
        throw new ClientError(
            "setDeleted() is not supported on the root record."
        );
    }

    setPosition(position) {
        throw new ClientError(
            "setPosition() is not supported on the root record."
        );
    }

    setParentIds(parentIds) {
        throw new ClientError(
            "setParentIds() is not supported on the root record."
        );
    }

    getPreviousSibling() {
        throw new ClientError(
            "getPreviousSibling() is not supported on the root record."
        );
    }

    getNextSibling() {
        throw new ClientError(
            "getNextSibling() is not supported on the root record."
        );
    }

    createSiblingAfter(recordParams) {
        throw new ClientError(
            "createSiblingAfter() is not supported on the root record."
        );
    }

    createSiblingBefore(recordParams) {
        throw new ClientError(
            "createSiblingBefore() is not supported on the root record."
        );
    }
}
