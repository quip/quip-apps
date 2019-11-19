// Copyright 2019 Quip
import React from "react";

// Required due to SLDS.Modal's dependency on polyfill from react-lifecycles-compat
// which does a check using this property defined on React components.
React.Component.prototype.isReactComponent = {};
