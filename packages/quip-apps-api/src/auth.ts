// Copyright 2019 Quip

import Client from "./client";

export default class Auth {
    public values: {[key: string]: any};
    constructor(client: Client, authConfig: Object) {
        this.values = {};
    }
    login(params?: {[name: string]: string}): Promise<boolean> {
        return Promise.reject("Unconfigured Auth");
    }
}
