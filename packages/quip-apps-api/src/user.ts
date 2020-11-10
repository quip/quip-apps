// Copyright 2019 Quip

export default class User {
    firstNameValue: string = "Mock";
    idValue: string = "mock-user";
    nameValue: string = "Mock User";
    languageValue: string = "en";
    companyIdValue: string = "HWWAcAP8yS4";

    id() {
        return this.getId();
    }
    getId() {
        return this.idValue;
    }
    getFirstName() {
        return this.firstNameValue;
    }
    getLanguage() {
        return this.languageValue;
    }
    getName() {
        return this.nameValue;
    }
    getCompanyId() {
        return this.companyIdValue;
    }
}
