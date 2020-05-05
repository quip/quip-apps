import {Result, Spec} from "arg";
import inquirer from "inquirer";
import path from "path";

export const initArgs: Spec = {};

export const init = async (args: Result<typeof initArgs>) => {
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
    const basics = await inquirer.prompt([
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
};
