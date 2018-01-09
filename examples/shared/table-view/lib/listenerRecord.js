export default class ListenerRecord extends quip.apps.Record {
    initialize(...args) {
        super.initialize(...args);
        this.notifyParent();
    }

    notifyParent() {
        const parent = this.getParentRecord();
        if (parent) {
            const listener = () => parent.notifyListeners();
            this.listen(listener);
            this._unlistenParent = () => this.unlisten(listener);
        }
    }

    delete() {
        super.delete();
        if (typeof this._unlistenParent === "function") {
            setTimeout(() => this._unlistenParent(), 1);
        }
    }
}
