# Quip Apps
The Quip Apps platform enables developers to extend the Quip document canvas with interactive, custom components. The goal of the platform is to expand the scope and capabilities of Quip's living documents.

<ul>
    <li><a href="https://quip.com/dev/liveapps/">Getting Started</a> - Learn how to create an app.</li>
    <li><a href="https://quip.com/dev/liveapps/documentation">API Reference</a> - Explore the nuts and bolts of the API.</li>
    <li><a href="https://quip.com/dev/liveapps/examples">Example Apps</a> - Browse open-source code.</li>
</ul>

The platform is currently in beta.

## Quick Overview

```
npm install -g create-quip-app

create-quip-app my-app
```

`create-quip-app my-app` will create a directory called `my-app` inside the current folder.
Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
my-app
├── package.json
├── node_modules
├── webpack.config.js
├── app
│   └── manifest.json
└── src
    └── App.less
    └── App.jsx
    └── root.jsx
```

## Getting Started

Follow the <a href="https://quip.com/dev/liveapps/">Getting Started Guide</a> to start creating your own live app.

## Publishing
During the beta period, only developers of your app will be able to insert the app. To add a developer, go to the Quip Dev Portal. To insert the live app in a Quip document, type @ followed by the app name.

Others can view and interact with the app, but they won't be able to create new instances of it yet.
