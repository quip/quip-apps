// Copyright 2019 Quip

module.exports = {
    "setupFiles": ["./test/jestsetup.js"],
    "snapshotSerializers": ["enzyme-to-json/serializer"],
    "moduleNameMapper": {
        "\\.(css|less)$": "identity-obj-proxy",
        "\\.svg$": "<rootDir>/test/svg-stub.js",
    },
    "testPathIgnorePatterns": ["/node_modules/", "/dist/"],
};
