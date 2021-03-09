import Record from "./record";

export default class RecordIndex<T extends Record> {
    public idValue: string = "mock-record-index";
    public entriesValue: T[] = [];
    count() {
        return this.entriesValue.length;
    }
    id() {
        return this.idValue;
    }
    listen(listener: (recordIndex: RecordIndex<T>) => void) {}
    unlisten(listener: (recordIndex: RecordIndex<T>) => void) {}
}
