const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");

let config = require("quip-apps-webpack-config");
delete config.externals.react;
delete config.externals["react-dom"];

function plugins() {
  let plugins = [new ExtractTextPlugin("app.css"), new WriteFilePlugin()];
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      mangle: { except: ["quiptext"] }
    })
  );
  return plugins;
}

config.plugins = plugins();

module.exports = config;
