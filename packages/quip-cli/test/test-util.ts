import {exec as exec_node} from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

export const exec = util.promisify(exec_node);

export const cleanFixtures = async (alreadyInSubdir: boolean = false) => {
    if (!alreadyInSubdir) {
        process.chdir(path.join(__dirname, "fixtures"));
    }
    return exec("git clean -fd; git checkout .");
};

export const useFixtureDir = (dir: string) => {
    process.chdir(path.join(__dirname, "fixtures", dir));
    return () => {
        process.chdir(path.join(__dirname, "fixtures", dir));
        return cleanFixtures(true);
    };
};
export const readManifestContent = async (dir?: string): Promise<string> => {
    const mPath = dir ? path.join(dir, "manifest.json") : "manifest.json";
    return String(await fs.promises.readFile(mPath, "utf-8"));
};
export const readManifest = async (dir?: string) => {
    const content = await readManifestContent(dir);
    return JSON.parse(content);
};
