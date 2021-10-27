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
    selectOpen: boolean;
    newDashboardUrl: string;
    token?: string;
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

    private selectDashboardOpen = false;
    private newDashboardUrl = "";

    getData(): AppData {
        return {
            viewUrl: this.get("viewUrl"),
            size: this.get("size"),
            loggedIn: this.tableauClient.loggedIn,
            selectOpen: this.selectDashboardOpen,
            newDashboardUrl: this.newDashboardUrl,
            token: this.tableauClient.token,
        };
    }

    setViewSize(size: ViewSize) {
        this.set("size", size);
    }

    async login() {
        await this.tableauClient.login();
        if (!this.get("viewUrl")) {
            this.openSelectDashboard();
        }
        this.notifyListeners();
    }

    async logout() {
        await this.tableauClient.logout();
        this.notifyListeners();
    }

    async refreshToken() {
        try {
            await this.tableauClient.refreshToken();
            this.notifyListeners();
        } catch (err) {
            console.log("Token refresh failed");
            await this.logout();
        }
    }

    openSelectDashboard() {
        this.selectDashboardOpen = true;
        this.newDashboardUrl = "";
        this.notifyListeners();
    }

    closeSelectDashboard() {
        this.selectDashboardOpen = false;
        this.newDashboardUrl = "";
        this.notifyListeners();
    }

    setNewDashboardUrl(url: string) {
        this.newDashboardUrl = url;
        this.notifyListeners();
    }

    setNewDashboard() {
        this.set("viewUrl", this.newDashboardUrl);
        this.closeSelectDashboard();
    }
}
