const path = require("path");
const devMode = process.env.NODE_ENV === "development";

module.exports = {
    mode: devMode ? "development" : "production",
    entry: [path.resolve(__dirname, "src", "root.tsx")],
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "app.js",
        publicPath: "/dist/",
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "src"),
            path.resolve(__dirname, "node_modules"),
        ],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
    },
    resolveLoader: {
        modules: [path.resolve(__dirname, "node_modules")],
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                include: [path.resolve(__dirname, "src")],
                use: "babel-loader",
            },
        ],
    },
    devServer: {
        contentBase: path.resolve(__dirname),
        port: 8888,
        inline: false,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    },
};
