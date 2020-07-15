import {readConfig} from "./config";

exports.isLoggedIn = async (quiprcPath: string) => {
    const {accessToken} = await readConfig(quiprcPath);
    return !!accessToken;
};
