// Copyright 2017 Quip

const path = require("path");
const config = require("quip-apps-webpack-config");

config.devServer.contentBase = path.resolve(__dirname);
config.devServer.headers = {
    "Access-Control-Allow-Origin": "*",
};

module.exports = config;
