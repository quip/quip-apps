process.env.TS_NODE_IGNORE = "test/**/*.ts";

const isWin = process.platform === "win32";

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["test"],
    globalSetup: "./test/global-setup.js",
    snapshotResolver: isWin ? "./test/snapshot-resolver-windows" : undefined,
};
