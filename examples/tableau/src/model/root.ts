import quip from "quip-apps-api";
import {TABLEAU_BASE_URL} from "../config";
import {TableauClient} from "./tableau";

export enum ViewWidth {
    "800px" = 800,
    "900px" = 900,
    "1000px" = 1000,
    "1100px" = 1100,
    "1200px" = 1200,
}

export interface AppData {
    viewUrl: string;
    width: ViewWidth;
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
            width: "number",
        };
    }

    static getDefaultProperties() {
        return {
            width: ViewWidth["1200px"],
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
            width: this.get("width"),
            loggedIn: this.tableauClient.loggedIn,
            selectOpen: this.selectDashboardOpen,
            newDashboardUrl: this.newDashboardUrl,
            token: this.tableauClient.token,
        };
    }

    setViewWidth(width: ViewWidth) {
        this.set("width", width);
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
