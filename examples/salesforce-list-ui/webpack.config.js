let config = require("quip-apps-webpack-config");
config.entry = ["./src/isReactComponentPolyfill.js", ...config.entry];

let loaders = config.module.loaders;
loaders.unshift({
    test: /\.(eot|woff|woff2|ttf)$/,
    loader: "file-loader?name=assets/fonts/webfonts/[name].[ext]",
});
config.module.loaders = loaders;

module.exports = config;
