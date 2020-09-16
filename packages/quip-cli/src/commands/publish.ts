import {Command, flags} from "@oclif/command";
import chalk from "chalk";
import cliAPI from "../lib/cli-api";
import {defaultConfigPath, DEFAULT_SITE} from "../lib/config";
import {println} from "../lib/print";
import {Manifest} from "../lib/types";

export const doPublish = async (
    dist: string,
    config: string,
    site: string
): Promise<Manifest> => {
    const fetch = await cliAPI(config, site);
    // TODO: publish the app
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
        const manifest = await doPublish(flags.dist, flags.config, flags.site);
        println(
            chalk`{magenta Successfully published ${manifest.name} v${manifest.version_name} (${manifest.version_number})}`
        );
    }
}
