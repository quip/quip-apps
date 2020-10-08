# Deprecation Notice

`create-quip-app` is deprecated, use `quip-cli init` instead. See [documentation](https://github.com/quip/quip-apps/tree/master/packages/quip-cli#qla-init) for more details on `quip-cli`.

## Version Notes

### 0.0.15

Updates `quip-apps-webpack-config` to v0.0.14, which requires removing `-p` from the `package.json scripts.build` config. Otherwise, `npm run build` results in `ERROR in app.js from UglifyJs` `TypeError: Cannot read property 'sections' of null`.
