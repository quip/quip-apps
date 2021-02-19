import fs from "fs";
import path from "path";
import prettier from "prettier";
import { Manifest } from "./types";
import { pathExists, readRecursive } from "./util";

export const findManifest = async (
    dir: string
): Promise<string | undefined> => {
    const allFiles = await readRecursive(dir, "node_modules");
    let minDistance = Infinity;
    let closestManifest: string | undefined;
    for (const file of allFiles) {
        const filename = path.basename(file);
        if (filename !== "manifest.json") {
            continue;
        }
        const fileDistance = file.split(path.sep).length;
        if (fileDistance <= minDistance) {
            minDistance = fileDistance;
            closestManifest = file;
        }
    }
    return closestManifest;
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
    const formattingInfo = { indent: 2 };
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
    const [manifest, { indent }] = await getManifestContent(manifestPath);
    // Note: should be obvious, but this won't do anything special for arrays.
    Object.assign(manifest, data);
    let prettierConfig = await prettier.resolveConfig(manifestPath);
    if (!prettierConfig) {
        prettierConfig = { tabWidth: indent };
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
