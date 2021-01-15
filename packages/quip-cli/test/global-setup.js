const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports = async () => {
    process.chdir(__dirname);
    try {
        await exec("git diff --exit-code fixtures");
        const { stdout } = await exec("git clean -n fixtures");
        if (stdout) {
            throw new Error(`found unstaged files: ${stdout}`);
        }
    } catch (e) {
        process.stderr.write(
            "Cannot run with dirty fixtures.\ngit add your fixtures changes first, and make sure that your tests are properly calling cleanup.\n"
        );
        process.exit(1);
    }
};
