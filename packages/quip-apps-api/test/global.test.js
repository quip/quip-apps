const test = require("tape");
const importFresh = require("import-fresh");

// Quip API needs a window...
global.window = {};

test("global quip", t => {
    t.plan(3);
    const globalQuip = {};
    t.notEqual(
        importFresh(".."),
        globalQuip,
        "when there is no global, quip is the imported quip"
    );
    global.quip = globalQuip;
    t.equal(
        importFresh(".."),
        globalQuip,
        "quip is the global quip when global quip exists"
    );
    global.quip = undefined;
    t.notEqual(
        importFresh(".."),
        globalQuip,
        "quip is unique again after setting global to undefined"
    );
});
