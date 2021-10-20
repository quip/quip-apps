import quip from "quip-apps-api";
import {tableauAuth, ViewSize} from "./tableau";

export interface AppData {
    viewUrl: string;
    size: ViewSize;
    loggedIn: boolean;
}

export class RootEntity extends quip.apps.RootRecord {
    static ID = "tableau";

    static getProperties() {
        return {
            viewUrl: "string",
            size: "string",
        };
    }

    static getDefaultProperties() {
        return {
            size: ViewSize.Auto,
        };
    }

    getData(): AppData {
        return {
            viewUrl: this.get("viewUrl"),
            size: this.get("size"),
            loggedIn: tableauAuth.isLoggedIn(),
        };
    }

    getActions() {
        return {
            onSetViewSize: (size: ViewSize) => {
                this.set("size", size);
            },
        };
    }
}
