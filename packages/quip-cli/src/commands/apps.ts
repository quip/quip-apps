import { Command, flags } from "@oclif/command";
import chalk from "chalk";
import inquirer from "inquirer";
import cliAPI, {
    AppsListResponse,
    AppVersionsResponse,
    successOnly,
} from "../lib/cli-api";
import { defaultConfigPath, DEFAULT_SITE } from "../lib/config";
import { prettyPrintObject, print } from "../lib/print";
import { Manifest } from "../lib/types";

export default class Apps extends Command {
    static description = "Browse, inspect, and manipulate your Apps";

    static flags = {
        help: flags.help({ char: "h" }),
        site: flags.string({
            char: "s",
            description:
                "use a specific quip site rather than the standard quip.com login",
            default: DEFAULT_SITE,
        }),
        id: flags.string({
            char: "i",
            description: "show the details of an app ID",
        }),
        version: flags.string({
            char: "v",
            description:
                "which version to show the details for. Only useful with --id",
        }),
        json: flags.boolean({
            char: "j",
            description: "output responses in JSON",
        }),
        config: flags.string({
            hidden: true,
            description: "Use a custom config file (default ~/.quiprc)",
            default: () => defaultConfigPath(),
        }),
    };

    static args = [];

    async run() {
        const { args, flags } = this.parse(Apps);
        const fetch = await cliAPI(flags.config, flags.site);

        const handleAppId = async (id: string) => {
            const printAppInfo = async (
                id: string,
                version: number | null = null
            ) => {
                const appInfo = await successOnly(
                    fetch<Manifest>(
                        `app/${id}` + (version !== null ? "" : `/${version}`)
                    ),
                    flags.json
                );
                if (appInfo) {
                    print(chalk`
{magenta ${appInfo.name} v${appInfo.version_name} (${appInfo.version_number})}
`);
                    prettyPrintObject(appInfo);
                }
            };
            if (flags.version) {
                return await printAppInfo(flags.version);
            }
            const versions = await successOnly(
                fetch<AppVersionsResponse>(`app/${id}/versions`),
                flags.json
            );
            if (!versions) {
                return;
            }
            print(chalk`
{magenta ${versions.name}}
`);
            const { release, development } = versions;
            const otherVersions = versions.versions
                .filter(
                    (v) =>
                        v.version_number !== release.version_number &&
                        v.version_number !== release.version_number
                )
                .map((v) => ({ ...v, icon: v.released ? "⚓️" : "" }));
            const response = await inquirer.prompt([
                {
                    type: "list",
                    name: "version",
                    message:
                        "Select a version (🚢: prod, 🛠: dev, ⚓️: previously released)",
                    choices: [
                        { ...release, icon: "🚢" },
                        { ...development, icon: "🛠" },
                    ]
                        .concat(otherVersions)
                        .map((v) => ({
                            name: chalk`{green ${v.version_name} ${v.icon}}`,
                            value: v.version_number,
                        })),
                },
            ]);
            if (response && response.version) {
                printAppInfo(id, response.version);
            }
        };

        if (flags.id) {
            handleAppId(flags.id);
        } else {
            const apps = await successOnly(
                fetch<AppsListResponse>("apps"),
                flags.json
            );
            if (apps) {
                const choices = [
                    new inquirer.Separator(chalk`{green === Released ===}`),
                    ...apps.released.map((app) => ({
                        name: chalk`{green ${app.id}: ${app.name}}`,
                        value: app.id,
                    })),
                    new inquirer.Separator(chalk`{yellow === Development ===}`),
                    ...apps.development.map((app) => ({
                        name: chalk`{yellow ${app.id}: ${app.name}}`,
                        value: app.id,
                    })),
                    new inquirer.Separator(chalk`{red === Disabled ===}`),
                    ...apps.disabled.map((app) => ({
                        name: chalk`{red ${app.id}: ${app.name}}`,
                        value: app.id,
                    })),
                ];
                const response = await inquirer.prompt([
                    {
                        type: "list",
                        name: "id",
                        message: chalk`{magenta Select an Application}`,
                        choices,
                    },
                ]);
                if (response && response.id) {
                    handleAppId(response.id);
                }
            }
        }
    }
}
