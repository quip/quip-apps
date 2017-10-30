# quip-apps
Quip Live Apps API for creating applications in Quip documents

The platform is currently in Beta.

## Quick Overview

You'll need to have node >= 6 on your machine.

```
npm install -g create-quip-app

create-quip-app my-app
cd my-app/
npm start
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
    └── App.js
    └── root.js
```


## Getting Started

  - Open the [Quip Dev Portal](https://quip.com/api/apps) and click
    "Create New Live App" at the top of that page
  - Run `create-quip-app my-app`
  - cd `my-app`
  - Edit `app/manifest.json`
    - Give your app a name (hereafter $YOUR_APP_NAME)
    - Paste in your new App ID from the Quip Dev Portal
  - Run `npm build`
  - Click the "Upload Bundle" button on the Quip Dev Portal
    - Select your app/app.ele file and click Update
  - Make a new Quip document and insert your Live App
    - by typing the "@" key followed by $YOUR_APP_NAME
  - Run `npm start` and enable localhost certificates in Chrome
    - In Chrome, visit [chrome://flags](chrome://flags) and make sure you've enabled
      "Allow invalid certificates for resources loaded from localhost."
  - Click Document -> Advanced -> Debug $YOUR_APP_NAME
  - Click on your Live App and then click the Debug button and choose
    Use Local Resources from the drop-down. Refresh the page.
  - Iterate on your code, and click Live App Debug -> Refresh to see
    your code update in Quip
  - When you're done, re-run `npm build`, upload app/app.ele, disable
    Use Local Resources for yourself.
  - Share the Document with others so they can see your Live App in action
  - While we're in Beta, you'll need to add someone as a Developer of your App
    in the Quip Dev Portal to enable them to insert your element in a new
    Document, but anyone can see your Live App in a shared Document.


### Thanks


