import fs from "fs";
import os from "os";
import path from "path";
import {pathExists} from "./util";

interface QLAConfigSite {
    accessToken: string;
}
interface QLAConfig {
    _exists: boolean;
    sites: {
        [hostname: string]: QLAConfigSite;
    };
}

export const defaultConfigPath = () => path.join(os.homedir(), ".quiprc");

export const writeSiteConfig = async (
    configPath: string,
    site: string,
    config: QLAConfigSite
) => {
    const qlaConfig = await readConfig(configPath);
    qlaConfig.sites[site] = config;
    writeConfig(configPath, qlaConfig);
};

const writeConfig = (configPath: string, config: QLAConfig) => {
    delete config._exists;
    return fs.promises.writeFile(
        configPath,
        JSON.stringify(config, null, 2),
        "utf-8"
    );
};

export const readConfig = async (configPath: string): Promise<QLAConfig> => {
    if (!(await pathExists(configPath))) {
        return {_exists: false, sites: {}};
    }
    const configStr = (await fs.promises.readFile(
        configPath,
        "utf-8"
    )) as string;
    try {
        const config = Object.assign({_exists: true}, JSON.parse(configStr));
        config.sites = config.sites || {};
        return config;
    } catch (e) {
        throw new Error(`Corrupted config: ${e.message}`);
    }
};
