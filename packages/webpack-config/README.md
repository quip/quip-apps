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

## Version Notes

### 0.0.15

Modifies Uglify configuration and webpack globals. Note that upgrading from 0.0.13 to 0.0.15 introduces a breaking change when compiling apps created with pre-0.0.15 `create-quip-app`. The fix is to manually delete `-p` from the `package.json scripts.build` command. Otherwise, `npm run build` results in `ERROR in app.js from UglifyJs` `TypeError: Cannot read property 'sections' of null`.
