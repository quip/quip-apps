import RootRecord from "./root-record";

export type MigrationFn = (
    record: RootRecord
) => RootRecord | Promise<RootRecord>;

export default function registerMigration(migration: MigrationFn) {
    throw new Error(
        "Migrations may only be registered inside a Quip instance."
    );
}
