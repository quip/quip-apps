import arg from "arg";
import pkg from "../package.json";

let args: arg.Result<any> = {_: []};
try {
    args = arg(
        {
            // Types
            "--help": Boolean,
            "--version": Boolean,
            "-v": "--version",
            "--verbose": arg.COUNT, // Counts the number of times --verbose is passed
            "--port": Number, // --port <number> or --port=<number>
            "--name": String, // --name <string> or --name=<string>
            "--tag": [String], // --tag <string> or --tag=<string>
        },
        {permissive: false, argv: process.argv.slice(2)}
    );
} catch (err) {
    if (err.code === "ARG_UNKNOWN_OPTION") {
        console.log(err.message);
    } else {
        throw err;
    }
}

if (args["--version"]) {
    process.stdout.write(pkg.version);
} else if (args["--help"] || args._.length === 0) {
    process.stdout.write(`
quip-cli version ${pkg.version}
usage:
    qla init
    qla deploy
`);
}
