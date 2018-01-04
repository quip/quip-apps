// Copyright 2017 Quip

const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const Autoprefixer = require('autoprefixer');
const cwd = process.cwd();

module.exports = {
    devtool: "source-map",
    entry: ["babel-polyfill", path.resolve(cwd, "./src/root.jsx")],
    output: {
        path: path.resolve(cwd, "./app/dist"),
        filename: "app.js",
        publicPath: "dist"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: [
                        require.resolve("babel-preset-env"),
                        require.resolve("babel-preset-react-app")
                    ]
                },
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [
                        {
                            loader: "css-loader",
                            options: {
                                modules: true,
                                importLoaders: 1,
                                localIdentName: "[name]__[local]"
                            },
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                plugins: loader => [
                                    Autoprefixer(),
                                ]
                            }
                        },
                        "less-loader"
                    ],
                }),
            },
            {
                test: /\.svg/,
                use: [
                    {
                        loader: "svg-react-loader",
                        options: {
                            jsx: true
                        },
                    }
                ],
            },
            {
                test: /\.png$/,
                use: "url-loader"
            }
        ],
    },
    resolve: {
        modules: [
            path.resolve(cwd, "src"),
            path.resolve(cwd, "node_modules"),
            path.resolve(__dirname, "node_modules")
        ]
    },
    resolveLoader: {
        modules: [
            path.resolve(cwd, "node_modules"),
            path.resolve(__dirname, "node_modules")
        ]
    },
    plugins: [
        new ExtractTextPlugin("app.css"),
        new WriteFilePlugin()
    ],
    externals: {
        react: "React",
        "react-dom": "ReactDOM",
        quip: "quip",
        _: "_",
        quiptext: "quiptext"
    },
    devServer: {
        contentBase: path.resolve(cwd, "app/dist"),
        // host: "docker.qa",
        port: 8888,
        inline: false
    }
};
