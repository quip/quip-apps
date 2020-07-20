import {readConfig} from "./config";

export const isLoggedIn = async (configPath: string, site: string) => {
    const {sites} = await readConfig(configPath);
    return !!sites[site]?.accessToken;
};
