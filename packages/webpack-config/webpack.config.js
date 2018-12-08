// Copyright 2018 Quip

const webpack = require('webpack');
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const Autoprefixer = require('autoprefixer');
const cwd = process.cwd();

const devMode = process.env.NODE_ENV !== 'production';

function minimizers() {
    let minimizers = [];
    if (!devMode) {
        minimizers = [
            new UglifyJsPlugin({
                uglifyOptions: {
                    mangle: {
                        properties: {
                            reserved: ["quip-text"]
                        }
                    }
                }
            }),
            new OptimizeCSSAssetsPlugin({})
        ];
    }
    return minimizers;
}

module.exports = {
    devtool: "source-map",
    mode: devMode ? "development" : "production",
    entry: ["@babel/polyfill", "quip-apps-compat", path.resolve(cwd, "./src/root.jsx")],
    output: {
        path: path.resolve(cwd, "./app/dist"),
        filename: "app.js",
        publicPath: "dist"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: [
                        require.resolve("@babel/preset-env"),
                        require.resolve("@babel/preset-react")
                    ],
                    plugins: [
                        require.resolve("@babel/plugin-proposal-class-properties")
                    ]
                },
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
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
                ]
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
                            plugins: loader => [
                                Autoprefixer(),
                            ]
                        }
                    },
                ]
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
    optimization: {
        minimizer: minimizers()
    },
    performance: {
        hints: false
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "app.css"
        }),
        new WriteFilePlugin()
    ],
    externals: {
        react: "React",
        "react-dom": "ReactDOM",
        quip: "quip",
        quiptext: "quiptext"
    },
    devServer: {
        contentBase: path.resolve(cwd, "app/dist"),
        // host: "docker.qa",
        port: 8888,
        inline: false
    }
};

