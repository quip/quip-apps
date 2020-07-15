import {Command, flags} from "@oclif/command";
import http from "http";
import open from "open";
import qs from "querystring";
import url from "url";
import {defaultConfigPath, writeConfig} from "../lib/config";

type ResponseParams = {[key: string]: string | string[] | undefined};

export default class Login extends Command {
    static description =
        "Logs in to Quip and stores credentials in the .quiprc file";
    static flags = {
        help: flags.help({char: "h"}),
        force: flags.string({
            char: "f",
            description:
                "forces a re-login even if a user is currently logged in",
        }),
        site: flags.string({
            char: "s",
            description:
                "use a specific quip site rather than the standard quip.com login",
            default: "quip.com",
        }),
        port: flags.integer({
            hidden: true,
            description:
                "Use a custom port for the OAuth redirect server (defaults to 9898)",
            default: 9898,
        }),
        hostname: flags.string({
            hidden: true,
            description:
                "Use a custom hostname for the OAuth redirect server (defaults to 127.0.0.1)",
            default: "127.0.0.1",
        }),
        config: flags.string({
            hidden: true,
            description: "Use a custom config file (default ~/.quiprc)",
            default: () => defaultConfigPath(),
        }),
    };

    static args = [];

    private server_: http.Server | undefined;
    private waitForLogin = (
        hostname: string,
        port: number,
        ready: () => void
    ): Promise<ResponseParams> => {
        return new Promise((resolve) => {
            this.server_ = http.createServer((req, res) => {
                const urlInfo = url.parse(req.url || "");
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/plain");
                res.end("ok");
                resolve(qs.parse(urlInfo.query || ""));
                this.server_?.close();
            });
            this.server_.listen(port, hostname, ready);
        });
    };

    async catch(error: Error) {
        this.server_?.close();
        throw error;
    }

    async run() {
        const {flags} = this.parse(Login);

        const {site, hostname, port, config} = flags;

        const redirectURL = `http://${hostname}:${port}`;
        const oAuthURL = `https://${site}/api/cli/token?r=${encodeURIComponent(
            redirectURL
        )}`;
        const responseParams = await this.waitForLogin(hostname, port, () =>
            open(oAuthURL)
        );
        this.log(JSON.stringify(responseParams, null, 4));
        const accessToken = responseParams["token"] as string | undefined;
        if (!accessToken) {
            this.log(
                `Invalid response:\n${JSON.stringify(responseParams, null, 2)}`
            );
            throw new Error("No token received");
        }
        await writeConfig({accessToken}, config);
        this.log("Successfully logged in.");
    }
}
