// Copyright 2018 Quip

export default class RootRecord extends quip.apps.RootRecord {
    static getProperties() {
        return {
            equation: quip.apps.RichTextRecord,
            size: "string",
            align: "string",
        };
    }

    static getDefaultProperties = () => ({
        equation: {},
        size: "medium",
        align: "left",
    })
}
