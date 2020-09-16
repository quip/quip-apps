import {Command, flags} from "@oclif/command";
import chalk from "chalk";
import inquirer from "inquirer";
import cliAPI, {
    AppsListResponse,
    AppVersionsResponse,
    isError,
} from "../lib/cli-api";
import {defaultConfigPath, DEFAULT_SITE} from "../lib/config";
import {Manifest} from "../lib/types";

const log = process.stdout.write.bind(process.stdout);

const ptabs = (count: number) => {
    let tabs = "";
    for (var i = 0; i < count; i++) {
        tabs += " ";
    }
    return tabs;
};

const prettyPrintObject = (obj: any, tabs: number = 0, prefix: string = "") => {
    if (!obj) {
        return;
    } else if (Array.isArray(obj)) {
        log("\n");
        for (let i = 0; i < obj.length; i++) {
            const item = obj[i];
            log(chalk`${prefix}${ptabs(tabs)}{grey [${i}]: }`);
            prettyPrintObject(item, tabs + 1);
        }
    } else if (typeof obj === "object") {
        log("\n");
        for (const key in obj) {
            log(chalk`${prefix}${ptabs(tabs)}{grey - ${key}:} `);
            prettyPrintObject(obj[key], tabs + 1);
        }
    } else {
        log(chalk`${prefix}{green ${obj}}
`);
    }
};

export default class Apps extends Command {
    static description = "Browse, inspect, create, and manipulate your Apps";

    static flags = {
        help: flags.help({char: "h"}),
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
        create: flags.boolean({
            char: "c",
            description: "create a new live app",
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
        const {args, flags} = this.parse(Apps);
        const fetch = await cliAPI(flags.config, flags.site);
        const callApi = async <T>(
            path: string,
            method?: "get" | "post",
            body?: {[key: string]: any}
        ) => {
            const response = await fetch<T>(path, method, body);
            if (flags.json) {
                log(JSON.stringify(response) + "\n");
            } else if (isError(response)) {
                log(chalk`
{red Error: ${response.error}}
{red ${response.response}}
`);
            } else {
                return response;
            }
            return false;
        };

        const handleAppId = async (id: string) => {
            const printAppInfo = async (
                id: string,
                version: number | null = null
            ) => {
                const appInfo = await callApi<Manifest>(
                    `app/${id}` + (version !== null ? "" : `/${version}`)
                );
                if (appInfo) {
                    log(chalk`
{magenta ${appInfo.name} v${appInfo.version_name} (${appInfo.version_number})}
`);
                    prettyPrintObject(appInfo);
                }
            };
            if (flags.version) {
                return await printAppInfo(flags.version);
            }
            const versions = await callApi<AppVersionsResponse>(
                `app/${id}/versions`
            );
            if (!versions) {
                return;
            }
            log(chalk`
{magenta ${versions.name}}
`);
            const {release, development} = versions;
            const otherVersions = versions.versions
                .filter(
                    (v) =>
                        v.version_number !== release.version_number &&
                        v.version_number !== release.version_number
                )
                .map((v) => ({...v, icon: v.released ? "⚓️" : ""}));
            const response = await inquirer.prompt([
                {
                    type: "list",
                    name: "version",
                    message:
                        "Select a version (🚢: prod, 🛠: dev, ⚓️: previously released)",
                    choices: [
                        {...release, icon: "🚢"},
                        {...development, icon: "🛠"},
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

        if (flags.create) {
            const createdApp = await callApi<Manifest>(
                "apps",
                "post"
                /* TODO: manifest */
            );
            if (createdApp) {
                log(chalk`
{magenta Created New Application:}
${prettyPrintObject(createdApp)}
`);
            }
        } else if (flags.id) {
            handleAppId(flags.id);
        } else {
            const apps = await callApi<AppsListResponse>("apps");
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
