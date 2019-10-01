// Copyright Quip 2019

/**
 * @fileoverview This module exposes a fake interface of the entire quip API, so
 * that code that expects to be in a Quip Live Apps environment can still
 * compile and run. In addition, if a quip global namespace already exists, this
 * library will default to using that instead of mocking, meaning that you can
 * just require this package in both test and prod, and it will only stub when necessary.
 */

let global_;
if (typeof window !== "undefined") {
    global_ = window;
} else if (typeof global !== "undefined") {
    global_ = global;
} else if (typeof self !== "undefined") {
    global_ = self;
} else {
    global_ = this || {};
}
module.exports =
    global_["quip"] === undefined ? require("./quip") : global_["quip"];
