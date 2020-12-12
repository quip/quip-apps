# SLDS React ❤️ Live Apps

This is an example app showing how to use slds-react in a Live App.

## Using SLDS in your own app:

1. First, initialize your app:

`quip-cli init`

3. Then, in the app directory, install slds and slds-react, slds-resolver, and css loaders for webpack

`npm install --save-dev @salesforce-ux/design-system @salesforce/design-system-react mini-css-extract-plugin slds-resolver svg-react-loader css-loader file-loader`

4. Modify your `webpack.config.js` to handle the new files & types that are required by SLDS:

-   import Mini CSS Extract Plugin and SLDS Resolver:

```
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const SLDSResolver = require("./slds-resolver");
```

-   Add the MiniCSSExtract plugin:

```
...
plugins: [new MiniCssExtractPlugin()],
...
```

-   Add the SLDS Resolver to your resolver field, which now should look something like this:

```
...
resolve: {
    modules: [
        path.resolve(__dirname, "src"),
        path.resolve(__dirname, "node_modules"),
    ],
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    plugins: [new SLDSResolver()],
},
...
```

-   Add the loaders, making your module config look something like this:

```
...
module: {
    rules: [
        {
            test: /\.[jt]sx?$/,
            include: [
                /src/,
                // Allow compilation of components from DSR
                /node_modules\/@salesforce\/design-system-react\/components/,
            ],
            use: "babel-loader",
        },
        // Handle css files since we'll import the main styles
        {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        // Handle svgs which are referenced in the stylesheets and code
        {
            test: /\.svg/,
            include: [
                /src/,
                /node_modules\/@salesforce-ux\/design-system\/assets/,
            ],
            use: [
                {
                    loader: "svg-react-loader",
                    options: {
                        jsx: true,
                    },
                },
            ],
        },
        // Handle
        {
            test: /\.(woff|woff2|png)$/,
            loader: "file-loader",
        },
    ],
},
...
```

5. Delete or move `assets/styles.css`, since you'll want to handle css via webpack now

6. Update your `manifest.json` to include the new files, which should now be something like:

```json
...
"js_files": ["dist/app.js"],
"css_files": ["dist/main.css"],
"other_resources": ["dist/*.png", "dist/*.woff", "dist/*.woff2"],
...
```

You should now be to import SLDS React components directly, and they'll show up as expected.

## Typescript

SLDS isn't typescript compatible, so you'll need to provide your own declarations:

1. Add a `custom.d.ts` file to the root of your app.

2. Then add this file to `tsconfig.json`'s `include`:

`"include": ["./src/**/*", "./custom.d.ts"]`

3. Add declarations for untyped imports:

```typescript
declare module "*.svg" {
    const content: any;
    export default content;
}
```

4. When you import a module, add it to your `custom.d.ts` file, e.g.

```typescript
declare module "@salesforce/design-system-react/components/icon-settings";
declare module "@salesforce/design-system-react/components/icon";
```
