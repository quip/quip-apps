import {test as oclifTest} from "@oclif/test";
import {exec as exec_node} from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

const exec = util.promisify(exec_node);

describe("qla migration", () => {
    beforeAll(async () => {
        process.chdir(path.join(__dirname));
        try {
            await exec("git diff --exit-code fixtures");
            const {stdout} = await exec("git clean -n fixtures");
            if (stdout) {
                throw new Error(`found unstaged files: ${stdout}`);
            }
        } catch (e) {
            process.stderr.write(
                "Cannot run with dirty fixtures.\ngit add your fixtures changes first, and make sure that your tests are properly calling cleanup.\n"
            );
            process.exit(1);
        }
    });
    const useFixtureDir = (dir: string) => {
        process.chdir(path.join(__dirname, "fixtures", dir));
        return async () => {
            process.chdir(path.join(__dirname, "fixtures", dir));
            await exec("git clean -fd; git checkout .");
        };
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
        beforeEach(() => {
            cleanup = useFixtureDir("no-args");
        });
        afterAll(() => cleanup());

        test("verify manifest", async () => {
            console.log(process.cwd());
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
                const migration = await fs.promises.readFile(
                    manifest.migrations[0].js_file,
                    "utf-8"
                );
                expect(migration).toMatchSnapshot();
            });
        oclifTest
            .command(["migration"])
            .it(
                "increments the migration number when adding another",
                async (ctx) => {
                    const manifest = await readManifest();
                    expect(manifest.migrations).toMatchSnapshot();
                }
            );
    });
});
