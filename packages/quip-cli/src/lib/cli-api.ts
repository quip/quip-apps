import https from "https";
import fetch from "node-fetch";
import {readConfig, SKIP_SSL_FOR_SITES} from "../lib/config";

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

export const isError = (response: any): response is ErrorResponse =>
    response && response.error;

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
