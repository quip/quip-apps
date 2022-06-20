# Tableau Live App

Disclaimer: the source code of this live app is provided as is, and is not yet an official product or feature. Support is not provided.

## What is it?

This live app allows users to embed Tableau dashboards in Quip documents, making it easy to collaborate with colleagues and drive decisions based on live data.

## Installation

### Requirements

-   [x] You must be an administrator of your Quip site
-   [x] Your Quip site must be signed up to Quip Advanced or higher
-   [x] You should be comfortable with Node.js, and be running a modern version of Node.js on your machine (v12+)
-   [x] You must be running Tableau Server v2021.4 or higher (Tableau Online is not supported)
-   [x] You must be using a supported identity provider, capable of issuing OAuth 2.0 JWT tokens, whose payload include audience `tableau`, scope `tableau:views:embed`, subject the Tableau username, and a unique JTI

### Set Up Your Machine

Use the commands below in your Terminal to set up your machine. For more information, visit our Live Apps guide at https://quip.com/dev/liveapps/ .

```
npm install -g quip-cli
quip-cli login
```

### Installation

1. Clone this repository on your local machine
2. Visit [Quip Developer Console](https://quip.com/dev/console) and click on "Create a Live App"
3. Copy the App ID displayed in the developer console and paste it inside `manifest.json`, replacing `<<ENTER YOUR LIVE APP ID HERE>>`.
4. Inside `manifest.json`, replace `HTTPS://YOUR_TABLEAU_SERVER_DOMAIN` with your actual Tableau Server domain
5. Inside `src/config.ts`, replace `HTTPS://YOUR_TABLEAU_SERVER_DOMAIN` with your actual Tableau Server domain
6. Run the following commands in your Terminal from the repository folder to build the live app and upload it to Quip

```
npm install
npm run build
quip-cli publish
quip-cli release --beta (and select the only version that appears in the list)
```

7. Open [Quip Developer Console](https://quip.com/dev/console) again (refresh it if you're still there) and, this time, click on the Tableau live app. Open the **Auth** tab
8. Find the section called "Add New Auth Configuration", select App Type: **OAUTH2** and click on **Add**
9. Fill out the auth configuration **exactly** as follows:

```
Name: tableau
Client ID: test
Client Secret: test
Scope: offline_access tableau:views:embed
Refresh Token Strategy: STANDARD
```

Then click on Update. Copy the Redirect URL, it will be required in the next step.

10. In your Identity Provider, configure the Authorization Server to be able to issue OAuth 2.0 JWT tokens. The tokens should have the following characteristics:

```
Audience: tableau
Subject: Tableau username
Scopes: tableau:views:embed offline_access
Token Expiration: 10 minutes
Unique JTI
```

And the Callback URI / Redirect URL for the application requesting the tokens should be the one you copied in the previous step.

When done, get the Client ID and Secret and update them in Quip's Developer Console (where you previously entered `test`), then Update

11. Run the following Tableau Services Manager (TSM) commands to tell Tableau to trust those tokens:

```
tsm configuration set -k features.OAuthExternalAuthorizationServer -v true
tsm configuration set -k vizportal.oauth.external_authorization.enabled -v true
tsm configuration set -k vizportal.oauth.external_authorization_server.issuer -v YOUR_TOKEN_ISSUER
```

Then save the pending changes and restart Tableau

12. Again inside the Auth tab in Quip Developer Console, click on **Test Login** and check if you are prompted to log using your identity provider. If it all goes well, you should see a "Success!" message
13. Great! Now follow the [usage instructions](#usage) to make sure the live app works before deploying it to all users.

### Deployment

Follow these instructions once you are ready to deploy the live app to your users:

1. Open [Quip Developer Console](https://quip.com/dev/console) and select the Tableau live app. Then open the Builds tab
2. Find the live app build in the list and click on **Release**
3. At the top, you should get a green message with instructions on how to install the live app so that all users can access it. If you are an admin, click on Install and follow the instructions to install the live app. If you are not an admin, click on Request Install, and let your admin know that you have made the request. They will be able to open Quip Admin Console > Live Apps and install the live app from there

## Usage

Open any Quip document and type @Tableau, then click Insert.

If you are asked to log in, click on Connect to Tableau, otherwise paste the URL of a Tableau dashbaord you'd like to embed.

That's it!

You can also add Filters and Parameters to the dashboard using the buttons at the top of the dashboard itself.

Finally, you can change the dashboard width by clicking on the Tableau menu in the live app, and following the relevant menu.
