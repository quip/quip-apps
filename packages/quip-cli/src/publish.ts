import {exec} from "child_process";

export const publish = () => {
    // TODO:
    // bundle app using manifest
    // push to quip's dev console
    exec("create-quip-app ./ --output=app.ele", (err, data) => {
        console.log(err);
        console.log(data.toString());
    });
};
