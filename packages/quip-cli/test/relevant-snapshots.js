const { findIrrelevantSnapshots } = require("./snapshot-resolver");
const { renameSync } = require("fs");
const { exit } = require("process");

const resetSnapshots = () => {
    findIrrelevantSnapshots(__dirname, "_snapshot_backup").forEach(
        (snapshot) => {
            renameSync(
                snapshot,
                snapshot.slice(0, -"_snapshot_backup".length) + "snap"
            );
        }
    );
};

const renameSnapshots = () => {
    findIrrelevantSnapshots(__dirname, "snap").forEach((snapshot) => {
        renameSync(snapshot, snapshot.slice(0, -4) + "_snapshot_backup");
    });
};

const args = process.argv.slice(2);

if (args[0] === "reset") {
    resetSnapshots();
} else if (args[0] === "rename") {
    renameSnapshots();
} else {
    console.log("'reset' or 'rename' required");
    exit(1);
}
