// Copyright 2018 Quip

const fs = require("fs");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const Autoprefixer = require("autoprefixer");
const cwd = process.cwd();
const devMode = process.env.NODE_ENV === "development";

function babelrcOptions() {
    const babelrcPath = path.resolve(process.cwd(), ".babelrc");
    const babelConfigPath = path.resolve(process.cwd(), "babel.config.js");
    if (fs.existsSync(babelrcPath)) {
        return JSON.parse(fs.readFileSync(babelrcPath));
    } else if (fs.existsSync(babelConfigPath)) {
        return require(babelConfigPath);
    }
    return {presets: ["@babel/preset-env", "@babel/preset-react"]};
}

function minimizers() {
    let minimizers = [];
    if (!devMode) {
        minimizers = [
            new TerserPlugin({
                terserOptions: {
                    mangle: false,
                },
            }),
            new OptimizeCSSAssetsPlugin({}),
        ];
    }
    return minimizers;
}

module.exports = {
    devtool: "source-map",
    mode: devMode ? "development" : "production",
    entry: ["regenerator-runtime/runtime", path.resolve(cwd, "./src/root.jsx")],
    output: {
        path: path.resolve(cwd, "./app/dist"),
        filename: "app.js",
        publicPath: "/dist/",
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: babelrcOptions(),
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            modules: {
                                localIdentName: "[name]__[local]",
                            },
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: loader => [Autoprefixer()],
                        },
                    },
                    "less-loader",
                ],
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: loader => [Autoprefixer()],
                        },
                    },
                ],
            },
            {
                test: /\.svg/,
                use: [
                    {
                        loader: "svg-react-loader",
                        options: {
                            jsx: true,
                        },
                    },
                ],
            },
            {
                test: /\.png$/,
                use: "url-loader",
            },
        ],
    },
    resolve: {
        modules: [
            path.resolve(cwd, "src"),
            path.resolve(cwd, "node_modules"),
            path.resolve(__dirname, "node_modules"),
        ],
    },
    resolveLoader: {
        modules: [
            path.resolve(cwd, "node_modules"),
            path.resolve(__dirname, "node_modules"),
        ],
    },
    optimization: {
        minimizer: minimizers(),
    },
    performance: {
        hints: false,
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "app.css",
        }),
        new WriteFilePlugin(),
    ],
    externals: {
        react: "React",
        "react-dom": "ReactDOM",
        quip: "quip",
        quiptext: "quiptext",
    },
    devServer: {
        contentBase: path.resolve(cwd, "app/dist"),
        // host: "docker.qa",
        port: 8888,
        inline: false,
    },
};
