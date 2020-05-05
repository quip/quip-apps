#!/bin/bash

TMPOUT=$(mktemp -u)

mkdir -p dist
echo "#!/usr/bin/env node" > dist/qla
chmod +x dist/index.js
ncc build -o "$TMPOUT" --minify src/index.ts
cat "$TMPOUT/index.js" >> dist/qla
rm -rf $TMPOUT