// Copyright 2019 Quip

class Preferences {
    constructor() {
        this.values = {preferences: {}};
    }
    clear() {}
    getAll() {
        return this.values.preferences;
    }
    getForKey(key) {
        return this.values.preferences[key];
    }
    save() {}
}

module.exports = Preferences;
