import {defaultConfigPath, readConfig} from "./config";

exports.isLoggedIn = async (quiprcPath: string = defaultConfigPath) => {
    const {accessToken} = await readConfig(quiprcPath);
    return !!accessToken;
};
