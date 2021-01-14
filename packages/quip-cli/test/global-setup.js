const util = require("util");
const exec = util.promisify(require("child_process").exec);
const rimraf = require("rimraf");

module.exports = async () => {
    findOtherSnapshotDirs(__dirname).forEach((dir) => {
        rimraf(path.join(__dirname, dir));
    });
    process.chdir(__dirname);
    try {
        await exec("git diff --exit-code fixtures");
        const { stdout } = await exec("git clean -n fixtures");
        if (stdout) {
            throw new Error(`found unstaged files: ${stdout}`);
        }
        await exec(
            "git diff --exit-code __snapshots_unix__ __snapshots_windows__"
        );
        const { stdout } = await exec(
            "git clean -n __snapshots_unix__ __snapshots_windows__"
        );
    } catch (e) {
        process.stderr.write(
            "Cannot run with dirty fixtures.\ngit add your fixtures changes first, and make sure that your tests are properly calling cleanup.\n"
        );
        process.exit(1);
    }
};
