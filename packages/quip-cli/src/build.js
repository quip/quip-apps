const path = require("path");
const fs = require("fs");

require("@zeit/ncc")(path.resolve(__dirname, "cli.ts"), {
    // directory outside of which never to emit assets
    // this is necessary to use ncc with template directory references
    filterAssetBase: __dirname,
    minify: true,
}).then(({code, map, assets}) => {
    fs.writeFileSync(path.resolve(__dirname, "..", "dist/qla"), code, {
        flag: "a+",
    });
});
