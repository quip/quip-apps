import { Command, flags } from "@oclif/command";
import chalk from "chalk";
import fs from "fs";
import http from "http";
import open from "open";
import path from "path";
import qs from "querystring";
import url from "url";
import { isLoggedIn } from "../lib/auth";
import {
    DEFAULT_SITE,
    defaultConfigPath,
    writeSiteConfig,
} from "../lib/config";
import pkceChallenge from "pkce-challenge";
import { callAPI, getStateString } from "../lib/cli-api";
import { println } from "../lib/print";
import { ChildProcess } from "child_process";

type ResponseParams = { [key: string]: string | string[] | undefined };

let server_: http.Server | undefined;
const waitForLogin = (
    hostname: string,
    port: number,
    ready: () => void
): Promise<ResponseParams> => {
    const pagePromise = fs.promises.readFile(
        path.join(__dirname, "../..", "templates", "logged-in.html"),
        "utf-8"
    );
    const loginCancelledPagePromise = fs.promises.readFile(
        path.join(__dirname, "../..", "templates", "logged-in-cancelled.html"),
        "utf-8"
    );
    return new Promise((resolve) => {
        server_ = http.createServer(async (req, res) => {
            const urlInfo = url.parse(req.url || "");
            const query = qs.parse(urlInfo.query || "");
            resolve(query);

            if (query.next) {
                res.statusCode = 302;
                res.setHeader("Location", query.next);
                res.end();
            } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                if (query.cancelled) {
                    res.end(await loginCancelledPagePromise);
                } else {
                    res.end(await pagePromise);
                }
            }

            server_?.close();
        });
        server_.listen(port, hostname, ready);
    });
};

const DEFAULT_HOSTNAME = "127.0.0.1";
const DEFAULT_PORT = 9898;

export const login = async ({
    site,
    hostname = DEFAULT_HOSTNAME,
    port = DEFAULT_PORT,
    config = defaultConfigPath(),
    saveSiteConfig = true,
}: {
    site: string;
    hostname?: string;
    port?: number;
    config?: string;
    saveSiteConfig?: boolean;
}): Promise<string> => {
    const { code_challenge, code_verifier } = pkceChallenge(43);
    const state = getStateString();

    const redirectURL = `http://${hostname}:${port}`;
    let loginURL = `https://${site}/cli/login?client_id=quip-cli&response_type=code&redirect_uri=${encodeURIComponent(
        redirectURL
    )}&state=${state}&code_challenge=${code_challenge}&code_challenge_method=S256`;
    println(
        `opening login URL in your browser. Log in to Quip there.\n${loginURL}\n`
    );
    let currentWindow: ChildProcess | undefined;
    const responseParams = await waitForLogin(hostname, port, async () => {
        currentWindow = await open(loginURL);
    });
    currentWindow?.emit("close");
    if (responseParams.cancelled) {
        throw new Error("Login cancelled.");
    } else if (responseParams.state !== state) {
        throw new Error("API returned invalid state.");
    } else if (!responseParams.code || responseParams.error) {
        throw new Error(
            `Login Failed: ${
                responseParams.error ||
                `no code returned, got ${JSON.stringify(
                    responseParams,
                    null,
                    2
                )}`
            }`
        );
    }

    const tokenResponse = await callAPI(site, "token", "post", {
        client_id: "quip-cli",
        grant_type: "authorization_code",
        redirect_uri: encodeURIComponent(redirectURL),
        code_verifier: code_verifier,
        code: responseParams.code,
    });
    const accessToken = tokenResponse.accessToken || tokenResponse.access_token;
    if (!accessToken || tokenResponse.error) {
        throw new Error(
            `Failed to acquire access token: ${
                tokenResponse.error
            } - response: ${JSON.stringify(tokenResponse, null, 2)}`
        );
    }
    if (saveSiteConfig) {
        await writeSiteConfig(config, site, { accessToken });
    }
    return accessToken;
};

export default class Login extends Command {
    static description =
        "Logs in to Quip and stores credentials in the .quiprc file";
    static flags = {
        help: flags.help({ char: "h" }),
        force: flags.boolean({
            char: "f",
            description:
                "forces a re-login even if a user is currently logged in",
        }),
        site: flags.string({
            char: "s",
            description:
                "use a specific quip site rather than the standard quip.com login",
            default: DEFAULT_SITE,
        }),
        "with-token": flags.string({
            char: "t",
            description:
                "log in users with your specified access token instead of redirecting to a login page.\n" +
                "SEE ALSO: https://quip.com/dev/automation/documentation/current#tag/Authentication",
            helpValue: "token",
        }),
        export: flags.boolean({
            char: "e",
            description:
                "Get a new access token with login, then display the token in the terminal without storing it in the config file.\n" +
                "Note: You can’t use both the `--export` and `--with-token` options in the same command.",
        }),
        port: flags.integer({
            hidden: true,
            description:
                "Use a custom port for the OAuth redirect server (defaults to 9898)",
            default: DEFAULT_PORT,
        }),
        hostname: flags.string({
            hidden: true,
            description:
                "Use a custom hostname for the OAuth redirect server (defaults to 127.0.0.1)",
            default: DEFAULT_HOSTNAME,
        }),
        config: flags.string({
            hidden: true,
            description: "Use a custom config file (default ~/.quiprc)",
            default: () => defaultConfigPath(),
        }),
    };

    static args = [];

    async catch(error: Error) {
        server_?.close();
        throw error;
    }

    async run() {
        const { flags } = this.parse(Login);

        const { site, force, hostname, port, config } = flags;
        let accessToken = flags["with-token"];
        const displayTokenOnly = flags["export"];

        // displays error message if command has "--with-token" flag without passing a value.
        if (accessToken === "") {
            this.error("Flag --with-token expects a value.");
            return;
        }

        if (accessToken !== undefined && displayTokenOnly) {
            this.error(
                "Flags --with-token and --export cannot be used together."
            );
            return;
        }

        if (!force && !displayTokenOnly && (await isLoggedIn(config, site))) {
            let alt = "";
            if (site === DEFAULT_SITE) {
                alt = " or --site to log in to a different site";
            }
            this.log(
                `You're already logged in to ${site}. Pass --force to log in again${alt}.`
            );
            return;
        }

        try {
            if (accessToken) {
                await writeSiteConfig(config, site, { accessToken });
            } else {
                const saveSiteConfig = !displayTokenOnly;
                accessToken = await login({
                    site,
                    hostname,
                    port,
                    config,
                    saveSiteConfig,
                });
            }
            if (displayTokenOnly) {
                this.log(
                    chalk`{magenta Your access token is "${accessToken}".}`
                );
            } else {
                this.log("Successfully logged in.");
            }
        } catch (e) {
            this.error(e);
        }
    }
}
