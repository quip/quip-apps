import quip from "quip-apps-api";
import {QUIP_AUTH_NAME, TABLEAU_BASE_URL} from "../config";

export class TableauClient {
    auth = quip.apps.auth(QUIP_AUTH_NAME) as quip.apps.OAuth2;

    get loggedIn() {
        return this.auth.isLoggedIn();
    }

    async login() {
        return this.auth.login();
    }

    async logout() {
        return this.auth.logout();
    }

    get token() {
        if (this.loggedIn) {
            return this.auth.getTokenResponseParam("access_token");
        }
        return undefined;
    }

    async refreshToken() {
        return this.auth.refreshToken();
    }
}
