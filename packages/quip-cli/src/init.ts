import {Result, Spec} from "arg";
import inquirer from "inquirer";
import path from "path";
import fs from "fs";
import {ncp} from "ncp";

export const initArgs: Spec = {};
interface QliInitOptions {
    name: string;
    description: string;
    typescript: boolean;
    bundler: string;
    manifest?: Manifest;
}

interface Manifest {
    version_name: string;
    toolbar_color: string;
    diable_app_level_comments: boolean;
    sizing_mode: string;
    initial_width: number;
    initial_height: number;
}

const promptInitialAppConfig = async (args: Result<typeof initArgs>) => {
    console.log("Creating a new Quip Live App");
    const defaultName = path
        .basename(process.cwd())
        .replace(/[^\w\d\s]/g, " ")
        .replace(/(:?^|\s)(\w)/g, c => c.toUpperCase());
    const validateNumber: (input: any) => true | string = val =>
        !isNaN(parseInt(val, 10)) || "Please enter a number";
    const name = await inquirer.prompt([
        {
            type: "input",
            name: "manifest_name",
            message:
                "What is the name of this app?\n(This is what users will see when inserting your app)\n",
            default: defaultName,
        },
    ]);
    const basics: QliInitOptions = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Choose a package name",
            default: name.manifest_name.toLowerCase().replace(/\s+/g, "-"),
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
        {
            type: "confirm",
            name: "manifest",
            message:
                "Would you like to customize your manifest.json now?\n(see: https://corp.quip.com/dev/liveapps/documentation#app-manifest)\n",
            default: true,
        },
    ]);
    if (basics.manifest) {
        const manifest = await inquirer.prompt([
            {
                type: "number",
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
                default: 200,
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
        console.log(manifest);
    }
    return basics;
};

export const init = async (args: Result<typeof initArgs>) => {
    // // initial app options from user
    const basics = await promptInitialAppConfig(args);
    await copyTemplateToCWD(basics);
    mangleBoilerplate(basics);
};

const copyTemplateToCWD = (basics: QliInitOptions) => {
    const {typescript, bundler, name} = basics;
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

const mangleBoilerplate = (basics: QliInitOptions) => {
    const {name, description, manifest} = basics;
    const packagePath = path.join(process.cwd(), name, "package.json");
    mangleJsonConfig(packagePath, {name, description});
    const manifestPath = path.join(process.cwd(), name, "manifest.json");
    const updates = manifest
        ? {name, description, ...manifest}
        : {name, description};
    mangleJsonConfig(manifestPath, updates);
};

const mangleJsonConfig = (
    configPath: string,
    updates: {[key: string]: string | number | boolean}
) => {
    const configStr = fs.readFileSync(configPath);
    const config = JSON.parse(configStr.toString());
    Object.assign(config, updates);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
};
