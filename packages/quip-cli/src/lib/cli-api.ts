import chalk from "chalk";
import FormData from "form-data";
import https from "https";
import fetch from "node-fetch";
import { login } from "../commands/login";
import { readConfig, SKIP_SSL_FOR_SITES } from "../lib/config";
import { println } from "../lib/print";

interface ErrorResponse {
    error: string;
    response?: string;
}

interface AppVersionResponse {
    created_sequence: number;
    version_number: number;
    version_name: string;
    released: string;
}

export interface AppVersionsResponse {
    name: string;
    release?: AppVersionResponse;
    development?: AppVersionResponse;
    versions: AppVersionResponse[];
}

export interface AppListInfo {
    name: string;
    id: string;
}

interface ReleasableVersionReponse {
    created_sequence: number;
    version_number: number;
    version_name: string;
}

export interface ReleasableVersionsReponse {
    name: string;
    versions: ReleasableVersionReponse[];
}

export interface ReleaseAppResponse {
    destination: string;
    version_number: number;
    version_name: string;
    build_sequence: number;
}

export interface AppsListResponse {
    released: AppListInfo[];
    development: AppListInfo[];
    disabled: AppListInfo[];
}

const isError = (response: any): response is ErrorResponse =>
    response && response.error;

export const getStateString = () =>
    `${new Date().getTime()}${process.env.USER}`;

export const successOnly = async <T extends Object>(
    promise: Promise<T | ErrorResponse>,
    printJson: boolean
): Promise<T | false> => {
    let response: T | ErrorResponse;
    try {
        response = await promise;
    } catch (e) {
        response = { error: "Request Failed:", response: e.message };
    }
    if (printJson) {
        println(JSON.stringify(response));
    } else if (isError(response)) {
        println(chalk`{red ${response.error}}`);
        if (response.response) {
            println(chalk`{red ${response.response || ""}}`);
        }
    } else {
        return response;
    }
    return false;
};

const UNAUTHORIZED = "unauthorized";

const cliAPI = async (configPath: string, site: string) => {
    let config = await readConfig(configPath);
    const doAPICall = async <T>(
        path: string,
        method?: "get" | "post",
        data?: { [key: string]: any } | FormData
    ): Promise<T | ErrorResponse> => {
        if (!config.sites[site]) {
            return { error: `Not logged in to ${site}` };
        }
        const { accessToken } = config.sites[site];
        return callAPI<T>(site, path, method, data, accessToken).catch(
            async (e) => {
                if (e.message === UNAUTHORIZED) {
                    return (
                        login({ transparent: true, site })
                            .catch(() => {
                                // if our attempt to transparently login fails, just throw the original error.
                                throw e;
                            })
                            .then(async () => {
                                // successfully logged in. Need to re-read the config.
                                config = await readConfig(configPath);
                            })
                            // TODO: this hangs... not sure why
                            .then(() => doAPICall(path, method, data))
                    );
                } else {
                    throw e;
                }
            }
        );
    };
    return doAPICall;
};

export const platformHost = (site: string) => {
    const siteParts = site.split(".");
    if (site === "staging.quip.com") {
        return "platform-staging.quip.com";
    }
    if (siteParts.length > 2) {
        if (siteParts.slice(-2).join(".") === "onquip.com") {
            return `platform.${siteParts.slice(-3).join(".")}`;
        }
        return `platform.${siteParts.slice(-2).join(".")}`;
    }
    return `platform.${site}`;
};

export const callAPI = async <T = any>(
    site: string,
    path: string,
    method?: "get" | "post",
    data?: { [key: string]: any } | FormData,
    accessToken?: string
): Promise<T | ErrorResponse> => {
    let headers: { [name: string]: string } = {
        "Content-Type": "application/json",
    };
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    let body: string | FormData | undefined;
    if (data?.getHeaders) {
        headers = { ...headers, ...data.getHeaders() };
        body = data as FormData;
    } else if (data) {
        body = JSON.stringify(data);
    }
    const request = await fetch(`https://${platformHost(site)}/cli/${path}`, {
        agent: new https.Agent({
            rejectUnauthorized: SKIP_SSL_FOR_SITES.has(site) ? false : true,
        }),
        method: method || "get",
        body,
        headers,
    });
    if (request.status === 401 || request.status === 400) {
        throw new Error(UNAUTHORIZED);
    }
    const raw = await request.text();
    try {
        return JSON.parse(raw);
    } catch (e) {
        return { error: "Invalid response", response: raw };
    }
};

export default cliAPI;
