import fs from "fs";
import path from "path";
import prettier from "prettier";
import {Manifest} from "./types";
import {pathExists} from "./util";

export const findManifest = async (
    dir: string
): Promise<string | undefined> => {
    const files = await fs.promises.readdir(dir);
    const dirs: string[] = [];
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (file === "manifest.json") {
            return filePath;
        } else {
            const stat = await fs.promises.stat(filePath);
            if (stat.isDirectory()) {
                dirs.push(filePath);
            }
        }
    }
    for (const dir of dirs) {
        const manifest = await findManifest(dir);
        if (manifest) {
            return manifest;
        }
    }
};

interface FormattingInfo {
    indent: number;
}

const FIND_INDENT = /^{\n(\s+)[^\s]/;
const getManifestContent = async (
    manifestPath: string
): Promise<[Manifest, FormattingInfo]> => {
    if (!(await pathExists(manifestPath))) {
        throw new Error(`Manifest ${manifestPath} does not exist.`);
    }
    const content = (await fs.promises.readFile(
        manifestPath,
        "utf-8"
    )) as string;
    const formattingInfo = {indent: 2};
    const indentMatch = content.match(FIND_INDENT);
    if (indentMatch) {
        formattingInfo.indent = indentMatch[1].length;
    }
    try {
        return [JSON.parse(content), formattingInfo];
    } catch (e) {
        throw new Error(`Failed parsing manifest: ${manifestPath}`);
    }
};

export const getManifest = async (manifestPath: string): Promise<Manifest> => {
    const [manifest] = await getManifestContent(manifestPath);
    return manifest;
};

export const writeManifest = async (
    manifestPath: string,
    data: Partial<Manifest>
): Promise<Manifest> => {
    if (!(await pathExists(manifestPath))) {
        throw new Error(`Manifest ${manifestPath} does not exist.`);
    }
    const [manifest, {indent}] = await getManifestContent(manifestPath);
    // Note: should be obvious, but this won't do anything special for arrays.
    Object.assign(manifest, data);
    let prettierConfig = await prettier.resolveConfig(manifestPath);
    if (!prettierConfig) {
        prettierConfig = {tabWidth: indent};
    }
    await fs.promises.writeFile(
        manifestPath,
        prettier.format(JSON.stringify(manifest), {
            ...prettierConfig,
            parser: "json",
        }),
        "utf-8"
    );
    return manifest;
};
