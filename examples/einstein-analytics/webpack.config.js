let config = require("quip-apps-webpack-config");
config.entry = ["./src/isReactComponentPolyfill.js", ...config.entry];
config.module.loaders.push({
    test: /\.(svg|gif|jpe?g|png)$/,
    loader: "url-loader?limit=10000",
});
config.module.loaders.push({
    test: /\.(eot|woff|woff2|ttf)$/,
    loader: "url-loader?limit=30&name=assets/fonts/webfonts/[name].[ext]",
});
module.exports = config;
