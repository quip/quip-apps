let config = require("quip-apps-webpack-config");
config.entry = ["./src/isReactComponentPolyfill.js", ...config.entry];

// we need to nuke the svg-react-loader in quip-apps-webpack-config
let loaders = config.module.loaders.filter(
    f => (f.test.toString() === /\.svg/.toString() ? null : f));

loaders.unshift({
    test: /\.(eot|woff|woff2|ttf)$/,
    loader: "file-loader?name=assets/fonts/webfonts/[name].[ext]",
});

loaders.unshift({
    test: /\.svg$/,
    loader: "file-loader",
    options: {
        name: "[name].[ext]",
        useRelativePath: true,
    },
});
config.module.loaders = loaders;

// Allow svg to be used in local resource mode
let headers = config.devServer.headers;
if (!headers) {
    headers = config.devServer.headers = {};
}
headers["Access-Control-Allow-Origin"] = "*";

module.exports = config;
