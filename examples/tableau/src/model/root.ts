import quip from "quip-apps-api";

export interface AppData {
    viewUrl: string;
}

export class RootEntity extends quip.apps.RootRecord {
    static ID = "tableau";

    static getProperties() {
        return {
            viewUrl: "string",
        };
    }

    static getDefaultProperties() {
        return {};
    }

    getData(): AppData {
        return {
            viewUrl: this.get("viewUrl"),
        };
    }

    getActions() {
        return {
            // onToggleHighlight: () => {
            //     this.isHighlighted_ = !this.isHighlighted_;
            //     this.notifyListeners();
            // },
        };
    }
}
