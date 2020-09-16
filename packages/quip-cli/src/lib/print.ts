import chalk from "chalk";

export const print = process.stdout.write.bind(process.stdout);
export const println = console.log;

const ptabs = (count: number) => {
    let tabs = "";
    for (var i = 0; i < count; i++) {
        tabs += " ";
    }
    return tabs;
};

export const prettyPrintObject = (
    obj: any,
    tabs: number = 0,
    prefix: string = ""
) => {
    if (!obj) {
        return;
    } else if (Array.isArray(obj)) {
        print("\n");
        for (let i = 0; i < obj.length; i++) {
            const item = obj[i];
            print(chalk`${prefix}${ptabs(tabs)}{grey [${i}]: }`);
            prettyPrintObject(item, tabs + 1);
        }
    } else if (typeof obj === "object") {
        print("\n");
        for (const key in obj) {
            print(chalk`${prefix}${ptabs(tabs)}{grey - ${key}:} `);
            prettyPrintObject(obj[key], tabs + 1);
        }
    } else {
        print(chalk`${prefix}{green ${obj}}
`);
    }
};
