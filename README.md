# quip-apps
Quip Live Apps API for creating applications in Quip documents

<ul>
    <li><a href="https://quip.com/dev/liveapps">Documentation and tutorials</a></li>
    <li><a href="https://quip.com/dev/liveapps/documentation">API Reference</a>
    <li><a href="examples">Example Apps</a></li>
</ul>



The platform is currently in Beta.


## Quick Overview

```
npm install -g create-quip-app

create-quip-app my-app
```

`create-quip-app my-app` will create a directory called `my-app` inside the current folder.
Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
my-app
├── node_modules
├── package.json
├── webpack.config.js
├── .gitignore
├── app
│   └── manifest.json
└── src
    └── App.less
    └── App.jsx
    └── root.jsx
```

## Live Apps Getting Started Guide
https://quip.com/dev/liveapps/#getting-started

## Beta and publishing
  - While we're in Beta, you'll need to add someone as a Developer of your App
    in the Quip Dev Portal to enable them to insert your element in a new
    Document, but anyone can see your Live App in a shared Document.

### Thanks


