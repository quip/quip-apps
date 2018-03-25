const config = require("quip-apps-webpack-config");
const CopyWebpackPlugin = require("copy-webpack-plugin");

// Copy KaTeX files so they can be used in the app
config.plugins.push(new CopyWebpackPlugin([
    {from: "node_modules/katex/dist/katex.min.js", to: "katex"},
    {from: "node_modules/katex/dist/katex.min.css", to: "katex"},
    {from: "node_modules/katex/dist/fonts", to: "katex/fonts"}
]));

// Allow fonts to be used in local resource mode
let headers = config.devServer.headers;
if (!headers) {
    headers = config.devServer.headers = {};
}
headers["Access-Control-Allow-Origin"] = "*";

module.exports = config;
