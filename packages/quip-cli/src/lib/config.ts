import fs from "fs";
import os from "os";
import path from "path";
import {pathExists} from "./util";

interface QLAConfig {
    accessToken?: string;
}

export const defaultConfigPath = () => path.join(os.homedir(), ".quiprc");

export const writeConfig = (config: QLAConfig, configPath: string) => {
    return fs.promises.writeFile(
        configPath,
        JSON.stringify(config, null, 2),
        "utf-8"
    );
};

export const readConfig = async (configPath: string) => {
    if (!(await pathExists(configPath))) {
        return {_exists: false};
    }
    const configStr = (await fs.promises.readFile(
        configPath,
        "utf-8"
    )) as string;
    try {
        return Object.assign({_exists: true}, JSON.parse(configStr));
    } catch (e) {
        throw new Error(`Corrupted config: ${e.message}`);
    }
};
