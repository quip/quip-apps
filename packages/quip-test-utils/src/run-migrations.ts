// Copyright 2020 Quip
import fs from "fs";
import path from "path";
import quip from "quip-apps-api";

interface Migration {
    version_number: number;
    js_file: string;
}

interface Manifest {
    manifest_version: number;
    version_name: string;
    version_number: number;
    migrations: Migration[];
}

export default async function runMigrations(
    manifest: Manifest,
    appVersion: number,
    record: quip.apps.RootRecord
) {
    if (!manifest.migrations) {
        throw new Error(
            "runMigrations called with a manifest that does not define any migrations. This is probably not intentional."
        );
    }
    const neededMigrations = manifest.migrations
        .filter(m => m.version_number && appVersion <= m.version_number)
        .sort((mA, mB) => {
            if (mA.version_number === mB.version_number) {
                return mA.js_file < mB.js_file ? -1 : 1;
            }
            return mA.version_number < mB.version_number ? -1 : 1;
        });
    console.log("needed:", neededMigrations, manifest.migrations);
    const migrationJs = await Promise.all(
        neededMigrations.map(m =>
            fs.promises.readFile(path.join(process.cwd(), m.js_file), "utf-8")
        )
    );
    const remainingMigrations: Promise<void>[] = [];
    quip.apps.registerMigration = (migration: quip.MigrationFn) => {
        const migrate = async () => {
            record = await migration(record);
        };
        remainingMigrations.push(migrate());
    };
    migrationJs.forEach(js => {
        console.log(js);
        const migration = new Function("quip", js);
        migration(quip);
    });
    return Promise.all(remainingMigrations);
}
