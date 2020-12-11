module.exports = {
    presets: [
        ["@babel/env", { shippedProposals: true }],
        "@babel/preset-react",
    ],
    plugins: ["@babel/plugin-transform-runtime"],
};
