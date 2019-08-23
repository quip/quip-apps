// Copyright 2019 Quip
const test = require("tape");
const global = require("global");
const importFresh = require("import-fresh");

test("global quiptext", t => {
    t.plan(3);
    const globalQuipText = function() {};
    t.notEqual(
        importFresh(".."),
        globalQuipText,
        "when there is no global, quiptext is unique"
    );
    global.quiptext = globalQuipText;
    t.equal(
        importFresh(".."),
        globalQuipText,
        "quiptext is global quiptext when global quiptext exists"
    );
    global.quiptext = undefined;
    t.notEqual(
        importFresh(".."),
        globalQuipText,
        "quiptext is unique again after setting global to undefined"
    );
});
