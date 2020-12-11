module.exports = {
    presets: [
        ["@babel/env", { shippedProposals: true }],
        "@babel/preset-react",
        "@babel/preset-typescript",
    ],
    plugins: ["@babel/plugin-transform-runtime"],
};
