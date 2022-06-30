import path from "path";
import { platformHost } from "../../src/lib/cli-api";

test("platformHost", () => {
    expect(platformHost("corp.quip.com")).toEqual("platform.quip.com");
    expect(platformHost("staging.quip.com")).toEqual(
        "platform-staging.quip.com"
    );
    expect(platformHost("greatjob.onquip.com")).toEqual(
        "platform.greatjob.onquip.com"
    );
    expect(platformHost("some-url.com")).toEqual("platform.some-url.com");
});
