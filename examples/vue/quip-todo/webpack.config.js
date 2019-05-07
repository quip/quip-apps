module.exports = require("quip-apps-webpack-config");

module.exports.node = {
  global: false,
}

module.exports.module.loaders.forEach((loader) => {
  if (loader.test.toString() == '/\.less$/') {
    loader.use.unshift('vue-style-loader');
  }
});

module.exports.module.loaders.push({
  test: /\.vue$/,
  loader: 'vue-loader',
});
