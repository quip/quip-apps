// Copyright 2019 Quip

class User {
    constructor() {
        this.values = {
            firstName: "Mock",
            id: "mock-user",
            name: "Mock User",
            language: "en",
        };
    }
    id() {
        return this.getId();
    }
    getId() {
        return this.values.id;
    }
    getFirstName() {
        return this.values.firstName;
    }
    getLanguage() {
        return this.values.language;
    }
    getName() {
        return this.values.name;
    }
}

module.exports = User;
