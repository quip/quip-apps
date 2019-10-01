// Copyright 2019 Quip

export default class Auth {
    public values: {[key: string]: any};
    constructor(client: Client, authConfig: Object) {
        this.values = {};
    }
    login(params: Object): Promise<any> {
        return Promise.reject("Unconfigured Auth");
    }
}
