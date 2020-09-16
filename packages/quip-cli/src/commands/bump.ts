import {Command, flags} from "@oclif/command";

export default class Bump extends Command {
    static description = "Bump the application version";

    static flags = {
        help: flags.help({char: "h"}),
    };

    static args = [
        {
            name: "increment",
            description:
                "which number to bump - can be one of 'major', 'minor', or 'patch' - defaults to 'patch'",
        },
    ];

    async run() {
        const {args, flags} = this.parse(Bump);
        const increment = args.increment ?? "patch";
        if (!["major", "minor", "patch"].includes(increment.toLowerCase())) {
            this._help();
        } else {
            // TODO
        }
    }
}
