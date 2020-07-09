import fs from "fs";
import ncp from "ncp";

export const pathExists = (filePath: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, err => {
            if (err && err.code === "ENOENT") {
                return resolve(false);
            } else if (err) {
                return reject(err);
            }
            resolve(true);
        });
    });
};

export const copy = (
    source: string,
    dest: string,
    options: ncp.Options = {}
): Promise<void> => {
    return new Promise((resolve, reject) =>
        ncp(source, dest, options, err => {
            if (err) {
                return reject(err);
            }
            resolve();
        })
    );
};
