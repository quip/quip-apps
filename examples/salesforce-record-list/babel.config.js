// Copyright 2019 Quip

/**
 * @fileoverview using just .babelrc will only cause this directory to be
 * transformed, whereas using babel.config.js allows us to specify roots outside
 * of this directory, allowing code in shared to be transformed. In the future,
 * these modules should be linked and have their own babel configs.
 */

const babelConfig = {};
// Workaround for https://github.com/babel/babel/issues/7022 - when importing
// classes from outside this codebase, they can no longer be extended by
// transpiled code. We set this to node so that it will not transpile classes at
// all, which resolves the issue.
// Can be removed if/when this PR is merged:
// https://github.com/babel/babel/pull/8656
if (process.env.NODE_ENV === "test") {
    babelConfig.targets = {
        "node": "current",
    };
}

module.exports = {
    "presets": [
        ["@babel/env", babelConfig],
        "@babel/react",
        "@babel/preset-typescript",
    ],
    "plugins": ["@babel/plugin-proposal-class-properties"],
    "retainLines": true,
};
