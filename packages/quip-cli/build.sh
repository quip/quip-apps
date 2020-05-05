#!/bin/bash

TMPOUT=$(mktemp -u)

mkdir -p dist
echo "#!/usr/bin/env node" > dist/qla
echo "const inquirer = require('inquirer')" >> dist/qla
echo "const arg = require('arg')" >> dist/qla
chmod +x dist/qla
ncc build -e "inquirer" -e "arg" -o "$TMPOUT" --minify src/index.ts
cat "$TMPOUT/index.js" >> dist/qla
rm -rf $TMPOUT