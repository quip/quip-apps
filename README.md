# quip-apps
Quip Live Apps API for creating applications in Quip documents

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
    └── App.js
    └── root.js
```


## Prerequisites
  - You must have a Quip account and be a member of a Quip site
  - Make sure you have <a href="https://nodejs.org/en/">Node and NPM</a> installed
  - Run <code>npm install -g create-quip-app</code> in your terminal
  - You need to flip a flag in your browser to allow self-signed certificates for HTTPS:
    - In Chrome, go to this URL: <a href="chrome://flags/#allow-insecure-localhost">chrome://flags/#allow-insecure-localhost</a>. Then click Enable and click the Relaunch button at the bottom of the page.
    - In Firefox, go to <a href="https://localhost:8888/">https://localhost:8888</a>, then click Advanced → Add Exception → Confirm Security Exception
    - In Safari, visit https://localhost:8888/ and click to accept the certificate

## Create your Live App

  - First you need to create your Live App. Go to [quip.com/api/apps](https://quip.com/api/apps) (the Quip developer portal) and click
    “Create New Live App”
  - Make note of your App ID, visible in the developer portal
  - Run `create-quip-app my-app` in your terminal
  - Run `cd my-app` in your terminal
  - Open the file `app/manifest.json` in your editor
    - Paste in your App ID
    - Give your app a name (hereafter $YOUR_APP_NAME). Note: The name here is important - typing the "@" key followed by the name is how users will insert your App into their documents)
  - Run `npm run build` in your terminal
  - Click the "Upload Bundle" button in the Quip Dev Portal
    - Select the `app/app.ele` file and click Update
  - Go to <a href="https://quip.com/">quip.com</a> and create a new document.
  - Type “@” in the document, and then type your App's name. You should see it in the insert menu and hitting ENTER will insert it into the document.

## Develop your Live App
  - Run <code>npm start</code> in your terminal in your <code>my-app</code> directory
    - This will use <a href="https://webpack.js.org/">webpack</a> to compile your <code>.js</code>/<code>.jsx</code> and <code>.less</code> files into a single <code>.js</code> file and <code>.css</code> file in <code>my-app/app/dist</code>
    - You need to run this command whenever you work on Your Live App, then leave it running continuously — it will automatically watch for code changes and update the compiled files as you edit.
    - If you have a syntax error in your code, it will show up here.
  - Click the Document button in the upper lefthand menu bar of the document and select “Advanced”. You should see an option there for “Debug $YOUR_APP_NAME”. Select that option.
  - Click your App's instance to focus it. You will see a Debug menu appear.
  - In the Debug menu, click “Use Local Resources”. That will save a setting so that your App will use the local server that you're running (<a href="https://localhost:8888/">https://localhost:8888</a>).
  - Now, reloading the App will pick up local changes that you make without requiring you to upload a new package to Quip. However, if you make any changes to the manifest.json file, you will need to re-upload your .ele file to get those updates.
  - Other Debug menu options:
    - <strong>Reload</strong>: Reloads that App's instance in the document without reloading the whole document. Allows you to pick up JS/CSS changes without refreshing the browser.
    - <strong>Log Bridge Operations</strong>: Turns on console logging of the bridge operations being sent between the App and the host document. Can be useful for debugging.
    - <strong>Outline App</strong>: Turns on a gray dotted outline around your App (redundant with the red dotted outline you get from Use Local Resources). Only useful if local resources mode is not turned on.
    - <strong>Clear User Preferences</strong>: Allows you to clear any preferences that are stored for your App on the viewing user (only useful if your App uses preferences).
    - <strong>Recreate App</strong>: Deletes this instance of the App and creates a new one in its place. Useful shortcut for going through the App's initialization process again.

## Beta and publishing
  - While we're in Beta, you'll need to add someone as a Developer of your App
    in the Quip Dev Portal to enable them to insert your element in a new
    Document, but anyone can see your Live App in a shared Document.


### Thanks


