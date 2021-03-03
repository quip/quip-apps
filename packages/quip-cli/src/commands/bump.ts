import { Command, flags } from "@oclif/command";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import semver, { ReleaseType } from "semver";
import { NPM_BINARY_NAME } from "../lib/config";
import { findManifest, getManifest, writeManifest } from "../lib/manifest";
import { println } from "../lib/print";
import { runCmd, runCmdPromise } from "../lib/util";

export const bump = async (
    dir: string,
    increment: ReleaseType,
    options?: {
        prereleaseName?: string;
        message?: string;
        silent?: boolean;
        noGit?: boolean;
    }
) => {
    const { message, silent, prereleaseName, noGit } = options || {};
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
    // read the package and get the next version
    const pkg = JSON.parse(await fs.promises.readFile(packagePath, "utf8"));
    const version = semver.inc(pkg.version, increment, prereleaseName);
    if (!version) {
        throw new Error(
            `Failed bumping version, semver doesn't understand ${pkg.version} as a valid version string.`
        );
    }

    // update manifest.json to reflect the latest version
    const manifest = await getManifest(manifestPath);
    manifest.version_number += 1;
    manifest.version_name = version;
    await writeManifest(manifestPath, manifest);

    if (!noGit) {
        // stage manifest.json since we want the increment to be part of our version tag
        try {
            await runCmdPromise(dir, "git", "add", manifestPath);
        } catch (e) {
            // silent failure ok here, since it just means we're not using git
        }
    }

    // run npm version to create the version tag and commit
    const extraArgs = [];
    if (message) {
        extraArgs.push("--message", message);
    }
    if (noGit) {
        extraArgs.push("--git-tag-version", "false");
    }
    // run with --force since we will have a dirty tree (cause we added manifest.json above)
    await runCmd(
        dir,
        NPM_BINARY_NAME,
        "version",
        "--force",
        version,
        ...extraArgs
    );
    if (!silent) {
        println(
            chalk`{magenta Successfully updated ${manifest.name} v${manifest.version_name} (${manifest.version_number})}`
        );
    }
    return true;
};

export default class Bump extends Command {
    static description =
        "Bump the application version (and create a version commit/tag)";

    static flags = {
        help: flags.help({ char: "h" }),
        message: flags.string({
            char: "m",
            description:
                "Specify a commit message to use as the version commit message",
        }),
        "prerelease-name": flags.string({
            char: "p",
            description:
                "When specifying prerelease, use this as the prefix, e.g. -p alpha will produce v0.x.x-alpha.x",
        }),
        "no-git": flags.boolean({
            char: "n",
            description:
                "Don't perform git operations even when available (just makes changes inline)",
        }),
    };

    static args = [
        {
            name: "increment",
            description:
                "which number to bump - can be one of 'prerelease', 'major', 'minor', or 'patch' - defaults to 'patch'",
        },
    ];

    async run() {
        const { args, flags } = this.parse(Bump);
        const increment = (args.increment || "patch").toLowerCase();
        const manifestPath = await findManifest(process.cwd());
        const noGit = flags["no-git"];
        if (!manifestPath) {
            throw new Error("Couldn't find a quip app.");
        }
        if (!noGit) {
            let gitDirty = false;
            try {
                const r = await runCmdPromise(
                    path.dirname(manifestPath),
                    "git",
                    "status",
                    "--porcelain"
                );
                gitDirty = r != "";
            } catch (e) {
                /* This just means that we're not in a git repo, safe to ignore. */
            }
            if (gitDirty) {
                throw new Error(
                    "Cannot bump version in a dirty repo. Commit your changes before running bump."
                );
            }
        }

        if (!["major", "minor", "patch", "prerelease"].includes(increment)) {
            this._help();
            return;
        }

        bump(process.cwd(), increment, {
            message: flags.message,
            prereleaseName: flags["prerelease-name"],
            noGit,
        });
    }
}
