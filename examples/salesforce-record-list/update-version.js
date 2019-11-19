#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const pkg = require("./package.json");
const mnfst = require("./app/manifest.json");

mnfst.version_number++;
mnfst.version_name = pkg.version;

fs.writeFileSync(
    path.join(__dirname, "app/manifest.json"),
    JSON.stringify(mnfst, null, 4));
