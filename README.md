# Quip Live Apps

The Quip Live Apps platform enables developers to extend the Quip document canvas with interactive, custom components. The goal of the platform is to expand the scope and capabilities of Quip's living documents.

<ul>
    <li><a href="https://quip.com/dev/liveapps/">Getting Started</a> - Learn how to create a live app.</li>
    <li><a href="https://quip.com/dev/liveapps/documentation">API Reference</a> - Explore the nuts and bolts of the API.</li>
    <li><a href="https://quip.com/dev/liveapps/samples">Example Apps</a> - Browse open-source code.</li>
</ul>

## Quick Overview

You can interact with the Live Apps developer platform via our command line too, `quip-cli`. To get started, make sure you have a modern (e.g. v10+) version of node.js, then run:

```
npm install -g quip-cli
```

You will also want to log in to quip before interacting with the platform:

```
quip-cli login
```

Once you're logged in, you can create your first app using:

```
quip-cli init
```

This will launch an interactive prompt which will ask you some questions about your application, then it will do the following:

-   Create a new application in the [dev console](https://quip.com/dev/console)
-   Create an app directory in the current working directory based on the name provided.
-   Upload an initial bundle to Quip

After `init` completes, you should be able to at-mention the app in a document, and point it at your development environment:

[![CLI Demo](https://img.youtube.com/vi/IejJfRX-bKM/0.jpg)](https://www.youtube.com/watch?v=IejJfRX-bKM)

For more details on how to use the Live Apps, consult the official [Getting Started Guide](https://quip.com/dev/liveapps/) and [API Reference](https://quip.com/dev/liveapps/documentation).

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
