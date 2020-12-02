import { Command, flags } from "@oclif/command";
import chalk from "chalk";
import FormData from "form-data";
import fs from "fs";
import minimatch from "minimatch";
import path from "path";
import crypto from "crypto";
import cliAPI, { successOnly } from "../lib/cli-api";
import { defaultConfigPath, DEFAULT_SITE } from "../lib/config";
import { findManifest, getManifest } from "../lib/manifest";
import { println } from "../lib/print";
import { isMigration, Manifest, Migration } from "../lib/types";
import { readRecursive, runCmdPromise } from "../lib/util";

export const createBundle = async (
    manifest: Manifest,
    manifestPath: string,
    ignore: string
): Promise<{
    root: string;
    bundle: string[];
    missing: Map<string, Set<string>>;
}> => {
    const root = path.dirname(manifestPath);
    const allFiles = new Set(await readRecursive(root, ignore));
    const missing: Map<string, Set<string>> = new Map();
    const bundle: string[] = [];
    const addToFiles = (matcher: string | undefined, source: string) => {
        if (!matcher) {
            return;
        }
        let found = false;
        for (let file of allFiles) {
            if (minimatch(file, matcher)) {
                bundle.push(file);
                found = true;
            }
        }
        if (!found) {
            missing.set(source, missing.get(source) || new Set());
            missing.get(source)!.add(matcher);
        }
    };
    const addAll = (
        files: (string | Migration)[] | undefined,
        source: string
    ) => {
        if (!files) {
            return;
        }
        files.forEach((matcher) => {
            if (isMigration(matcher)) {
                addToFiles(matcher.js_file, source);
            } else {
                addToFiles(matcher, source);
            }
        });
    };
    addToFiles("manifest.json", "manifest file");
    addToFiles(manifest.thumbnail, "thumbnail");
    addToFiles(manifest.toolbar_icon, "toolbar_icon");
    addAll(manifest.js_files, "js_files");
    addAll(manifest.css_files, "css_file");
    addAll(manifest.other_resources, "other_resources");
    addAll(manifest.migrations, "migrations");
    return { root, bundle, missing };
};

export const doPublish = async (
    manifest: Manifest,
    manifestPath: string,
    ignore: string,
    config: string,
    site: string,
    printJson: boolean
): Promise<Manifest | null> => {
    let gitsha: string | null = null;
    try {
        gitsha = await runCmdPromise(
            path.dirname(manifestPath),
            "git",
            "rev-parse",
            "HEAD"
        );
    } catch (e) {
        /* swallow this error, this is just a best effort. */
    }
    const form = new FormData();
    const { root, bundle, missing } = await createBundle(
        manifest,
        manifestPath,
        ignore
    );
    if (missing.size > 0) {
        println(chalk`{red WARNING: the following files were defined in your manifest, but were not found.}
{red This bundle may be incomplete, you should include these files or remove them from your manifest.}`);
        for (let [source, files] of missing) {
            println(chalk`{red === ${source} ===}`);
            files.forEach((f) => println(chalk`{red ${f}}`));
        }
    }
    const files = await Promise.all<[string, Buffer, string]>(
        bundle.map(async (name) => {
            const fileBuffer = await fs.promises.readFile(
                path.join(root, name)
            );
            return [
                name,
                fileBuffer,
                crypto.createHash("md5").update(fileBuffer).digest("hex"),
            ];
        })
    );
    const bundlemd5 = crypto.createHash("md5");
    // Sort by md5 alphabetically so the md5 of these md5s is stable
    files
        .sort(([_na, _fa, a], [_nb, _fb, b]) => (a === b ? 0 : a < b ? -1 : 1))
        .forEach(([name, data, md5]) => {
            form.append("bundle", data, {
                filepath: name,
            });
            bundlemd5.update(md5);
        });
    form.append("md5", bundlemd5.digest("hex"));
    if (gitsha) {
        form.append("gitsha", gitsha);
    }
    const fetch = await cliAPI(config, site);
    const response = await successOnly(
        fetch<Manifest>(`app/${manifest.id}`, "post", form),
        printJson
    );
    if (!response) {
        return null;
    }
    return response;
};

export default class Publish extends Command {
    static description =
        "Uploads this bundle to the developer console, and sets it as the latest development version.";

    static flags = {
        help: flags.help({ char: "h" }),
        json: flags.boolean({
            char: "j",
            description: "output responses in JSON",
        }),
        ignore: flags.string({
            char: "i",
            description: "blob to ignore. Defaults to 'node_modules'",
            default: "node_modules",
        }),
        site: flags.string({
            char: "s",
            description:
                "use a specific quip site rather than the standard quip.com login",
            default: DEFAULT_SITE,
        }),
        config: flags.string({
            hidden: true,
            description: "Use a custom config file (default ~/.quiprc)",
            default: () => defaultConfigPath(),
        }),
    };

    static args = [];

    async run() {
        const { args, flags } = this.parse(Publish);
        const manifestPath = await findManifest(process.cwd());
        if (!manifestPath) {
            throw new Error(`Could not find a manifest.json file.`);
        }
        const manifest = await getManifest(manifestPath);
        const success = await doPublish(
            manifest,
            manifestPath,
            flags.ignore,
            flags.config,
            flags.site,
            flags.json
        );
        if (!success) {
            println(chalk`{red Publishing failed.}`);
            process.exit(1);
        }
        println(
            chalk`{magenta Successfully published ${manifest.name} v${manifest.version_name} (${manifest.version_number})}`
        );
    }
}
