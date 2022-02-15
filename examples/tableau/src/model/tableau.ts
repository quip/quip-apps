import quip from "quip-apps-api";
import jwtDecode, {JwtPayload} from "jwt-decode";
import {OAUTH2_CUSTOM_SCOPES, QUIP_AUTH_NAME} from "../config";

const BUFFER = 60000; // delay to ensure tokens actually are ready for refresh

export class TableauClient {
    auth = quip.apps.auth(QUIP_AUTH_NAME) as quip.apps.OAuth2;

    private nextTokenCheck_: number | undefined;
    private tokenSubscribers_: Set<() => void> = new Set();

    constructor() {
        this.maintainTokenValidity();
    }

    get loggedIn() {
        return this.auth.isLoggedIn();
    }

    private async maintainTokenValidity() {
        console.log("Checking token validity");
        if (this.nextTokenCheck_) {
            clearTimeout(this.nextTokenCheck_);
            this.nextTokenCheck_ = undefined;
        }

        if (this.auth.isLoggedIn()) {
            // check expiration
            const jwt = this.auth.getTokenResponseParam("access_token");
            const payload = jwtDecode<JwtPayload>(jwt);
            const ttl = (payload.exp ?? 0) * 1000 - Date.now() - BUFFER; // ms till expiry

            if (ttl > 0) {
                this.nextTokenCheck_ = window.setTimeout(async () => {
                    await this.maintainTokenValidity();
                }, ttl);
            } else {
                await this.refreshToken();
            }
        }
    }

    async login() {
        const customParams: {[key: string]: string} = {};
        if (OAUTH2_CUSTOM_SCOPES) {
            customParams.scope = OAUTH2_CUSTOM_SCOPES;
        }
        await this.auth.login(customParams);
        this.notifyTokenSubscribers();
        await this.maintainTokenValidity();
    }

    async logout() {
        await this.auth.logout();
        this.notifyTokenSubscribers();
        clearTimeout(this.nextTokenCheck_);
        this.nextTokenCheck_ = undefined;
    }

    get token() {
        if (this.loggedIn) {
            const token = this.auth.getTokenResponseParam("access_token");
            // Refresh token after each use
            this.refreshToken(); // it's async, don't wait for it to be refreshed...
            return token;
        }
        return undefined;
    }

    private async refreshToken() {
        try {
            await this.auth.refreshToken();
            this.notifyTokenSubscribers();
            await this.maintainTokenValidity();
        } catch (err) {
            console.log("Something went wrong with token refresh", err);
            await this.logout();
        }
    }

    subscribeToTokenUpdates(callback: () => void) {
        if (!this.tokenSubscribers_.has(callback)) {
            this.tokenSubscribers_.add(callback);
        }
    }

    private notifyTokenSubscribers() {
        this.tokenSubscribers_.forEach((callback) => callback());
    }
}
