#!/bin/bash

mkdir -p dist
echo "#!/usr/bin/env node" > dist/qla
chmod +x dist/qla
node src/build.js
