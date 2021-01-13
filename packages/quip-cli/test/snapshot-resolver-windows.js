// Our snapshots are OS-dependent, and will be different on windows than mac.
// This resolver simply adds _windows to the snapshots folder name.
// We point to this config when we're in a windows environment via jest.config.js.

module.exports = {
    // resolves from test to snapshot path
    resolveSnapshotPath: (testPath, snapshotExtension) =>
        testPath.replace("__tests__", "__snapshots_windows__") +
        snapshotExtension,

    // resolves from snapshot to test path
    resolveTestPath: (snapshotFilePath, snapshotExtension) =>
        snapshotFilePath
            .replace("__snapshots_windows__", "__tests__")
            .slice(0, -snapshotExtension.length),

    // Example test path, used for preflight consistency check of the implementation above
    testPathForConsistencyCheck: "some/__snapshots_windows__/example.test.js",
};
