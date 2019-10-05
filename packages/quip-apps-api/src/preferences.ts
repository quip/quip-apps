// Copyright 2019 Quip

import Client, {ElementsEventType} from "./client";

enum PreferenceType {
    USER = 0,
    SITE = 1,
}

export default class Preferences {
    constructor(
        client?: Client,
        preferenceType?: PreferenceType,
        eventType?: ElementsEventType,
        rateLimiter?: any, // RateLimiter,
        sizeLimit?: {entries: number; size: number}
    ) {}
    public preferencesValue: {[key: string]: any} = {};
    clear() {}
    getAll() {
        return this.preferencesValue;
    }
    getForKey(key: string) {
        return this.preferencesValue[key];
    }
    save(prefs: {[key: string]: any}) {}
}

module.exports = Preferences;
