// Copyright 2020 Quip

require("core-js/stable");
require("regenerator-runtime/runtime");

const Enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");
Enzyme.configure({adapter: new Adapter()});

// Shared components in apps/shared still expect global quip/quiptext in test
global.quip = require("quip-apps-api");
global.quiptext = require("quiptext");
