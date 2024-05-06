import { exec as exec_node } from "child_process";
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

export const getFixtureDir = (dir: string) =>
    path.join(__dirname, "fixtures", dir);

export const useFixtureDir = (dir: string) => {
    process.chdir(getFixtureDir(dir));
    return () => {
        process.chdir(getFixtureDir(dir));
        return cleanFixtures(true);
    };
};
export const readManifestContent = (dir?: string): string => {
    const mPath = dir ? path.join(dir, "manifest.json") : "manifest.json";
    return String(fs.readFileSync(mPath, "utf-8"));
};
export const readManifest = (dir?: string) => {
    const content = readManifestContent(dir);
    return JSON.parse(content);
};
