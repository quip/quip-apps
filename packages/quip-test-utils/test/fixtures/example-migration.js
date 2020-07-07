/**
 * deprecates the name "jacob", migrates it to the name "bromst"
 */
quip.apps.registerMigration(rootRecord => {
    const name = rootRecord.get("name");
    if (name === "jacob") {
        rootRecord.set("name", "bromst");
    }
    return rootRecord;
});
