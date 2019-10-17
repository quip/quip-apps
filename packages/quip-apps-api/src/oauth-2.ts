// Copyright 2019 Quip

import BaseOAuth, {HttpResponse} from "./base-oauth";

export default class OAuth2 extends BaseOAuth {
    public refreshTokenResponseValue: HttpResponse = new HttpResponse();
    refreshToken(): Promise<HttpResponse> {
        return Promise.resolve(this.refreshTokenResponseValue);
    }
}
