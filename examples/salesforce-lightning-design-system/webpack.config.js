const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const SLDSResolver = require("slds-resolver");
const devMode = process.env.NODE_ENV === "development";

module.exports = {
    mode: devMode ? "development" : "production",
    entry: [path.resolve(__dirname, "./src/root.tsx")],
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "app.js",
        publicPath: "/dist/",
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "src"),
            path.resolve(__dirname, "node_modules"),
        ],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        plugins: [new SLDSResolver()],
    },
    resolveLoader: {
        modules: [path.resolve(__dirname, "node_modules")],
    },
    plugins: [new MiniCssExtractPlugin()],
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                include: [
                    /src/,
                    /node_modules\/@salesforce\/design-system-react\/components/,
                ],
                use: "babel-loader",
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
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
                test: /\.(woff|woff2|png)$/,
                loader: "file-loader",
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
