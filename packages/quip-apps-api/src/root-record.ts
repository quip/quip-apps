import Record, {RecordParams} from "./record";
import ClientError from "./client-error";
import RecordList from "./record-list";

export default class RootRecord extends Record {
    getParent(): Record | undefined {
        throw new ClientError(
            "getParent() is not supported on the root record."
        );
    }

    getParentRecord(): Record | undefined {
        throw new ClientError(
            "getParentRecord() is not supported on the root record."
        );
    }

    getContainingList(): RecordList<any> | undefined {
        throw new ClientError(
            "getContainingList() is not supported on the root record."
        );
    }

    setDeleted() {
        throw new ClientError(
            "setDeleted() is not supported on the root record."
        );
    }

    getPreviousSibling(): Record | undefined {
        throw new ClientError(
            "getPreviousSibling() is not supported on the root record."
        );
    }

    getNextSibling(): Record | undefined {
        throw new ClientError(
            "getNextSibling() is not supported on the root record."
        );
    }

    createSiblingAfter(recordParams: RecordParams): Record {
        throw new ClientError(
            "createSiblingAfter() is not supported on the root record."
        );
    }

    createSiblingBefore(recordParams: RecordParams): Record {
        throw new ClientError(
            "createSiblingBefore() is not supported on the root record."
        );
    }
}
