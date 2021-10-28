import quip from "quip-apps-api";
import {TABLEAU_BASE_URL} from "../config";
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

    private watchingTokens = false;

    private watchTokens() {
        this.watchingTokens = true;
        this.tableauClient.subscribeToTokenUpdates(() => {
            this.notifyListeners();
        });
    }

    getData(): AppData {
        if (!this.watchingTokens) {
            this.watchTokens();
        }

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
        const viewPath = this.newDashboardUrl.match(/\/views[^\?]*/);
        if (viewPath) {
            const url = `${TABLEAU_BASE_URL}${viewPath[0]}`;
            this.set("viewUrl", url);
        } else {
            this.set("viewUrl", this.newDashboardUrl);
        }
        this.closeSelectDashboard();
    }

    openInTableau() {
        const viewUrl: string = this.get("viewUrl");
        if (viewUrl) {
            quip.apps.openLink(viewUrl);
        }
    }
}
