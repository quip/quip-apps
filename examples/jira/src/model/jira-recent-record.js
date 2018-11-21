// Copyright 2017 Quip

export class JiraRecentEntity extends quip.apps.Record {
    static ID = "recent";

    static getProperties() {
        return {
            recordId: "string",
            key: "string",
            summary: "string",
        };
    }

    getJiraId() {
        return this.get("recordId");
    }

    getKey() {
        return this.get("key");
    }

    getSummary() {
        return this.get("summary");
    }
}
