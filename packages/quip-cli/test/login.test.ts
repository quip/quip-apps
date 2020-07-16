import {test as oclifTest} from "@oclif/test";
import fs from "fs";
import * as http from "http";
import open from "open";
import path from "path";
import * as config from "../src/lib/config";
import {pathExists} from "../src/lib/util";
import {cleanFixtures} from "./test-util";

const homedir = path.join(__dirname, "fixtures", "homedir");
const doOAuthLogin = async (
    token: string,
    host: string = "127.0.0.1",
    port: number = 9898
) => {
    return new Promise((resolve, reject) => {
        try {
            http.request(
                {
                    host,
                    port,
                    path: `/?token=${token}`,
                },
                (response) => {
                    let data = "";
                    response.on("data", (d) => {
                        data += String(d);
                    });
                    response.on("end", () => {
                        resolve(data);
                    });
                }
            ).end();
        } catch (e) {
            reject(e);
        }
    });
};

jest.mock("open");
const mockedOpen = (open as unknown) as jest.Mock<typeof open>;
mockedOpen.mockImplementation(() => {
    // this command normally opens a browser and lets the user login,
    // so we have to load the place it would redirect to in order to
    // allow the script to continue
    doOAuthLogin("some-token");
    return open;
});

describe("qla login", () => {
    let configSpy: jest.SpyInstance;
    beforeAll(() => {
        configSpy = jest
            .spyOn(config, "defaultConfigPath")
            .mockImplementation(() => path.join(homedir, ".quiprc"));
    });
    afterAll(async () => {
        configSpy.mockRestore();
        await cleanFixtures();
    });
    describe("basic login", () => {
        oclifTest
            .stdout()
            .command(["login"])
            .it("creates a .quiprc file in $HOME", async (ctx) => {
                // Verify that we called open with the right URL
                expect(mockedOpen).toHaveBeenCalledWith(
                    "https://quip.com/api/cli/token?r=http%3A%2F%2F127.0.0.1%3A9898"
                );
                const rcPath = path.join(homedir, ".quiprc");
                expect(await pathExists(rcPath)).toBe(true);
                const configStr = (await fs.promises.readFile(
                    rcPath,
                    "utf-8"
                )) as string;
                let parsed = {};
                expect(() => {
                    parsed = JSON.parse(configStr);
                }).not.toThrowError();
                expect(parsed).toMatchInlineSnapshot(`
                    Object {
                      "sites": Object {
                        "quip.com": Object {
                          "accessToken": "some-token",
                        },
                      },
                    }
                `);
            });
        oclifTest
            .stdout()
            .do(() => mockedOpen.mockReset())
            .command(["login"])
            .it("Doesn't log in if you're already logged in", async (ctx) => {
                expect(ctx.stdout).toMatchInlineSnapshot(`
                    "You're already logged in to quip.com. Pass --force to log in again.
                    "
                `);
                expect(mockedOpen).not.toHaveBeenCalled();
            });
    });
});
