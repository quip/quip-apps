let config = require("quip-apps-webpack-config");
let loaders = config.module.loaders;
loaders.unshift({
  test: /\.(eot|woff|woff2|ttf|svg|otf)$/,
  loader: "file-loader",
  options: {
    name: "[name].[ext]",
    outputPath: "./font/",
    publicPath: "./"
  }
});
config.module.loaders = loaders;
module.exports = config;
