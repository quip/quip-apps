import { Command, flags } from "@oclif/command";
import chalk from "chalk";
import cliAPI, {
    successOnly,
    ReleaseAppResponse,
    ReleasableVersionsReponse,
} from "../lib/cli-api";
import { defaultConfigPath, DEFAULT_SITE } from "../lib/config";
import { findManifest, getManifest } from "../lib/manifest";
import { Manifest } from "../lib/types";
import { println } from "../lib/print";
import inquirer from "inquirer";

export enum ReleaseDestination {
    BETA = "beta",
    PROD = "prod",
}

interface ReleaseOpts {
    manifest: Manifest;
    destination: ReleaseDestination;
    build: number;
    json?: boolean;
    site: string;
    config: string;
}

export const release = async (opts: ReleaseOpts) => {
    const { manifest, build, destination } = opts;
    const fetch = await cliAPI(opts.config, opts.site);
    return successOnly(
        fetch<ReleaseAppResponse>(`app/${manifest.id}/release`, "post", {
            build,
            destination,
        }),
        opts.json || false
    );
};

export default class Release extends Command {
    static description = "Release an app to Beta or Production";

    static flags = {
        help: flags.help({ char: "h" }),
        site: flags.string({
            char: "s",
            description:
                "use a specific quip site rather than the standard quip.com login",
            default: DEFAULT_SITE,
        }),
        beta: flags.boolean({
            char: "b",
            description: "release beta version",
            exclusive: ["prod"],
        }),
        prod: flags.boolean({
            char: "p",
            description: "release production version",
            exclusive: ["beta"],
        }),
        json: flags.boolean({
            char: "j",
            description: "output responses in JSON",
        }),
        config: flags.string({
            hidden: true,
            description: "use a custom config file (default ~/.quiprc)",
            default: () => defaultConfigPath(),
        }),
    };

    static args = [
        {
            name: "build number",
            description: "the build number to release",
            parse: (arg: string) => parseInt(arg),
        },
    ];

    async run() {
        const { args, flags } = this.parse(Release);

        const manifestPath = await findManifest(process.cwd());
        if (!manifestPath) {
            throw new Error(`Could not find a manifest.json file.`);
        }
        const manifest = await getManifest(manifestPath);

        if (!flags.beta && !flags.prod) {
            this.error("Either --beta or --prod must be provided.");
        }

        let build = args.build;
        // if no build is provided, allow the user to select one
        if (!build) {
            const fetch = await cliAPI(flags.config, flags.site);
            const dest = flags.beta ? "beta" : "prod";
            const versions = await successOnly(
                fetch<ReleasableVersionsReponse>(
                    `app/${manifest.id}/versions/releasable?destination=${dest}`
                ),
                flags.json
            );
            if (!versions) {
                return;
            }
            if (versions.versions.length === 0) {
                println(
                    chalk`{red No releasable versions. Release a build first.}`
                );
                return;
            }
            println(chalk`{magenta ${versions.name}}`);
            const response = await inquirer.prompt([
                {
                    type: "list",
                    name: "version",
                    message: `Select a version to release as ${dest}:`,
                    choices: versions.versions.map((v) => ({
                        name: chalk`{green ${v.version_name} (${v.version_number})}`,
                        value: v.version_number,
                    })),
                },
            ]);
            if (!response || !response.version) {
                return;
            }
            build = response.version;
        }

        const response = await release({
            manifest,
            destination: flags.beta
                ? ReleaseDestination.BETA
                : ReleaseDestination.PROD,
            build,
            site: flags.site,
            config: flags.config,
            json: flags.json,
        });
        if (response) {
            println(
                chalk`{magenta Released version ${response.version_name} (${response.version_number}) as ${response.destination}.}`
            );
        }
    }
}
