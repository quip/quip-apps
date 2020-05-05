const path = require("path");
const {execFile} = require("child_process");

const CLI = "dist/qla";
const ROOT = path.resolve(__dirname, "..");

module.exports.run = (...args) => {
    return new Promise(resolve => {
        execFile(CLI, args, {cwd: ROOT}, (err, stdout, stderr) => {
            resolve([err, stdout, stderr]);
        });
    });
};
