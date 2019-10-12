// Copyright 2019 Quip
const test = require("tape");
const _ = require("..").default;

test("Inputs", t => {
    t.plan(2);
    t.equal(_("Foo"), "Foo", "outputs the same string when given a string");
    t.equal(_(3), 3, "passes through numbers");
});

test("[comment] strings", t => {
    t.plan(3);
    t.equal(
        _("Foo [bar]"),
        "Foo",
        "strips [comment] strings at the end of a string"
    );
    t.equal(
        _("Foo[bar]"),
        "Foo[bar]",
        "does not strip [comment] strings not preceded by a space"
    );
    t.equal(
        _("Foo [bar] "),
        "Foo [bar] ",
        "does not strip [comment] strings if followed by a space"
    );
});

test("replacement strings", t => {
    t.plan(3);
    t.equal(
        _("Hello %(name)s", {name: "foo"}),
        "Hello foo",
        "replaces 1 string properly"
    );
    t.equal(
        _("Hello %(name)s, you are a %(noun)s", {name: "foo", noun: "bedbug"}),
        "Hello foo, you are a bedbug",
        "replaces 2 strings properly"
    );
    t.equal(
        _("Hello %(name)s", {pork: "foo"}),
        "Hello %(name)s",
        "does not replace when no matching key is found"
    );
});
