// Copyright 2017 Quip
/* @flow */

import quip from "quip";
quip.elements.enableDataModelV2();

class RootRecord extends quip.elements.RootRecord {
    static CONSTRUCTOR_KEY = "Root";

    static getProperties = () => ({
        steps: quip.elements.RecordList.Type(StepRecord),
        selected: "string",
        color: "string",
    });

    static getDefaultProperties = () => ({
        steps: [],
        selected: "",
        color: quip.elements.ui.ColorMap.VIOLET.KEY,
    });

    seed() {
        const defaultValues = this.constructor.getDefaultProperties();

        // These have to be seeded too since the connect function relies
        // on these being set on the record for first render
        Object.keys(defaultValues).forEach((key, i) => {
            this.set(key, defaultValues[key]);
        });
        [...Array(3)].map((_, i) => {
            let step = this.get("steps").add({});
            if (i === 0) {
                this.set("selected", step.getId());
            }
        });
    }
}

class StepRecord extends quip.elements.RichTextRecord {
    domNode: ?HTMLElement;
    static CONSTRUCTOR_KEY = "Step";

    static getProperties() {
        return {};
    }

    static getDefaultProperties() {
        return {
            RichText_placeholderText: "New Step",
        };
    }

    initialize(...args) {
        super.initialize(...args);
        this.notifyParent();
    }

    supportsComments() {
        return true;
    }

    getDom() {
        return this.domNode;
    }

    setDom(el: ?HTMLElement) {
        this.domNode = el;
    }

    notifyParent() {
        const parent = this.getParentRecord();

        if (parent) {
            const listener = this.listen(() => parent.notifyListeners());
            this._unlistenParent = () => this.unlisten(listener);
            const commentListener = this.listenToComments(() =>
                parent.notifyListeners(),
            );
            this._unlistenComments = () => this.unlistenToComments(commentListener);
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

export default () => {
    const classes = [RootRecord, StepRecord];
    classes.forEach(c => quip.elements.registerClass(c, c.CONSTRUCTOR_KEY));
};
