## Version Notes

### 0.0.15
Updates `quip-apps-webpack-config` to v0.0.14, which requires removing `-p` from the `package.json scripts.build` config. Otherwise, `npm run build` results in `ERROR in app.js from UglifyJs` `TypeError: Cannot read property 'sections' of null`.

