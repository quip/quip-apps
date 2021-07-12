import Client from "./client";
import ClientError from "./client-error";
import RecordIndex from "./record-index";
import RecordList, {listPropertyType} from "./record-list";

const RECORD_SENTINAL = {};
export const isRecord = (obj: any): obj is Record =>
    obj.typeSentinal_ === RECORD_SENTINAL;

export type RecordConstructor = {new (): Record};

export enum RecordType {
    "NONE" = 0,
    "RICH_TEXT" = 1,
    "IMAGE" = 2,
    "LIST" = 3,
    "CANVAS" = 4,
    "COMMENT_ANCHOR" = 5,
}

export type RecordParams = {
    data: {[key: string]: any};
    dataVersion?: number;
    constructorKey?: string;
    recordConstructor?: RecordConstructor;
    entityType?: RecordType;
    recordType?: RecordType;
    defaultText?: string;
    requestedThumbnailWidths?: number[];
};

export interface RecordPropertyDefinition {
    [property: string]: string | RecordConstructor | listPropertyType<any>;
}

export default abstract class Record {
    public idValue: string = "test-id";
    public uniqueIdValue: string = "test-unique-id";
    public isDeletedValue: boolean = false;
    public childrenIndexValue: RecordIndex<any> = new RecordIndex();
    public positionValue: string = "aaa";
    public dataVersionValue: number = 1;
    public parentIdValue: string = "parent-record-id";
    public parentValue?: Record;
    public parentRecordValue?: Record;
    public containingListValue?: RecordList<any>;
    public previousSiblingValue?: Record;
    public nextSiblingValue?: Record;
    public commentCountValue: number = 0;
    public childrenValue: Record[] = [];
    public isHighlightHiddenValue?: boolean;

    protected data_: {[key: string]: any} = {};
    static getProperties(): RecordPropertyDefinition {
        return {};
    }
    static getDefaultProperties(): {[property: string]: any} {
        return {};
    }

    protected typeSentinal_: Object;

    constructor(client?: Client, pb?: Object, schema?: any) {
        this.typeSentinal_ = RECORD_SENTINAL;
        const statics = this.constructor as typeof Record;
        const propTypes = statics.getProperties();
        let defaultProps: {[property: string]: any} = {};
        if ("getDefaultProperties" in this.constructor) {
            defaultProps = statics.getDefaultProperties();
        }
        for (const key in propTypes) {
            const value = defaultProps[key];
            if (value !== undefined) {
                this.set(key, value);
            }
        }
    }

    initialize() {}

    listen(listener: (record: Record) => void) {
        // TODO
    }

    unlisten(listener: (record: Record) => void) {
        // TODO
    }

    getChildrenIndex(): RecordIndex<this> {
        return this.childrenIndexValue;
    }

    id() {
        return this.idValue;
    }

    getId() {
        return this.id();
    }

    getUniqueId() {
        return this.uniqueIdValue;
    }

    isDeleted() {
        return this.isDeletedValue;
    }

    getData() {
        return this.data_;
    }

    getPosition() {
        return this.positionValue;
    }

    get(key: string) {
        // TODO: this is not exactly accurate for special types
        return this.data_[key];
    }

    has(key: string) {
        return key in this.data_;
    }

    set(key: string, value: any, isProgrammaticUpdate?: boolean) {
        const statics = this.constructor as typeof Record;
        const propTypes = statics.getProperties();
        const Type = propTypes[key] || "UNKNOWN";
        if (
            typeof Type !== "string" &&
            "prototype" in Type &&
            Type.prototype instanceof Record
        ) {
            const record = new Type();
            for (const key in value) {
                record.set(key, value[key]);
            }
            value = record;
        } else if (
            (Type as listPropertyType<any>).TYPE_SENTINAL ===
            RecordList.TYPE_SENTINAL
        ) {
            const list = new RecordList(
                null,
                (Type as listPropertyType<any>).RecordConstructor
            );
            if (value) {
                for (const i in value) {
                    list.add(value[i]);
                }
            }
            value = list;
        }
        this.data_[key] = value;
    }

    clear(key: string, skipDelete?: boolean, isProgrammaticUpdate?: boolean) {
        const value = this.data_[key];
        delete this.data_[key];
        if (skipDelete && value && (value instanceof Record || value instanceof RecordList)) {
            return value;
        }
    }

    clearData(isProgrammaticUpdate?: boolean) {
        for (const key in this.data_) {
            this.clear(key);
        }
    }

    setDataVersion(version: number, isProgrammaticUpdate?: boolean) {
        this.dataVersionValue = version;
    }

    getParent() {
        return this.parentValue;
    }

    getParentId() {
        return this.parentIdValue;
    }

    getParentRecord() {
        return this.parentRecordValue;
    }

    getContainingList() {
        return this.containingListValue;
    }

    setDeleted(isProgrammaticUpdate?: boolean) {}

    delete(isProgrammaticUpdate?: boolean) {
        this.isDeletedValue = true;
    }

    getPreviousSibling() {
        return this.previousSiblingValue;
    }

    getNextSibling() {
        return this.nextSiblingValue;
    }

    createSiblingBefore(recordParams: RecordParams): Record {
        // TODO:
        throw new Error(
            "createSiblingBefore not yet supported in mock environment"
        );
    }

    createSiblingAfter(recordParams: RecordParams): Record {
        // TODO:
        throw new Error(
            "createSiblingBefore not yet supported in mock environment"
        );
    }

    getChildren() {
        return this.childrenValue;
    }
    getCommentCount() {
        return this.commentCountValue;
    }
    getDataVersion() {
        return this.dataVersionValue;
    }
    getDom(): Element {
        throw new ClientError(
            "Please override getDom() to return the DOM node for this " +
                "Record instance."
        );
    }
    isHighlightHidden() {
        return this.isHighlightHiddenValue;
    }
    listenToComments(listener: (record: Record) => void) {}
    notifyListeners() {
        // TODO: this should probably trigger something to better simulate prod
    }
    setOrphanedState(isProgrammaticUpdate?: boolean) {}
    supportsComments() {
        // override to change this
        return false;
    }
    unlistenToComments(listener: (record: Record) => void) {}
}
