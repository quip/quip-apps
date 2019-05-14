# Getting Started with Quip Live Apps in Vue

This is a guide for creating [Quip Live Apps](https://salesforce.quip.com/about/live-apps) using [Vue](https://vuejs.org/).  The Quip documentation recommends using [React](https://reactjs.org/) and provides additional support for it -- for example, the React Javascript libraries are automatically imported into your application and some Quip-specific UI components are provided.

A few files are change to provide support for Vue.  Example files can be found in the [files](files) directory.

Instead of making the changes listed here, you can use my [Quip Hello](https://github.com/herrevilkitten/quip-hello-vue) repository as a starter.  It already has all of the necessary changes.  I still recommend that you read through this document in order to learn about the caveats and what that various changes do.

## Caveats

Becaue Quip Live Apps were not designed with Vue in mind, there is no official support.  This document will guide you through the process of modifying the necessary files and example files are located in the `files` directory.

Some other things to keep in mind:

* When creating a React application, the React libraries are not added to your `app.ele` bundle because Quip will automatically provide them.  Vue libraries are not provided, so they will be added to the bundle.  This can increase the size of the application by 200KB.

* Only Vue [Single File Components (SFC)](https://vuejs.org/v2/guide/single-file-components.html) are supported.  The Vue templating system uses methods which break [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) and will not run as a Live App.  SFCs are compiled at build time and will not break CSP.

* `webpack.config.js` has been customized.  It uses the default Quip configuration and then modifies it to support Vue.  If Quip makes changes to the default configuration, the custom configuration may need to be updated.

* With everything in Single File Components, `app.css` is not used (and is not in the manifest.)  If an external stylesheet is needed, the manifest may need to be updated.

* There are two known CSP issues with the default configuration.  They have been alleviated with some configuration and build changes.  The changes (in `webpack.config.js` and `package.json`) are documented in their sections of this document.

## Create a new Quip project

Because this guide modifies the default configuration, you should start by installing and running `create-quip-app`

```
npm install -g create-quip-app
create-quip-app <directory>
cd <directory>
```

This will create a starter project and install a number of dependencies.

## Add Vue dependencies to the project

The Vue live apps have four additional dependencies.

* [vue](https://www.npmjs.com/package/vue)
  * Provides the Vue framework.  Included in the `app.ele` bundle.
* [vue-loader](https://www.npmjs.com/package/vue-loader)
  * Allows webpack to handle `*.vue` files
* [vue-style-loader](https://www.npmjs.com/package/vue-style-loader)
  * Allows webpack to handle stylesheets contained in `*.vue` files
* [vue-template-compiler](https://www.npmjs.com/package/vue-template-compiler)
  * Compiles the templates into javascript.


They can all be installed with
```
npm install -D vue vue-loader vue-style-loader vue-template-compiler
```

Be careful with working with `package.json`.  A lot of Quip dependencies are only listed in `package-lock.json` and it is possible to accidentally corrupt the lock file.  If you do, simply copy the lock file from another project and run `npm install` again.

## Modify the Webpack configuration

There are two things that must be changed in the webpack configuration.  The first change will fix a potential CSP issue in code that webpack generates.  The generated code looks like this
```
// This works in non-strict mode
g = function () {
        return this;
}();

try {
        // This works if eval is allowed (see CSP)
        g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
        // This works if the window reference is available
        if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
}
```

This code is used to always find the "global" scope, no matter the environment the javascript is running in.  Unfortunately, in the Quip live app environment, `Function("return this")() || (1, eval)("this")` will cause a CSP error.  More information can be found in the [webpack repo](https://github.com/webpack/webpack/issues/6461).

To get around this issue, the add the following to `webpack.config.js` to disable the code generation.

```
module.exports.node = {
  global: false,
}
```

In addition to this, the configuration needs to be changed to process `*.vue` files.  It's a bit hacky, but 

```
module.exports.module.loaders.forEach((loader) => {
  if (loader.test.toString() == '/\.less$/') {
    loader.use.unshift('vue-style-loader');
  }
});

module.exports.module.loaders.push({
  test: /\.vue$/,
  loader: 'vue-loader',
});
```
will take care of this.  The first block looks for the [less](http://lesscss.org/) processor that is in the default configuration.  It then adds `vue-style-loader` as the first handler for it.

The second entry adds support for `*.vue` files in general.  Both of these entries together will let SFCs work properly.

Support for other CSS processors can be added by following the instructions given in the [`vue-loader` documentation](https://vue-loader.vuejs.org/guide/pre-processors.html).

## Modify the build script

A second CSP may happen because of code that [regenerator-runtime](https://github.com/facebook/regenerator) is generating.  Information about this problem can be found in the [github repo](https://github.com/facebook/regenerator/issues/336).  The generated code looks like this:

```
// In sloppy mode, unbound `this` refers to the global object, fallback to
// Function constructor if we're in global strict mode. That is sadly a form
// of indirect eval which violates Content Security Policy.
function () {
  return this;
}() || Function("return this")());
```
Like previously stated, the `Function("return this")()` may trigger CSP issues.  In order to get around this, a small change is made to `package.json` that will remove this code from `app/dist/app.js` before it is packed by `create-quip-app`.

Change the `"build"` script to be:

```
"build": "NODE_ENV=production webpack; sed -i '' 's/Function(\"return this\")()/window/g' app/dist/app.js; create-quip-app pack ./app"
```

If your system does not have `sed` but it does have `perl`, you can use the following instead.

```
"build": "NODE_ENV=production webpack; perl -pi -e 's/Function\\(\"return this\"\\)\\(\\)/window/g' app/dist/app.js; create-quip-app pack ./app"
```

In both cases, all occurences of `Function("return this")()` will be replaced by `window`.

## Modify root.jsx

In `initializationCallback`, in `root.jsx`, we first create a div and then use that as the container instead of the `rootNode`. This is because Vue replaces the element it is attached to, instead of being placed inside of it.  In the case of a live app, this removes the original `rootNode`, which is an element that Quip uses to detect the live app.

The entire file looks like this:
```
import quip from "quip";

import Vue from 'vue/dist/vue';

import App from './App.vue';
Vue.component('App', App);

quip.apps.initialize({
    initializationCallback: function (rootNode, params) {
        const container = document.createElement('div');
        rootNode.appendChild(container);
        new Vue({
            el: container,
            render: function (h) {
                return h(App, { props: params });
            }
        });
    },
});
```

The [initialization parameters](https://salesforce.quip.com/dev/liveapps/documentation#initialization) that Quip passes to the live app will be passed along to the `App` component as a prop.

## Have fun!

With all of these changes, you should be able to create Quip live apps easily.
