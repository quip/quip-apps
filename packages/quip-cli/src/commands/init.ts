import {Command, flags} from "@oclif/command";
import chalk from "chalk";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import cliAPI, {successOnly} from "../lib/cli-api";
import {defaultConfigPath, DEFAULT_SITE} from "../lib/config";
import {print, println} from "../lib/print";
import {Manifest} from "../lib/types";
import {copy, runCmd} from "../lib/util";
import {bump} from "./bump";
import {doPublish} from "./publish";

interface PackageOptions {
    name: string;
    description: string;
    typescript: boolean;
    bundler?: string;
}

interface PackageJson {
    name: string;
    version: string;
    description: string;
}

const defaultName = (dir?: string) => {
    return path
        .basename(path.resolve(process.cwd(), dir || ""))
        .replace(/[^\w\d\s]/g, " ")
        .replace(/(:?^|\s)(\w)/g, (c) => c.toUpperCase());
};

const packageName = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

const getAppDir = (name: string, dir?: string) => {
    if (dir && dir.length) {
        if (dir.startsWith("/")) {
            return dir;
        }
        return path.join(process.cwd(), dir);
    }
    return path.join(process.cwd(), name);
};

const defaultPackageOptions = (name: string) => ({
    name: packageName(name),
    description: "A Quip Live App",
    typescript: true,
});

const defaultManifestOptions = (
    dir?: string,
    opts?: {name?: string; id?: string}
) => ({
    name: defaultName(dir),
    ...(opts || {}),
});

export default class Init extends Command {
    static description = "Initialize a new Live App Project";

    static flags = {
        help: flags.help({char: "h"}),
        ["dry-run"]: flags.boolean({
            char: "d",
            hidden: true,
            description:
                "Print what this would do, but don't create any files.",
        }),
        "no-create": flags.boolean({
            description:
                "only create a local app (don't create an app in the dev console or assign an ID)",
        }),
        dir: flags.string({
            char: "d",
            description:
                "specify directory to create app in (defaults to the name provided)",
        }),
        site: flags.string({
            char: "s",
            description:
                "use a specific quip site rather than the standard quip.com login",
            default: DEFAULT_SITE,
        }),
        json: flags.boolean({
            char: "j",
            description:
                "output responses in JSON (must provide --name and --id)",
        }),
        name: flags.string({
            char: "n",
            description: "set the name of the application",
        }),
        id: flags.string({
            char: "i",
            description: "set the ID of the application",
        }),
        config: flags.string({
            hidden: true,
            description: "Use a custom config file (default ~/.quiprc)",
            default: () => defaultConfigPath(),
        }),
    };

    private promptInitialAppConfig_ = async (
        specifiedDir?: string,
        defaults?: {name?: string; id?: string}
    ) => {
        println("Creating a new Quip Live App");
        const validateNumber: (input: any) => true | string = (val) =>
            !isNaN(parseInt(val, 10)) || "Please enter a number";
        const defaultManifest = defaultManifestOptions(specifiedDir, defaults);
        const manifestOptions: Manifest = await inquirer.prompt([
            {
                type: "input",
                name: "name",
                message:
                    "What is the name of this app?\n(This is what users will see when inserting your app)\n",
                default: defaultManifest.name,
            },
            {
                type: "list",
                name: "toolbar_color",
                message: "Choose a toolbar color",
                choices: ["red", "orange", "yellow", "green", "blue", "violet"],
            },
        ]);

        const defaultPackage = defaultPackageOptions(manifestOptions.name);

        const packageOptions: PackageOptions = await inquirer.prompt([
            {
                type: "input",
                name: "name",
                message: "Choose a package name",
                default: defaultPackage.name,
                filter: (val) => val.toLowerCase(),
            },
            {
                type: "input",
                name: "description",
                message: "What does this app do?\n",
                default: defaultPackage.description,
            },
            {
                type: "confirm",
                name: "typescript",
                message: "Use Typescript?",
                default: defaultPackage.typescript,
            },
        ]);

        const {addManifestConfig} = await inquirer.prompt([
            {
                type: "confirm",
                name: "addManifestConfig",
                message:
                    "Would you like to customize your manifest.json now?\n(see: https://corp.quip.com/dev/liveapps/documentation#app-manifest)\n",
                default: true,
            },
        ]);
        if (addManifestConfig) {
            const extraManifestOptions = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "disable_app_level_comments",
                    message: "Disable commenting at the app level?",
                    default: false,
                },
                {
                    type: "list",
                    name: "sizing_mode",
                    message:
                        "Choose a sizing mode\n(see: https://corp.quip.com/dev/liveapps/recipes#specifying-the-size-of-your-app)",
                    choices: ["fill_container", "fit_content", "scale"],
                },
                {
                    type: "number",
                    name: "initial_height",
                    message:
                        "Specify an initial height for your app\nThis will be the height of the app while it is loading.\n",
                    default: 300,
                    validate: validateNumber,
                    filter: Number,
                },
                {
                    type: "number",
                    name: "initial_width",
                    message:
                        "Specify an initial width for your app (optional)\nThis will be the width of the app while it is loading.\n",
                    default: "none",
                    validate: (input) =>
                        input === "none" || validateNumber(input),
                    filter: (val) => (val === "none" ? -1 : val),
                },
            ]);
            Object.assign(manifestOptions, extraManifestOptions);
        }

        packageOptions.bundler = "webpack";
        manifestOptions.description = packageOptions.description;

        const appDir = getAppDir(packageOptions.name, specifiedDir);
        return {
            appDir,
            packageOptions,
            manifestOptions,
        };
    };

    private copyTemplate_ = (
        packageOptions: PackageOptions,
        dest: string,
        dryRun: boolean
    ) => {
        const {typescript, bundler} = packageOptions;
        // get lib path
        const templateName = `${typescript ? "ts" : "js"}_${
            bundler || "webpack"
        }`;
        const templatePath = path.join(
            __dirname,
            "../../templates",
            templateName
        );
        const options = {
            dereference: true,
            // For use during local developement. Do not copy .git and boilerplate node_modules
            filter: (fileName: string) =>
                !fileName.match(/(?:\.git\/|templates\/[\w_]+\/node_modules)/),
        };
        if (dryRun) {
            println(`Would intialize ${templateName} on ${dest}`);
            return;
        } else {
            return copy(templatePath, dest, options);
        }
    };

    private mutatePackage_ = (
        packageOptions: Pick<
            Partial<PackageJson>,
            "name" | "description" | "version"
        >,
        dir: string
    ): Promise<PackageJson> => {
        const packagePath = path.join(dir, "package.json");
        return this.mutateJsonConfig_<PackageJson>(packagePath, packageOptions);
    };

    private mutateManifest_ = (
        manifestOptions: Partial<Manifest>,
        dir: string
    ) => {
        const manifestPath = path.join(dir, "manifest.json");
        return this.mutateJsonConfig_(manifestPath, manifestOptions);
    };

    private mutateJsonConfig_ = async <T extends PackageJson | Manifest>(
        configPath: string,
        updates: Partial<T>
    ): Promise<T> => {
        const config = JSON.parse(fs.readFileSync(configPath).toString());
        Object.assign(config, updates);
        await fs.promises.writeFile(
            configPath,
            JSON.stringify(config, null, 4)
        );
        return config;
    };

    async run() {
        const {flags} = this.parse(Init);
        const dryRun = flags["dry-run"];
        const fetch = await cliAPI(flags.config, flags.site);
        const shouldCreate = !flags["no-create"];
        if (flags.json && (!flags.name || !flags.id)) {
            println(
                chalk`{red You must provide --name and --id when initializing with --json}`
            );
            process.exit(1);
        }
        if (shouldCreate) {
            const ok = await successOnly(fetch("ok"), false);
            if (!ok) {
                println(
                    chalk`{red Refusing to create an app since we can't contact Quip servers.}`
                );
                process.exit(1);
            }
        }
        let config:
            | {
                  appDir: string;
                  packageOptions: PackageOptions;
                  manifestOptions: Partial<Manifest>;
              }
            | undefined;
        if (flags.name && flags.json && flags.id) {
            const manifestOptions = defaultManifestOptions(flags.dir, {
                name: flags.name,
                id: flags.id,
            });
            const packageOptions = defaultPackageOptions(manifestOptions.name);
            config = {
                appDir: getAppDir(packageOptions.name, flags.dir),
                manifestOptions,
                packageOptions,
            };
        } else {
            // initial app options from user
            config = await this.promptInitialAppConfig_(flags.dir, {
                name: flags.name,
                id: flags.id,
            });
        }
        const {packageOptions, manifestOptions, appDir} = config;
        await this.copyTemplate_(packageOptions, appDir, dryRun);
        if (dryRun) {
            println("Would update package.json with", packageOptions);
            println("Would update manifest.json with", manifestOptions);
            return;
        }
        let pkg = await this.mutatePackage_(packageOptions, appDir);
        let manifest = await this.mutateManifest_(manifestOptions, appDir);
        let success = true;
        if (!flags["no-create"]) {
            // create app
            println(chalk`{green Creating app in dev console...}`);
            const createdApp = await successOnly(
                fetch<Manifest>("apps", "post"),
                false
            );
            if (!createdApp) {
                return;
            }
            // update manifest
            manifest = await this.mutateManifest_(
                {
                    id: createdApp.id,
                    version_number: createdApp.version_number,
                    version_name: createdApp.version_name,
                },
                appDir
            );
            println(
                chalk`{magenta App created: ${createdApp.id}, v${createdApp.version_name} (${createdApp.version_number})}`
            );
            // npm install
            println(chalk`{green installing dependencies...}`);
            await runCmd(appDir, "npm", "install");
            // bump the version since we already have a verison 1 in the console
            println(chalk`{green bumping version...}`);
            await bump(appDir, "patch", flags.json);
            // npm run build
            println(chalk`{green building app...}`);
            await runCmd(appDir, "npm", "run", "build");
            // then publish the new version
            println(chalk`{green uploading bundle...}`);
            const newManifest = await doPublish(
                manifest,
                path.join(appDir, "manifest.json"),
                "node_modules",
                flags.config,
                flags.site,
                flags.json
            );
            success = !!newManifest;
            if (flags.json) {
                if (success) {
                    print(JSON.stringify(newManifest));
                } else {
                    process.exit(1);
                }
            }
        } else if (flags.json && success) {
            print(JSON.stringify(manifest));
        }
        if (!flags.json && success) {
            println(
                chalk`{magenta Live App Project initialized: ${manifest.name} (${pkg.name})}`
            );
        }
    }
}
