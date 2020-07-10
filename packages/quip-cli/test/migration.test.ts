import {test as oclifTest} from "@oclif/test";
import {exec as exec_node} from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

const exec = util.promisify(exec_node);

describe("qla migration", () => {
    const useFixtureDir = async (dir: string) => {
        process.chdir(path.join(__dirname, "fixtures", dir));
        await exec("git clean -fd; git checkout .");
        return () => useFixtureDir(dir);
    };
    const readManifestContent = async (): Promise<string> => {
        return String(await fs.promises.readFile("manifest.json", "utf-8"));
    };
    const readManifest = async () => {
        const content = await readManifestContent();
        return JSON.parse(content);
    };

    describe("running with no arguments", () => {
        let cleanup: Function;
        beforeAll(async () => {
            cleanup = await useFixtureDir("migration");
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
                      "js_file": "migrations/20200710_01.js",
                      "version_number": 1,
                    }
                `);
            });
    });
});
