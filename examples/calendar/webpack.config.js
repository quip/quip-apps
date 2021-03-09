// Copyright 2017 Quip

const path = require("path");
const config = require("quip-apps-webpack-config");
const TerserPlugin = require("terser-webpack-plugin");

const rootEntryPattern = /\/root.jsx$/;
config.entry = {
    app: [
        ...config.entry.map(e =>
            // find and swap out our root.jsx with root.tsx
            rootEntryPattern.test(e)
                ? path.resolve(process.cwd(), "./src/root.tsx")
                : e
        ),
    ],
};

config.module.rules.unshift({
    test: /\.(eot|woff|woff2|ttf)$/,
    loader: "file-loader?name=assets/fonts/webfonts/[name].[ext]",
});
config.module.rules.push({
    test: /\.tsx?$/,
    use: "awesome-typescript-loader",
    exclude: /node_modules/,
});
config.resolve.extensions = [".js", ".jsx", ".ts", ".tsx"];

// Replace uglify with terser, as uglify does not handle es6 stuff (e.g. async)
// well. This should be fixed in quip-apps-webpack-config instead of here.
if (process.env.NODE_ENV === "production") {
    config.optimization.minimizer = config.optimization.minimizer.map(
        plugin => {
            if (plugin.constructor.name === "UglifyJsPlugin") {
                plugin = new TerserPlugin({
                    terserOptions: {
                        mangle: false,
                    },
                });
            }
            return plugin;
        });
}

config.output.path = path.resolve(__dirname, "dist");
config.devServer.contentBase = path.resolve(__dirname);

module.exports = config;
