# Using Salesforce Lightning Design System (SLDS) in Quip Live Apps

This is a standalone Live App that makes use of the Salesforce React implementation of SLDS: https://github.com/salesforce/design-system-react

Steps to get an app working with SLDS:
 - `npm install @salesforce-ux/design-system @salesforce/design-system-react`
 - Copy the changes in `webpack.config.js`
 - Copy the `.babelrc`
 - `import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";`
 - Follow the CommonJS module pattern, ala `import { Button } from '@salesforce/design-system-react';`
