const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports = async () => {
    process.chdir(__dirname);
    await exec("git clean -fd fixtures");
    await exec("git checkout fixtures");
};
