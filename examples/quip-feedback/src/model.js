// Copyright 2017 Quip

import quip from "quip";

import ListenerRecord from "./listenerRecord";
import {updateToolbar} from "./root.jsx";

class Root extends quip.apps.RootRecord {
    static CONSTRUCTOR_KEY = "Root";
    static DATA_VERSION = 2;

    static getProperties = () => ({
        rows: quip.apps.RecordList.Type(Row),
    });

    static getDefaultProperties = () => ({
        rows: [...Array(1)].map((__, index) => Row.getDefaultProperties(index)),
    });

    supportsComments() {
        return false;
    }

    seed() {
        const defaultValues = this.constructor.getDefaultProperties();

        // These have to be seeded too since the connect function relies
        // on these being set on the record for first render
        Object.keys(defaultValues).forEach(key => {
            this.set(key, defaultValues[key]);
        });
    }

    addRow() {
        const rows = this.getRows();
        const last = rows[rows.length - 1];

        this.get("rows").add(Row.getDefaultProperties());
    }

    deleteRows(rowIds) {
        const rows = this.getRows();
        rows.forEach(row => {
            console.log("row", row.getId(), rowIds);
            if (rowIds.indexOf(row.getId()) !== -1) {
                row.delete();
            }
        });
    }

    getRows() {
        return this.get("rows").getRecords();
    }
}

class Row extends ListenerRecord {
    static CONSTRUCTOR_KEY = "Row";
    static DATA_VERSION = 2;

    static getProperties = () => ({
        createdAt: "number",
        person: quip.apps.RichTextRecord,
        thread_id: "string",
        thread_title: "string",
        thread_created_usec: "number",
        thread_updated_usec: "number",
    });

    static getDefaultProperties = () => ({
        createdAt: new Date().getTime(),
        person: {
            RichText_placeholderText: quiptext("@Person"),
        },
        thread_id: "",
        thread_created_usec: null,
        thread_updated_usec: null,
        thread_title: "",
    });

    getDom() {
        return this._domNode;
    }

    setDom(node) {
        this._domNode = node;
    }

    supportsComments() {
        return true;
    }

    delete() {
        super.delete();
    }
}

export default () => {
    const classes = [Root, Row];
    classes.forEach(c => quip.apps.registerClass(c, c.CONSTRUCTOR_KEY));
};

export function login() {
    const auth = quip.apps.auth("quip-automation-api");
    auth.login().then(
        () => {
            const token = auth.getTokenResponse();
            console.debug("login token", {token});
            const prefs = quip.apps.getUserPreferences();
            prefs.save({token});
            updateToolbar();
        },
        error => {
            console.error("ERROR in login", error);
        }
    );
}

export async function refreshToken() {
    const auth = quip.apps.auth("quip-automation-api");
    await auth.refreshToken();
    const token = auth.getTokenResponse();
    console.debug("refreshToken", {token});
    //const prefs = quip.apps.getUserPreferences();
    //prefs.save({token});
}

export function logout() {
    let prefs = quip.apps.getUserPreferences();
    prefs.save({token: null});
    const auth = quip.apps.auth("quip-automation-api");
    auth.logout().then(
        () => {
            console.debug("ok, logged out");
            updateToolbar();
        },
        error => {
            console.error("ERROR in logout", error);
        }
    );
}
