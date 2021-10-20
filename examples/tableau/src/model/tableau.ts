import quip from "quip-apps-api";
import {QUIP_AUTH_NAME} from "../config";

export class TableauClient {
    auth = quip.apps.auth(QUIP_AUTH_NAME) as quip.apps.OAuth2;

    get loggedIn() {
        return this.auth.isLoggedIn();
    }
}
