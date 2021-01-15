process.env.TS_NODE_IGNORE = "test/**/*.ts";

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["test"],
    globalSetup: "./test/global-setup.js",
    globalTeardown: "./test/global-teardown.js",
    snapshotResolver: "./test/snapshot-resolver",
};
