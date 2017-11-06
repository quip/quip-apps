export default class ListenerRecord extends quip.apps.Record {
    initialize(...args) {
        super.initialize(...args);
        this.notifyParent();
    }

    notifyParent() {
        const parent = this.getParentRecord();

        if (parent) {
            const listener = this.listen(() => parent.notifyListeners());
            this._unlistenParent = () => this.unlisten(listener);
            if (this.supportsComments()) {
                const commentListener = this.listenToComments(() =>
                    parent.notifyListeners(),
                );
                this._unlistenComments = () => this.unlistenToComments(commentListener);
            }
        }
    }

    delete() {
        if (typeof this._unlistenParent === "function") {
            this._unlistenParent();
        }
        if (typeof this._unlistenComments === "function") {
            this._unlistenComments();
        }
        super.delete();
    }
}
