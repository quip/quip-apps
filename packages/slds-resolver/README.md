# `slds-resolver`

This package is a simple resolver plugin for webpack that will help webpack find assets in the `node_modules/@salesforce-ux/design-system/assets` folder.

Without this module, many assets are pointed to using `url(/assets/...)`, which isn't compatible with workflows where webpack is expected to generate all the necessary assets for a bundle (like Live Apps). Using this resolver will just make these files available to webpack, where you can use `file-loader` or similar to actually package the assets.

