// Our snapshots are OS-dependent, and will be different on windows than mac.
// This resolver simply adds _windows_ to the snapshots folder name.
// We point to this config when we're in a windows environment via jest.config.js.

const path = require("path");

module.exports = {
    // resolves from test to snapshot path
    resolveSnapshotPath: (testPath, snapshotExtension) => {
        return path.join(
            path.dirname(testPath),
            path.sep,
            "__snapshots_windows__",
            path.basename(testPath) + snapshotExtension
        );
    },

    // resolves from snapshot to test path
    resolveTestPath: (snapshotFilePath, snapshotExtension) => {
        return snapshotFilePath
            .replace(`${path.sep}__snapshots_windows__`, "")
            .slice(0, -snapshotExtension.length);
    },

    // Example test path, used for preflight consistency check of the implementation above
    testPathForConsistencyCheck: `some${path.sep}example.test.js`,
};
