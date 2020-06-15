import {Result, Spec} from "arg";
import inquirer from "inquirer";
import path from "path";
import fs from "fs";
import {ncp} from "ncp";

export const initArgs: Spec = {};
interface PackageOptions {
    name: string;
    description: string;
    typescript: boolean;
    bundler: string;
}

interface ManifestOptions {
    name: string;
    description?: string;
    version_name?: string;
    toolbar_color?: string;
    diable_app_level_comments?: boolean;
    sizing_mode?: string;
    initial_width?: number;
    initial_height?: number;
}

const promptInitialAppConfig = async (args: Result<typeof initArgs>) => {
    console.log("Creating a new Quip Live App");
    const defaultName = path
        .basename(process.cwd())
        .replace(/[^\w\d\s]/g, " ")
        .replace(/(:?^|\s)(\w)/g, c => c.toUpperCase());
    const validateNumber: (input: any) => true | string = val =>
        !isNaN(parseInt(val, 10)) || "Please enter a number";
    const manifestOptions: ManifestOptions = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message:
                "What is the name of this app?\n(This is what users will see when inserting your app)\n",
            default: defaultName,
        },
    ]);

    const packageOptions: PackageOptions = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Choose a package name",
            default: manifestOptions.name.toLowerCase().replace(/\s+/g, "-"),
            filter: val => val.toLowerCase(),
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
        {
            type: "list",
            name: "bundler",
            message: "Which bundler do you want to use?",
            choices: ["parcel", "webpack"],
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
                type: "input",
                name: "version_name",
                message: "Choose an initial version string",
                default: "1.0.0-alpha.0",
            },
            {
                type: "list",
                name: "toolbar_color",
                message: "Choose a toolbar color",
                choices: ["red", "orange", "yellow", "green", "blue", "violet"],
            },
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
                validate: input => input === "none" || validateNumber(input),
                filter: val => (val === "none" ? -1 : val),
            },
        ]);
        Object.assign(manifestOptions, extraManifestOptions);
    }

    console.log(packageOptions);
    console.log(manifestOptions);

    manifestOptions.description = packageOptions.description;
    return {packageOptions, manifestOptions};
};

export const init = async (args: Result<typeof initArgs>) => {
    // // initial app options from user
    const {packageOptions, manifestOptions} = await promptInitialAppConfig(
        args
    );
    await copyTemplateToCWD(packageOptions);
    mangleBoilerplate(packageOptions, manifestOptions);

    console.log(
        `Live App Project initialized: ${manifestOptions.name} (${packageOptions.name})`
    );
};

const copyTemplateToCWD = (packageOptions: PackageOptions) => {
    const {typescript, bundler, name} = packageOptions;
    // get lib path
    const templateName = `${typescript ? "ts" : "js"}_${bundler}`;
    const templatePath = path.join(__dirname, "../templates", templateName);
    const options = {
        dereference: true,
        filter: (fileName: string) =>
            fileName.indexOf("node_modules") === -1 &&
            fileName.indexOf(".git/") === -1,
    };

    return new Promise((resolve, reject) =>
        ncp(templatePath, path.join(process.cwd(), name), options, error => {
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve();
        })
    );
};

const mangleBoilerplate = (
    packageOptions: PackageOptions,
    manifestOptions: ManifestOptions
) => {
    const {name, description} = packageOptions;
    const packagePath = path.join(process.cwd(), name, "package.json");
    mangleJsonConfig(packagePath, {name, description});
    const manifestPath = path.join(process.cwd(), name, "manifest.json");
    mangleJsonConfig(manifestPath, manifestOptions);
};

const mangleJsonConfig = (
    configPath: string,
    updates: PackageOptions | ManifestOptions
) => {
    const config = JSON.parse(fs.readFileSync(configPath).toString());
    Object.assign(config, updates);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
};
