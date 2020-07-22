import quip from "quip-apps-api";

export class RootEntity extends quip.apps.RootRecord {
    static ID = "example";

    initialize() {
        this.isHighlighted_ = false;
    }
    static getProperties() {
        return {};
    }
    static getDefaultProperties() {
        return {};
    }
    getData() {
        return {isHighlighted: this.isHighlighted_};
    }
    getActions() {
        return {
            onToggleHighlight: () => {
                this.isHighlighted_ = !this.isHighlighted_;
                this.notifyListeners();
            },
        };
    }
}
