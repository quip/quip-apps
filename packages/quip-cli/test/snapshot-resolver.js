// Our snapshots are OS-dependent, and will be different on windows than mac.
// This resolver simply adds _windows_ to the snapshots folder name.
// We point to this config when we're in a windows environment via jest.config.js.

const path = require("path");
const { readdirSync } = require("fs");

const snapshotDir = `__snapshots_${
    process.platform === "win32" ? "windows" : "unix"
}__`;

// In general this is unfortunate, but jest really resists having any .snap files in the working tree and will fail tests if it finds unused ones.
// Until we can think of a better way to get environment dependent snapshots or avoid the need to have them, this will work.
const findIrrelevantSnapshots = (source, ext) =>
    readdirSync(source, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .reduce((snapshots, dirent) => {
            const dirPath = path.join(source, dirent.name);
            if (
                /^__snapshots_/.test(dirent.name) &&
                dirent.name !== snapshotDir
            ) {
                snapshots = snapshots.concat(
                    readdirSync(dirPath)
                        .filter((f) => new RegExp(`\.${ext}$`).test(f))
                        .map((f) => path.join(dirPath, f))
                );
            }
            return snapshots.concat(findIrrelevantSnapshots(dirPath, ext));
        }, []);

module.exports = {
    // resolves from test to snapshot path
    resolveSnapshotPath: (testPath, snapshotExtension) => {
        return path.join(
            path.dirname(testPath),
            snapshotDir,
            path.basename(testPath) + snapshotExtension
        );
    },

    // resolves from snapshot to test path
    resolveTestPath: (snapshotFilePath, snapshotExtension) => {
        return snapshotFilePath
            .replace(`${path.sep}${snapshotDir}`, "")
            .slice(0, -snapshotExtension.length);
    },

    // Example test path, used for preflight consistency check of the implementation above
    testPathForConsistencyCheck: `some${path.sep}example.test.js`,

    snapshotDir,

    findIrrelevantSnapshots,
};
