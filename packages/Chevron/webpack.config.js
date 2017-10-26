// Copyright 2017 Quip
const path = require("path");
const cwd = process.cwd();

let Config = require("quip-apps-webpack-config");
Config.entry = [path.resolve(cwd, "./Chevron.js")];
Config.output = {
    path: path.resolve(cwd, "./dist"),
    filename: "Chevron.js",
    libraryTarget: "umd",
    publicPath: "dist"
};

module.exports = Config;
