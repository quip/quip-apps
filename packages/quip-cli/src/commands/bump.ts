import {Command, flags} from "@oclif/command";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import {findManifest, getManifest, writeManifest} from "../lib/manifest";
import {println} from "../lib/print";
import {runCmd} from "../lib/util";

export const bump = async (
    dir: string,
    increment: string,
    silent?: boolean
) => {
    const packagePath = path.join(dir, "package.json");
    const manifestPath = await findManifest(dir);
    if (!manifestPath) {
        if (!silent) {
            println(
                chalk`{red Couldn't find manifest.json. Please execute at the root of your application.}`
            );
            process.exit(1);
        } else {
            return false;
        }
    }
    try {
        await fs.promises.stat(packagePath);
    } catch (e) {
        if (!silent) {
            println(
                chalk`{red Couldn't find package.json. Please execute at the root of your application.}`
            );
            process.exit(1);
        } else {
            return false;
        }
    }
    await runCmd(dir, "npm", "version", increment);
    const pkg = JSON.parse(await fs.promises.readFile(packagePath, "utf8"));
    const manifest = await getManifest(manifestPath);
    manifest.version_number += 1;
    manifest.version_name = pkg.version;
    await writeManifest(manifestPath, manifest);
    if (!silent) {
        println(
            chalk`{magenta Successfully updated ${manifest.name} v${manifest.version_name} (${manifest.version_number})}`
        );
    }
    return true;
};

export default class Bump extends Command {
    static description = "Bump the application version";

    static flags = {
        help: flags.help({char: "h"}),
    };

    static args = [
        {
            name: "increment",
            description:
                "which number to bump - can be one of 'major', 'minor', or 'patch' - defaults to 'patch'",
        },
    ];

    async run() {
        const {args, flags} = this.parse(Bump);
        const increment = (args.increment ?? "patch").toLowerCase();
        if (!["major", "minor", "patch"].includes(increment)) {
            this._help();
            return;
        }
        bump(process.cwd(), increment);
    }
}
