import { Command, flags } from "@oclif/command";
import chalk from "chalk";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import cliAPI, { successOnly } from "../lib/cli-api";
import { defaultConfigPath, DEFAULT_SITE } from "../lib/config";
import { findManifest, getManifest } from "../lib/manifest";
import { println } from "../lib/print";
import { Manifest } from "../lib/types";
import { readRecursive } from "../lib/util";

export const doPublish = async (
    id: string,
    manifestPath: string,
    dist: string,
    config: string,
    site: string,
    json: boolean
): Promise<Manifest | null> => {
    const form = new FormData();
    const distFiles = await readRecursive(dist);
    const fileBinaries = await Promise.all<[string, Buffer]>([
        ["manifest.json", await fs.promises.readFile(manifestPath)],
        ...distFiles.map(
            async (name) =>
                [name, await fs.promises.readFile(path.join(dist, name))] as [
                    string,
                    Buffer
                ]
        ),
    ]);
    fileBinaries.forEach(([name, data]) =>
        form.append("bundle", data, {
            filename: name,
        })
    );
    const fetch = await cliAPI(config, site);
    const response = await successOnly(
        fetch<Manifest>(`app/${id}`, "post", form),
        json
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
        help: flags.help({char: "h"}),
        dist: flags.string({
            char: "d",
            description: "dist folder to upload",
            default: "./dist",
        }),
        json: flags.boolean({
            char: "j",
            description: "output responses in JSON",
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
        const {args, flags} = this.parse(Publish);
        const manifestPath = await findManifest(process.cwd());
        if (!manifestPath) {
            throw new Error(`Could not find a manifest.json file.`);
        }
        const manifest = await getManifest(manifestPath);
        const success = await doPublish(
            manifest.id,
            manifestPath,
            flags.dist,
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
