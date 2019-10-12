// Copyright 2019 Quip
const test = require("tape");
const React = require("react");
const e = React.createElement;
const _ = require("..").default;

test("react: [comment] strings", t => {
    t.plan(1);
    const el = e("div", null, "Foo [testing]");
    t.equal(_(el), el, "does not strip [comment] strings");
});

test("react: createElement strategy still works", t => {
    t.plan(1);
    t.ok(React.isValidElement(e("div")), "yup");
});

test("react: replacing with one react element", t => {
    t.plan(3);
    const e1 = e("div", null, "FANCY BOY");
    const r1 = _("Hello %(name)s", {name: e1});
    t.equal(r1.length, 2, "outputs 2 nodes");
    t.equal(r1[0], "Hello ", "first node is the first part of the string");
    t.equal(r1[1], e1, "second node is the react element");
});

test("react: replacing with two react elements", t => {
    t.plan(2);
    const e1 = e("div", null, "apple");
    const e2 = e("div", null, "cherry");
    const r1 = _("some fruits are %(f1)s and %(f2)s", {f1: e1, f2: e2});
    t.equal(r1.length, 4, "outputs 4 nodes");
    t.deepEqual(r1, ["some fruits are ", e1, " and ", e2], "properly parses");
});

test("react: replacing the first item with a react element", t => {
    t.plan(3);
    const e1 = e("span", null, "Peter");
    const r1 = _("%(name)s is a good boy", {name: e1});
    t.equal(r1.length, 2, "outputs 2 nodes");
    t.equal(r1[0], e1, "first node is the react element");
    t.equal(r1[1], " is a good boy", "second node is the end of the string");
});
