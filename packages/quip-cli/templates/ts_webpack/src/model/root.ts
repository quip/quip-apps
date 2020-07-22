import quip from "quip-apps-api";

export interface AppData {
    isHighlighted: boolean;
}

export class RootEntity extends quip.apps.RootRecord {
    static ID = "example";

    static getProperties() {
        return {};
    }

    private isHighlighted_: boolean = false;

    static getDefaultProperties(): {[property: string]: any} {
        return {};
    }

    getData(): AppData {
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
