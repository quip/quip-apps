const test = require("tape");
const quip = require("quip-apps-api");
const {runMigrations} = require("../dist/test-utils");
const manifest = require("./fixtures/migrations-manifest.json");

test("v42 deprecates the name 'jacob'", async t => {
    t.plan(2);
    const root = new Root();
    t.equal(root.get("name"), "jacob", "pre-migration name is jacob");
    await runMigrations(manifest, 42, root);
    t.equal(root.get("name"), "bromst", "post-migration name is bromst");
});

class Root extends quip.apps.RootRecord {}
Root.ID = "root";
Root.getProperties = function() {
    return {
        name: "string",
    };
};
Root.getDefaultProperties = function() {
    return {
        name: "jacob",
    };
};
