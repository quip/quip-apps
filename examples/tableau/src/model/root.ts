import quip from "quip-apps-api";
import {TableauClient} from "./tableau";

export enum ViewSize {
    Auto = "AUTO",
    Desktop = "DESKTOP",
    Tablet = "TABLET",
    Mobile = "MOBILE",
}

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

    tableauClient = new TableauClient();

    getData(): AppData {
        return {
            viewUrl: this.get("viewUrl"),
            size: this.get("size"),
            loggedIn: this.tableauClient.loggedIn,
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
