# quip-apps-webpack-config

The motivation for this package is that we want to share some default compilation rules for Quip Live Apps.

In particular, because we deploy our app on the Mac platform, and still support Yosemite, we need to make use of babel-polyfill so that Object.assign etc.. won't throw.

This config assumes a few things about your respository's source code structure as well as the output file names for the `app` directory.

## Customizing

It is possible to customize the config like this:

```
let Config = require("quip-apps-webpack-config");
Config.entry = [path.resolve(cwd, "./handleRichTextBoxKeyEventNavigation.js")];
Config.output = {
    path: path.resolve(cwd, "./dist"),
    filename: "handleRichTextBoxKeyEventNavigation.js",
    libraryTarget: "umd",
    publicPath: "dist"
};

module.exports = Config;
```
