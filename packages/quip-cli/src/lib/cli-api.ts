import chalk from "chalk";
import https from "https";
import fetch from "node-fetch";
import {readConfig, SKIP_SSL_FOR_SITES} from "../lib/config";
import {println} from "../lib/print";

interface ErrorResponse {
    error: string;
    response: string;
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
    json: boolean
): Promise<T | false> => {
    let response: T | ErrorResponse;
    try {
        response = await promise;
    } catch (e) {
        response = {error: "Failed:", response: e.message};
    }
    if (json) {
        println(JSON.stringify(response));
    } else if (isError(response)) {
        println(chalk`
{red Error: ${response.error}}
{red ${response.response}}`);
    } else {
        return response;
    }
    return false;
};

const cliAPI = async (configPath: string, site: string) => {
    const config = await readConfig(configPath);
    if (!config.sites[site]) {
        throw new Error(`Not logged in to ${site}`);
    }
    return async <T>(
        path: string,
        method?: "get" | "post",
        body?: {[key: string]: any}
    ): Promise<T | ErrorResponse> => {
        const {accessToken} = config.sites[site];

        const request = await fetch(`https://platform.${site}/cli/${path}`, {
            agent: new https.Agent({
                rejectUnauthorized: SKIP_SSL_FOR_SITES.has(site) ? false : true,
            }),
            method: method || "get",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
        });
        const raw = await request.text();
        try {
            return JSON.parse(raw);
        } catch (e) {
            return {error: "Invalid response", response: raw};
        }
    };
};
export default cliAPI;
