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

export enum FilterType {
    RelativeDate,
    Range,
    Simple,
}

export enum PeriodType {
    Year = "year",
    Quarter = "quarter",
    Month = "month",
    Week = "week",
    Day = "day",
    Hour = "hour",
    Minute = "minute",
    Second = "second",
}

export enum RangeType {
    Last = "last",
    LastN = "lastn",
    Next = "next",
    NextN = "nextn",
    Current = "current",
    ToDate = "todate",
}

interface FilterData {
    id: string;
    name: string;
    type: FilterType;
    active: boolean;
}

export type SimpleFilterData = FilterData & {
    value: {
        value: string;
    };
};

export type RangeFilterData = FilterData & {
    value: {
        min?: string;
        max?: string;
        showNull: boolean;
    };
};

export type RelativeDateFilterData = FilterData & {
    value: {
        periodType: PeriodType;
        rangeType: RangeType;
        rangeN?: number;
        anchorDate?: string;
    };
};

export type Filter =
    | SimpleFilterData
    | RangeFilterData
    | RelativeDateFilterData;

export interface AppData {
    viewUrl: string;
    width: ViewWidth;
    loggedIn: boolean;
    selectOpen: boolean;
    newDashboardUrl: string;
    token?: string;
    filters: Filter[];
}

export class RootEntity extends quip.apps.RootRecord {
    static ID = "tableau";

    static getProperties() {
        return {
            viewUrl: "string",
            width: "number",
            filters: quip.apps.RecordList.Type(TableauFilter),
        };
    }

    static getDefaultProperties() {
        return {
            width: ViewWidth["1200px"],
            filters: [],
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

    private getFilters(): Filter[] {
        const filterRecords = this.get(
            "filters"
        ).getRecords() as TableauFilter[];
        return filterRecords.map((record) => record.getData());
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
            filters: this.getFilters(),
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
        this.clearFilters();
        this.clearParameters();
        this.closeSelectDashboard();
    }

    clearFilters() {
        this.get("filters").delete();
        this.clear("filters");
        this.set("filters", []);
    }

    clearParameters() {
        // this.get("filters").delete();
        // this.set("filters", []);
    }

    openInTableau() {
        const viewUrl: string = this.get("viewUrl");
        if (viewUrl) {
            quip.apps.openLink(viewUrl);
        }
    }

    setFilter(
        id: string,
        type: FilterType,
        name: string,
        active: boolean,
        value: {[key: string]: any}
    ) {
        // Check if filter already exists.
        const filterRecords = this.get(
            "filters"
        ).getRecords() as TableauFilter[];
        const foundRecord = filterRecords.find(
            (record) => record.get("id") === id
        );

        if (foundRecord) {
            // If so, update
            foundRecord.set("active", active);
            foundRecord.set("value", value);
        } else {
            // If not, create
            this.get("filters").add({
                id,
                name,
                value,
                type,
                active,
            });
        }
        // TODO: Do not notify listeners to avoid the dashboard reloading?!
        this.notifyListeners();
    }
}

export class TableauFilter extends quip.apps.Record {
    static ID = "tableau-filter";

    static getProperties() {
        return {
            id: "string",
            name: "string",
            value: "object",
            type: "number",
            active: "boolean",
        };
    }

    static getDefaultProperties() {
        return {
            active: true,
        };
    }

    getData(): Filter {
        return {
            id: this.get("id"),
            name: this.get("name"),
            value: this.get("value"),
            type: this.get("type"),
            active: this.get("active"),
        };
    }
}
