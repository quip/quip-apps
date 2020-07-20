import {test as oclifTest} from "@oclif/test";
import {exec as exec_node} from "child_process";
import fs from "fs";
import MockDate from "mockdate";
import util from "util";
import {readManifest, useFixtureDir} from "./test-util";

const exec = util.promisify(exec_node);

describe("qla migration", () => {
    beforeAll(async () => {
        // we use dates to generate names. Make this static so we can snapshot generated dates
        MockDate.set(1434319925275);
    });
    afterAll(() => {
        MockDate.reset();
    });

    describe("running with no arguments", () => {
        let cleanup: Function;
        beforeAll(() => {
            cleanup = useFixtureDir("no-args");
        });
        afterAll(() => cleanup());

        test("verify manifest", async () => {
            const manifest = await readManifest();
            // We run this first to force snapshots to be updated when fixtures change.
            expect(manifest).toMatchSnapshot();
        });
        oclifTest
            .command(["migration"])
            .it("creates a migration with today's date", async (ctx) => {
                const manifest = await readManifest();
                expect(manifest.migrations).toBeDefined();
                expect(manifest.migrations[0]).toMatchInlineSnapshot(`
                    Object {
                      "js_file": "migrations/20150614_01.js",
                      "version_number": 1,
                    }
                `);
                const migration = await fs.promises.readFile(
                    manifest.migrations[0].js_file,
                    "utf-8"
                );
                expect(migration).toMatchSnapshot();
            });
        test("migration exists before running second test", () => {
            expect(() =>
                fs.statSync("migrations/20150614_01.js")
            ).not.toThrowError();
        });
        oclifTest
            .command(["migration"])
            .it(
                "increments the migration number when adding another",
                async (ctx) => {
                    const manifest = await readManifest();
                    expect(manifest.migrations).toMatchInlineSnapshot(`
                        Array [
                          Object {
                            "js_file": "migrations/20150614_01.js",
                            "version_number": 1,
                          },
                          Object {
                            "js_file": "migrations/20150614_02.js",
                            "version_number": 1,
                          },
                        ]
                    `);
                }
            );
    });

    describe("running with a file name", () => {
        let cleanup: Function;
        beforeEach(() => {
            cleanup = useFixtureDir("with-name");
        });
        afterAll(() => cleanup());

        test("verify manifest", async () => {
            const manifest = await readManifest();
            // We run this first to force snapshots to be updated when fixtures change.
            expect(manifest).toMatchSnapshot();
        });
        oclifTest
            .command(["migration", "Add new Flobs to all the Fleebs"])
            .it(
                "creates a migration with a filesystem friendly name",
                async (ctx) => {
                    const manifest = await readManifest();
                    expect(manifest.migrations[0]).toMatchInlineSnapshot(`
                        Object {
                          "js_file": "migrations/20150614_add_new_flobs_to_all_the_fleebs.js",
                          "version_number": 1,
                        }
                    `);
                }
            );
        oclifTest
            .command(["migration", "Add new Flobs to // all the Fleebs"])
            .it(
                "increments the migration number when adding another",
                async (ctx) => {
                    const manifest = await readManifest();
                    expect(manifest.migrations[1]).toMatchInlineSnapshot(`
                        Object {
                          "js_file": "migrations/20150614_add_new_flobs_to____all_the_fleebs.js",
                          "version_number": 1,
                        }
                    `);
                }
            );
    });

    describe("targeting a version (-v)", () => {
        let cleanup: Function;
        beforeEach(() => {
            cleanup = useFixtureDir("version");
        });
        afterAll(() => cleanup());

        test("verify manifest", async () => {
            const manifest = await readManifest();
            // We run this first to force snapshots to be updated when fixtures change.
            expect(manifest).toMatchSnapshot();
        });
        oclifTest
            .command(["migration", "version", "-v=42"])
            .it("adds the correct version_number", async (ctx) => {
                const manifest = await readManifest();
                expect(manifest.migrations[0]).toMatchInlineSnapshot(`
                    Object {
                      "js_file": "migrations/20150614_version.js",
                      "version_number": 42,
                    }
                `);
            });
    });

    describe("works when manifest manually specified", () => {
        let cleanup: Function;
        beforeEach(() => {
            cleanup = useFixtureDir("custom-manifest-path");
        });
        afterAll(() => cleanup());
        oclifTest
            .stderr()
            .command(["migration", "--manifest=custom/manifest.json"])
            .it("does not fail", async (ctx) => {
                expect(ctx.stderr).toBeFalsy();
                const manifest = await readManifest("custom");
                expect(manifest.migrations).toBeDefined();
                expect(manifest.migrations[0]).toMatchInlineSnapshot(`
                    Object {
                      "js_file": "../migrations/20150614_01.js",
                      "version_number": 1,
                    }
                `);
                expect(() =>
                    fs.statSync("migrations/20150614_01.js")
                ).not.toThrowError();
            });
    });

    describe("works when manifest is in a subdir", () => {
        let cleanup: Function;
        beforeEach(() => {
            cleanup = useFixtureDir("subdir");
        });
        afterAll(() => cleanup());
        oclifTest
            .stderr()
            .command(["migration", "subdir"])
            .it("does not fail", async (ctx) => {
                expect(ctx.stderr).toBeFalsy();
                const manifest = await readManifest("app");
                expect(manifest.migrations).toBeDefined();
                expect(manifest.migrations[0]).toMatchInlineSnapshot(`
                    Object {
                      "js_file": "../migrations/20150614_subdir.js",
                      "version_number": 1,
                    }
                `);
                expect(() =>
                    fs.statSync("migrations/20150614_subdir.js")
                ).not.toThrowError();
            });
    });

    describe("specifying a folder (-f)", () => {
        let cleanup: Function;
        beforeEach(() => {
            cleanup = useFixtureDir("folders");
        });
        afterAll(() => cleanup());

        oclifTest
            .command(["migration", "--folder=created-folder", "some-name"])
            .it(
                "creates a new folder and adds a migration to the specified folder",
                async (ctx) => {
                    const manifest = await readManifest();
                    expect(manifest.migrations[0]).toMatchInlineSnapshot(`
                        Object {
                          "js_file": "created-folder/20150614_some-name.js",
                          "version_number": 1,
                        }
                    `);
                    expect(() =>
                        fs.statSync("created-folder/20150614_some-name.js")
                    ).not.toThrowError();
                }
            );
    });

    describe("running with --dry-run", () => {
        oclifTest
            .stdout()
            .command(["migration", "-v=50", "dry", "--dry-run"])
            .it("outputs dry run info", async (ctx) => {
                expect(ctx.stdout).toMatch(/Would create: \/.+\/migrations$/m);
                expect(ctx.stdout).toMatch(
                    /Would create: \/.+\/migrations\/20150614_dry.js$/m
                );
                expect(ctx.stdout).toMatch(/Would add migration:/);
                expect(ctx.stdout).toMatch(`"version_number": 50,`);
                expect(ctx.stdout).toMatch(
                    `"js_file": "migrations/20150614_dry.js"`
                );
            });
    });
});
