import {Command, flags} from "@oclif/command";
import mkdirp from "mkdirp";
import path from "path";
import {
    findManifest,
    getManifest,
    manifestFlag,
    writeManifest,
} from "../lib/manifest";
import {copy, pathExists} from "../lib/util";

export default class Migration extends Command {
    static description = "Creates a new migration";

    static flags = {
        help: flags.help({char: "h"}),
        folder: flags.string({
            char: "f",
            description: "The folder where your migrations are stored",
            default: "migrations",
        }),
        manifest: manifestFlag,
        version: flags.integer({
            char: "v",
            description:
                "The version to generate this migration for. By default, it will use the current version_number in the manifest",
        }),
        ["dry-run"]: flags.boolean({
            char: "d",
            hidden: true,
            description:
                "Print what this would do, but don't create any files.",
        }),
    };

    static args = [
        {
            name: "name",
            optional: true,
            description: "A short description to generate the filename with",
        },
    ];

    private getMigrationName_(name?: string): string {
        const desc = name
            ? `_${name.replace(/[^\w\d_-]/g, "_").toLowerCase()}`
            : "_01";
        const migrationDate = new Date()
            .toISOString()
            .substring(0, 10)
            .replace(/-/g, "");
        return `${migrationDate}${desc}`;
    }

    private incrementMigrationName_(name: string): string {
        const match = name.match(/^(.+)_(\d+)$/);
        if (match) {
            const number = parseInt(match[2]);
            const numString = String(number + 1).padStart(2, "0");
            return `${match[1]}_${numString}`;
        }
        return `${name}_01`;
    }

    async run() {
        const {args, flags} = this.parse(Migration);
        const dryRun = flags["dry-run"];
        let manifestPath = flags.manifest;
        if (flags.manifest && !(await pathExists(flags.manifest))) {
            throw new Error(
                `Provided manifest ${flags.manifest} does not exist.`
            );
        }
        if (!manifestPath) {
            manifestPath = await findManifest(process.cwd());
            if (!manifestPath) {
                throw new Error(`Could not find a manifest.json file.`);
            }
        }
        const ops: (() => Promise<any>)[] = [];
        const migrationsFolder = path.join(process.cwd(), flags.folder);
        if (dryRun) {
            if (!(await pathExists(migrationsFolder))) {
                this.log(`Would create: ${migrationsFolder}`);
            }
        } else {
            ops.push(() => mkdirp(migrationsFolder));
        }
        const extension = ".js";
        let name = this.getMigrationName_(args.name);
        let migrationPath = path.join(migrationsFolder, name + extension);
        while (await pathExists(migrationPath)) {
            name = this.incrementMigrationName_(name);
            migrationPath = path.join(migrationsFolder, name + extension);
        }
        if (dryRun) {
            this.log(`Would create: ${migrationPath}`);
        } else {
            ops.push(() =>
                copy(
                    path.join(
                        __dirname,
                        "../../templates/migration.example.js"
                    ),
                    migrationPath
                )
            );
        }
        const manifest = await getManifest(manifestPath);
        const migrations = manifest.migrations || [];
        migrations.push({
            version_number: flags.version || manifest.version_number,
            js_file: path.relative(path.dirname(manifestPath), migrationPath),
        });
        if (dryRun) {
            this.log("Would add migration:");
            this.log(
                JSON.stringify(migrations[migrations.length - 1], null, 4)
            );
        } else {
            ops.push(() => writeManifest(manifestPath!, {migrations}));
        }
        for (const op of ops) {
            await op();
        }
    }
}
