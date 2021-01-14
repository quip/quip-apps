const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports = async () => {
    process.chdir(__dirname);
    await exec("git checkout __snapshots_unix__ __snapshots_windows__");
    await exec("git clean -fd fixtures");
};
