const test = require("tape");
const {run} = require("./util");

test("calling with no options prints usage", async t => {
    t.plan(4);
    const [err, stdout, stderr] = await run();
    t.error(err);
    t.notOk(stderr);
    t.ok(stdout);
    t.match(stdout.trim(), /^quip-cli version [\d\w\.-]+/);
});
