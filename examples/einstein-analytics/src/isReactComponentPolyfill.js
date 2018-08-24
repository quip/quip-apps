// Required due to SLDS.Modal's dependency on polyfill from react-lifecycles-compat
// which does a check qusing this property defined on React components.
import React from "react";
React.Component.prototype.isReactComponent = {};
