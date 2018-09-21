# Using Salesforce Lightning Design System (SLDS) in Quip Live Apps

This is a standalone Live App that makes use of the Salesforce React implementation of SLDS: https://github.com/salesforce/design-system-react

Steps to get a Quip Live App working with SLDS:

-   `npm install @salesforce-ux/design-system @salesforce/design-system-react`
-   Copy the changes in `webpack.config.js` to load/bundle custom fonts.
-   `import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css"`
-   `import "./dsr-quip-mods.css"` to fix some CSS mods that Quip makes that mess with `salesforce-lightning-design-system.min.css`.
-   Follow the CommonJS module pattern, ala `import { Button } from '@salesforce/design-system-react'`
-   For icons to work you'll want to make use of the `IconSettings` class' `onRequestIconPath` prop and inline the SVG sprite sheet(s) (we already have webpack's `react-svg-loader` enabled). Note: we have this workaround because Live Apps make use of a CDN to host assets and due to cross-domain restrictions you can't load SVGs (aka XML) from that domain. Example usage:
    ```
    import UtilitySprite from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";
    ...
    render() {
        <IconSettings onRequestIconPath={({category, name}) => `#${name}`}}>
            <UtilitySprite>
            ...
    ```
