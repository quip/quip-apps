// Copyright Quip 2019

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
    global_["quiptext"] === undefined
        ? require("./dist/quiptext")
        : global_["quiptext"];
