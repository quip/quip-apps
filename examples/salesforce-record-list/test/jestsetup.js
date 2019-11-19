// Copyright 2019 Quip

// TODO(jd): this is necessary because we use them in the entry of the webpack
// config. We should provide this functionality in a shared way similar to
// quip-apps's webpack-config, or include this file in our boilerplate.
require("core-js/stable");
require("regenerator-runtime/runtime");

const Enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-15.4");
Enzyme.configure({adapter: new Adapter()}); // Make Enzyme functions available in all test files without importing

// Shared components in apps/shared still expect global quip/quiptext in test
global.quip = require("quip-apps-api");
global.quiptext = require("quiptext");
