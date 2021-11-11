import { test as oclifTest } from "@oclif/test";
import fs from "fs";
import * as http from "http";
import open from "open";
import path from "path";
import * as config from "../src/lib/config";
import { pathExists } from "../src/lib/util";
import { cleanFixtures } from "./test-util";
import { callAPI, getStateString } from "../src/lib/cli-api";
import createChallenge from "pkce-challenge";

const homedir = path.join(__dirname, "fixtures", "homedir");
const makeLoginRequest = async (
    path: string,
    host: string = "127.0.0.1",
    port: number = 9898
) => {
    return new Promise((resolve, reject) => {
        try {
            http.request(
                {
                    host,
                    port,
                    path,
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
const mockedOpen = (open as unknown) as jest.Mock<Promise<any>>;
// this command normally opens a browser and lets the user login, so in test we
// just skip the user interaction and redirect back to a given URL.
const redirectToUrl = (url: string, host?: string, port?: number) => {
    mockedOpen.mockImplementationOnce(() => makeLoginRequest(url, host, port));
};
jest.mock("pkce-challenge");
const mockedPKCE = (createChallenge as unknown) as jest.Mock<{
    code_challenge: string;
    code_verifier: string;
}>;
mockedPKCE.mockReturnValue({
    code_challenge: "ch",
    code_verifier: "ve",
});
jest.mock("../src/lib/cli-api");
const mockedCallAPI = (callAPI as unknown) as jest.Mock<Promise<any>>;
const mockGetStateString = (getStateString as unknown) as jest.Mock<string>;
mockGetStateString.mockImplementation(() => "state1234");
const readQuiprcContent = async () => {
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
    return parsed;
};

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
    afterEach(() => {
        mockedOpen.mockClear();
        mockedCallAPI.mockClear();
    });
    describe("basic login", () => {
        oclifTest
            .stdout()
            .stderr()
            .do(() => {
                redirectToUrl("/?error=true");
            })
            .command(["login"])
            .exit(2)
            .it("A bad request exits non-zero");
        oclifTest
            .stdout()
            .do(() => {
                redirectToUrl("/?code=some-code&state=state1234");
                mockedCallAPI.mockResolvedValueOnce({
                    access_token: "an-access-token",
                    token_type: "Bearer",
                });
            })
            .command(["login"])
            .it("creates a .quiprc file in $HOME", async (ctx) => {
                // Verify that we called open with the right URL
                expect(mockedOpen).toHaveBeenCalledWith(
                    "https://quip.com/cli/login?client_id=quip-cli&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A9898&state=state1234&code_challenge=ch&code_challenge_method=S256"
                );
                expect(mockedCallAPI).toHaveBeenCalledWith(
                    "quip.com",
                    "token",
                    "post",
                    {
                        client_id: "quip-cli",
                        code: "some-code",
                        code_verifier: "ve",
                        grant_type: "authorization_code",
                        redirect_uri: "http%3A%2F%2F127.0.0.1%3A9898",
                    }
                );
                expect(await readQuiprcContent()).toMatchInlineSnapshot(`
                    Object {
                      "sites": Object {
                        "quip.com": Object {
                          "accessToken": "an-access-token",
                        },
                      },
                    }
                `);
            });
        oclifTest
            .stdout()
            .command(["login"])
            .it("Doesn't log in if you're already logged in", async (ctx) => {
                expect(ctx.stdout).toMatchInlineSnapshot(`
                    "You're already logged in to quip.com. Pass --force to log in again or --site to log in to a different site.
                    "
                `);
                expect(mockedOpen).not.toHaveBeenCalled();
            });
        oclifTest
            .stdout()
            .do(() => {
                redirectToUrl("/?code=some-code&state=state1234");
                mockedCallAPI.mockResolvedValueOnce({
                    access_token: "another-token",
                    token_type: "Bearer",
                });
            })
            .command(["login", "--force"])
            .it(
                "logs in again regardless when passing --force",
                async (ctx) => {
                    expect(mockedOpen).toHaveBeenCalled();
                    expect(mockedCallAPI).toHaveBeenCalled();
                    expect(await readQuiprcContent()).toMatchInlineSnapshot(`
                        Object {
                          "sites": Object {
                            "quip.com": Object {
                              "accessToken": "another-token",
                            },
                          },
                        }
                    `);
                }
            );
    });
    describe("customization", () => {
        oclifTest
            .stdout()
            .do(() => {
                redirectToUrl("/?code=some-code&state=state1234");
                mockedCallAPI.mockResolvedValueOnce({
                    access_token: "hello",
                    token_type: "Bearer",
                });
            })
            .command(["login", "--site", "quip.codes"])
            .it("passing --site results in a new login", async (ctx) => {
                // Verify that we called open with the right URL
                expect(mockedOpen).toHaveBeenCalledWith(
                    "https://quip.codes/cli/login?client_id=quip-cli&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A9898&state=state1234&code_challenge=ch&code_challenge_method=S256"
                );
                expect(mockedCallAPI).toHaveBeenCalledWith(
                    "quip.codes",
                    "token",
                    "post",
                    {
                        client_id: "quip-cli",
                        code: "some-code",
                        code_verifier: "ve",
                        grant_type: "authorization_code",
                        redirect_uri: "http%3A%2F%2F127.0.0.1%3A9898",
                    }
                );
                expect(await readQuiprcContent()).toMatchInlineSnapshot(`
                    Object {
                      "sites": Object {
                        "quip.codes": Object {
                          "accessToken": "hello",
                        },
                        "quip.com": Object {
                          "accessToken": "another-token",
                        },
                      },
                    }
                `);
            });
        oclifTest
            .stdout()
            .command(["login", "--site", "quip.codes"])
            .it(
                "prints a different message when re-logging in to a custom site",
                async (ctx) => {
                    expect(ctx.stdout).toMatchInlineSnapshot(`
                        "You're already logged in to quip.codes. Pass --force to log in again.
                        "
                    `);
                    expect(mockedOpen).not.toHaveBeenCalled();
                }
            );
        oclifTest
            .stdout()
            .do(() => {
                redirectToUrl(
                    "/?code=some-code&state=state1234",
                    "localhost",
                    6969
                );
                mockedCallAPI.mockResolvedValueOnce({
                    access_token: "hello",
                    token_type: "Bearer",
                });
            })
            .command([
                "login",
                "--force",
                "--hostname",
                "localhost",
                "--port=6969",
            ])
            .it("hostname and port can be customized", async (ctx) => {
                // Verify that we called open with the right URL
                expect(mockedOpen).toHaveBeenCalledWith(
                    "https://quip.com/cli/login?client_id=quip-cli&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A6969&state=state1234&code_challenge=ch&code_challenge_method=S256"
                );
            });
    });
    describe("login with access token", () => {
        oclifTest
            .stdout()
            .command(["login", "--force", "--with-token", "FAKE-ACCESS-TOKEN"])
            .it(
                "logs in with custom access token when passing --with-token",
                async () => {
                    expect(mockedOpen).not.toHaveBeenCalled();
                    expect(mockedCallAPI).not.toHaveBeenCalled();
                    expect(await readQuiprcContent()).toMatchInlineSnapshot(`
                    Object {
                      "sites": Object {
                        "quip.codes": Object {
                          "accessToken": "hello",
                        },
                        "quip.com": Object {
                          "accessToken": "FAKE-ACCESS-TOKEN",
                        },
                      },
                    }
                `);
                }
            );
    });
    oclifTest
        .stdout()
        .command(["login", "--with-token", "FAKE-ACCESS-TOKEN"])
        .it("Doesn't log in if you're already logged in", (ctx) => {
            expect(ctx.stdout).toMatchInlineSnapshot(`
                    "You're already logged in to quip.com. Pass --force to log in again or --site to log in to a different site.
                    "
                `);
            expect(mockedOpen).not.toHaveBeenCalled();
        });

    oclifTest
        .stdout()
        .command(["login", "--with-token="])
        .catch(err => {
            expect(err.message).toEqual("Flag --with-token expects a value.");
        })
        .it("stdout displays nothing when empty token is provided", (ctx) => {
            expect(ctx.stdout).toEqual("");
            expect(mockedOpen).not.toHaveBeenCalled();
        });

    oclifTest
        .stdout()
        .command(["login", "--with-token", "FAKE-ACCESS-TOKEN", "--export"])
        .catch(err => {
            expect(err.message).toEqual("Flags --with-token and --export cannot be used together.");
        })
        .it("Flags conflict between --with-token and --export", (ctx) => {
            expect(ctx.stdout).toEqual("");
            expect(mockedOpen).not.toHaveBeenCalled();
        });

    oclifTest
        .stdout()
        .do(() => {
            redirectToUrl("/?code=some-code&state=state1234");
            mockedCallAPI.mockResolvedValueOnce({
                access_token: "display-only-token",
                token_type: "Bearer",
            });
        })
        .command(["login", "--export"])
        .it("Display token in terminal only", async (ctx) => {
            expect(ctx.stdout).toContain('Your access token is "display-only-token".');
            expect(mockedOpen).toHaveBeenCalled();
            expect(mockedCallAPI).toHaveBeenCalled();
            // The display-only token will not be stored to local config file.
            expect(await readQuiprcContent()).toMatchInlineSnapshot(`
                    Object {
                      "sites": Object {
                        "quip.codes": Object {
                          "accessToken": "hello",
                        },
                        "quip.com": Object {
                          "accessToken": "FAKE-ACCESS-TOKEN",
                        },
                      },
                    }
                `);
        });

});
