# Google Drive

A simple demo for getting a Quip API token you can use in a proxy
application to make requests using the Automation API
See [https://quip.com/dev/automation/documentation][]

## Setup

### 1. Create a Live App

Go to [https://quip.com/dev/console][] and click on "Create a Live App". Copy the App ID and replace the `"id"` field in `app/manifest.json`.

### 2. Build .ele bundle

```bash
npm run build
```

### 3. An Enterprise-enabled Site Admin must create an API Key for your App

1. Go to [https://admin.quip.com/][]
2. Find the section named "API Keys"
  - If not present, be sure that the Site has "applications enabled".
3. Click on "Create API Key" and add an entry for this App
  - This is where you'll get the Client ID and Client Secret for the Auth config
  - Note that the service name here is not programmatically important

### 4. Configure Auth

1. Go to [https://quip.com/dev/console][]
2. Click on the app you just updated
3. Go to the "Auth" section at the bottom, select OAUTH2 as the auth type and click on "Add"
4. Fill out the Auth configuration (leave everything else blank):
	- **Name**: `YourAppName`
    - You'll need to use the name you choose here in place of `quip-automation-api` when getting an instance of the Live Apps Auth instace (e.g. `quip.apps.auth("quip-automation-api")`)
  - **Authorization URL**: `https://platform.quip.com/1/oauth/login`
  - **Client ID**: Client ID from admin.quip.com
  - **Client Secret**: Client Secret from admin.quip.com
  - **Token URL**: `https://platform.quip.com/1/oauth/access_token`
5. Click on Update.
6. Click on `Test Login`. It should work.
