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

export interface Param {
    id: string;
    name: string;
    value: string;
    active: boolean;
}

export interface AppData {
    viewUrl: string;
    width: ViewWidth;
    loggedIn: boolean;
    selectOpen: boolean;
    newDashboardUrl: string;
    token?: string;
    filters: Filter[];
    params: Param[];
}

export class RootEntity extends quip.apps.RootRecord {
    static ID = "tableau";

    static getProperties() {
        return {
            viewUrl: "string",
            width: "number",
            filters: quip.apps.RecordList.Type(TableauFilter),
            params: quip.apps.RecordList.Type(TableauParam),
        };
    }

    static getDefaultProperties() {
        return {
            width: ViewWidth["1200px"],
            filters: [],
            params: [],
        };
    }

    tableauClient = new TableauClient();

    private selectDashboardOpen = false;
    private newDashboardUrl = "";

    private watchingTokens = false;

    private watchTokens() {
        this.watchingTokens = true;
        this.tableauClient.subscribeToTokenUpdates(() => {
            // No need to update token in UI - Tableau handles session
            // this.notifyListeners();
        });
    }

    private getFilters(): Filter[] {
        const filterRecords = this.get(
            "filters"
        ).getRecords() as TableauFilter[];
        return filterRecords.map((record) => record.getData());
    }

    private getParams(): Param[] {
        const paramRecords = this.get("params").getRecords() as TableauParam[];
        return paramRecords.map((record) => record.getData());
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
            params: this.getParams(),
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
        this.get("params").delete();
        this.clear("params");
        this.set("params", []);
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
            foundRecord.set("name", name);
            foundRecord.set("type", type);
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

    deleteFilter(id: string) {
        const recordList = this.get(
            "filters"
        ) as quip.apps.RecordList<TableauFilter>;
        const filterRecords = recordList.getRecords();
        const recordToDelete = filterRecords.find(
            (record) => record.getData().id === id
        );
        if (recordToDelete) {
            recordList.remove(recordToDelete);
            this.notifyListeners();
        }
    }

    setParam(id: string, name: string, active: boolean, value: string) {
        // Check if filter already exists.
        const paramRecords = this.get("params").getRecords() as TableauParam[];
        const foundRecord = paramRecords.find(
            (record) => record.get("id") === id
        );

        if (foundRecord) {
            // If so, update
            foundRecord.set("name", name);
            foundRecord.set("active", active);
            foundRecord.set("value", value);
        } else {
            // If not, create
            this.get("params").add({
                id,
                name,
                value,
                active,
            });
        }
        // TODO: Do not notify listeners to avoid the dashboard reloading?!
        this.notifyListeners();
    }

    deleteParam(id: string) {
        const recordList = this.get(
            "params"
        ) as quip.apps.RecordList<TableauParam>;
        const paramRecords = recordList.getRecords();
        const recordToDelete = paramRecords.find(
            (record) => record.getData().id === id
        );
        if (recordToDelete) {
            recordList.remove(recordToDelete);
            this.notifyListeners();
        }
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

export class TableauParam extends quip.apps.Record {
    static ID = "tableau-param";

    static getProperties() {
        return {
            id: "string",
            name: "string",
            value: "string",
            active: "boolean",
        };
    }

    static getDefaultProperties() {
        return {
            active: true,
        };
    }

    getData(): Param {
        return {
            id: this.get("id"),
            name: this.get("name"),
            value: this.get("value"),
            active: this.get("active"),
        };
    }
}
