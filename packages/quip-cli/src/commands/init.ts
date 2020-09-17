import {Command, flags} from "@oclif/command";
import chalk from "chalk";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import cliAPI, {successOnly} from "../lib/cli-api";
import {defaultConfigPath, DEFAULT_SITE} from "../lib/config";
import {println} from "../lib/print";
import {Manifest} from "../lib/types";
import {copy, runCmd} from "../lib/util";
import {doPublish} from "./publish";

interface PackageOptions {
    name: string;
    version: string;
    description: string;
    typescript: boolean;
    bundler?: string;
}

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
            char: "n",
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
            description: "output responses in JSON",
        }),
        config: flags.string({
            hidden: true,
            description: "Use a custom config file (default ~/.quiprc)",
            default: () => defaultConfigPath(),
        }),
    };

    private promptInitialAppConfig_ = async (specifiedDir?: string) => {
        println("Creating a new Quip Live App");
        const defaultName = path
            .basename(path.resolve(process.cwd(), specifiedDir || ""))
            .replace(/[^\w\d\s]/g, " ")
            .replace(/(:?^|\s)(\w)/g, (c) => c.toUpperCase());
        const validateNumber: (input: any) => true | string = (val) =>
            !isNaN(parseInt(val, 10)) || "Please enter a number";
        const manifestOptions: Pick<Manifest, "name" | "toolbar_color"> &
            Partial<Manifest> = await inquirer.prompt([
            {
                type: "input",
                name: "name",
                message:
                    "What is the name of this app?\n(This is what users will see when inserting your app)\n",
                default: defaultName,
            },
            {
                type: "list",
                name: "toolbar_color",
                message: "Choose a toolbar color",
                choices: ["red", "orange", "yellow", "green", "blue", "violet"],
            },
        ]);

        const packageOptions: PackageOptions = await inquirer.prompt([
            {
                type: "input",
                name: "name",
                message: "Choose a package name",
                default: manifestOptions.name
                    .toLowerCase()
                    .replace(/\s+/g, "-"),
                filter: (val) => val.toLowerCase(),
            },
            {
                type: "input",
                name: "description",
                message: "What does this app do?\n",
            },
            {
                type: "confirm",
                name: "typescript",
                message: "Use Typescript?",
                default: true,
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

        println(packageOptions);
        println(manifestOptions);

        let appDir: string;
        if (specifiedDir && specifiedDir.length) {
            appDir = path.join(process.cwd(), specifiedDir);
        } else {
            appDir = path.join(process.cwd(), packageOptions.name);
        }

        manifestOptions.description = packageOptions.description;
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
        const templateName = `${typescript ? "ts" : "js"}_${bundler}`;
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
            Partial<PackageOptions>,
            "name" | "description" | "version"
        >,
        dir: string
    ) => {
        const {name, description, version} = packageOptions;
        const packagePath = path.join(dir, "package.json");
        return this.mutateJsonConfig_(packagePath, {
            name,
            description,
            version,
        });
    };

    private mutateManifest_ = (
        manifestOptions: Partial<Manifest>,
        dir: string
    ) => {
        const manifestPath = path.join(dir, "manifest.json");
        return this.mutateJsonConfig_(manifestPath, manifestOptions);
    };

    private mutateJsonConfig_ = <T extends PackageOptions | Manifest>(
        configPath: string,
        updates: Partial<T>
    ): T => {
        const config = JSON.parse(fs.readFileSync(configPath).toString());
        Object.assign(config, updates);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        return config;
    };

    async run() {
        const {flags} = this.parse(Init);
        const dryRun = flags["dry-run"];

        // initial app options from user
        const {
            appDir,
            packageOptions,
            manifestOptions,
        } = await this.promptInitialAppConfig_(flags.dir);
        await this.copyTemplate_(packageOptions, appDir, dryRun);
        if (dryRun) {
            println("Would update package.json with", packageOptions);
            println("Would update manifest.json with", manifestOptions);
            return;
        }
        let pkg = this.mutatePackage_(packageOptions, appDir);
        let manifest = this.mutateManifest_(manifestOptions, appDir);

        if (!flags["no-create"]) {
            const fetch = await cliAPI(flags.config, flags.site);
            // create app
            println(chalk`{green Creating app in dev console...}`);
            const createdApp = await successOnly(
                fetch<Manifest>("apps", "post"),
                flags.json
            );
            if (!createdApp) {
                return;
            }
            // update manifest
            manifest = this.mutateManifest_(
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
            // npm run build
            println(chalk`{green building app...}`);
            await runCmd(appDir, "npm", "run", "build");
            // upload initial version
            println(chalk`{green uploading bundle...}`);
            await doPublish(
                manifest,
                path.join(appDir, "manifest.json"),
                "node_modules",
                flags.config,
                flags.site,
                flags.json
            );
        }

        println(
            chalk`{magenta Live App Project initialized: ${manifest.name} (${pkg.name})}`
        );
    }
}
