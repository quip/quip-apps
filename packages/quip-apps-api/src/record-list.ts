import Record from "./record";
import Client from "./client";

export default class RecordList<T extends Record> {
    public idValue: string = "mock-record-list";
    public recordsValue: T[] = [];
    public isDeletedValue: boolean = false;

    public static TYPE_SENTINAL = {};
    public static Type<T>(RecordConstructor: {new (): T}) {
        return {
            TYPE_SENTINAL: RecordList.TYPE_SENTINAL,
            RecordConstructor,
        };
    }

    private recordConstructor_: {new (): T};

    constructor(client: Client | null, RecordConstructor: {new (): T}) {
        this.recordConstructor_ = RecordConstructor;
    }

    getId() {
        return this.idValue;
    }

    getRecords() {
        return this.recordsValue;
    }

    count() {
        return this.recordsValue.length;
    }

    // TODO: can this conform to valid props for this classes of type T?
    // Probably would need to deprecate getProperties in favor of static
    // properties definition
    add(value: {[key: string]: any}, index?: number, isProgrammatic?: boolean) {
        const RecordConstructor = this.recordConstructor_;
        const item = new RecordConstructor();
        item.initialize();
        item.containingListValue = this;
        for (const key in value) {
            item.set(key, value[key]);
        }
        if (index === undefined) {
            this.recordsValue.push(item);
        } else {
            this.recordsValue.splice(index, 0, item);
        }
        return item;
    }

    contains(item: T) {
        return !!this.recordsValue.find(i => i === item);
    }

    delete(isProgrammaticUpdate?: boolean) {
        this.isDeletedValue = true;
    }

    get(index: number) {
        return this.recordsValue[index];
    }

    indexOf(item: T) {
        return this.recordsValue.findIndex(i => i === item);
    }

    isDeleted() {
        this.isDeletedValue;
    }

    move(item: T, index: number, isProgrammaticUpdate?: boolean) {
        const parent = item.containingListValue;
        if (index < 0) {
            return false;
        }
        if (parent) {
            parent.remove(item);
            this.recordsValue.splice(index, 0, item);
        }
        return true;
    }

    remove(item: T, skipDelete?: boolean, isProgrammaticUpdate?: boolean) {
        const idx = this.indexOf(item);
        if (idx > -1) {
            this.recordsValue.splice(idx, 1);
            return true;
        }
        return false;
    }

    listen(listener: (list: RecordList<T>) => void) {}
    unlisten(listener: (list: RecordList<T>) => void) {}
}

export type listPropertyType<T> = {
    TYPE_SENTINAL: Object;
    RecordConstructor: {new (): T};
};
