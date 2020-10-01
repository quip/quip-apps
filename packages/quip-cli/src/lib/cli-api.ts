import chalk from "chalk";
import FormData from "form-data";
import https from "https";
import fetch from "node-fetch";
import {readConfig, SKIP_SSL_FOR_SITES} from "../lib/config";
import {println} from "../lib/print";

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
    release: AppVersionResponse;
    development: AppVersionResponse;
    versions: AppVersionResponse[];
}

export interface AppListInfo {
    name: string;
    id: string;
}

export interface AppsListResponse {
    released: AppListInfo[];
    development: AppListInfo[];
    disabled: AppListInfo[];
}

const isError = (response: any): response is ErrorResponse =>
    response && response.error;

export const successOnly = async <T extends Object>(
    promise: Promise<T | ErrorResponse>,
    printJson: boolean
): Promise<T | false> => {
    let response: T | ErrorResponse;
    try {
        response = await promise;
    } catch (e) {
        response = {error: "Failed:", response: e.message};
    }
    if (printJson) {
        println(JSON.stringify(response));
    } else if (isError(response)) {
        println(chalk`
{red Error: ${response.error}}
{red ${response.response || ""}}`);
    } else {
        return response;
    }
    return false;
};

const cliAPI = async (configPath: string, site: string) => {
    const config = await readConfig(configPath);
    return async <T>(
        path: string,
        method?: "get" | "post",
        data?: {[key: string]: any} | FormData
    ): Promise<T | ErrorResponse> => {
        if (!config.sites[site]) {
            return {error: `Not logged in to ${site}`};
        }
        const {accessToken} = config.sites[site];
        return callAPI(site, path, method, data, accessToken);
    };
};

export const platformHost = (site: string) => {
    const subdomainCount = site.split(".").length - 2;
    return subdomainCount > 0 ? `platform-${site}` : `platform.${site}`;
};

export const callAPI = async (
    site: string,
    path: string,
    method?: "get" | "post",
    data?: {[key: string]: any} | FormData,
    accessToken?: string
) => {
    let headers: {[name: string]: string} = {
        "Content-Type": "application/json",
    };
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    let body: string | FormData | undefined;
    if (data?.getHeaders) {
        headers = {...headers, ...data.getHeaders()};
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
    const raw = await request.text();
    try {
        return JSON.parse(raw);
    } catch (e) {
        return {error: "Invalid response", response: raw};
    }
};

export default cliAPI;
