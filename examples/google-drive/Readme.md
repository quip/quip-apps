# Google Drive

A simple Google Drive app that demos how to use the OAuth2 login apis.

## Setup

### 1. Create a Live App

Go to [https://quip.com/dev/console][] and click on "Create a Live App". Copy the App ID and replace the `"id"` field in `app/manifest.json`.

### 2. Build .ele bundle

```bash
npm run build
```

### 3. Update App

1. Go to [https://quip.com/dev/console][]
2. Click on the app you just created
3. Click on "Upload Bundle" and select the bundle file `app/app.ele`
4. Click on "Upload"

### 4. Configure Auth

1. Go to https://console.cloud.google.com/, create a new project
2. Menu -> APIs & Services -> Credentials -> Create Credentials -> OAuth Client ID -> Web Application. Give it a name and leave everything else blank.
3. Click on the OAuth client page and get the client ID and secret
4. Go to [https://quip.com/dev/console][]
5. Click on the app you just updated
6. Go to the "Auth" section at the bottom, select OAUTH2 as the auth type and click on "Add"
7. Fill out the auth configuration:
	- **Name**: `gdrive`
  - **Authorization URL**: `https://accounts.google.com/o/oauth2/v2/auth`
  - **Client ID**: your client id
  - **Client Secret**: your client secret
  - **Token URL**: `https://www.googleapis.com/oauth2/v4/token`
  - **Scope**: `https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly`
  - **Proxy API Domains**: `https://www.googleapis.com`
  - **Refresh Token Strategy**: `STANDARD`
8. Click on Update. Copy the **Redirect URL** on the page and add it to the "Authorized redirect URIs" section in the OAuth client config page on google cloud console.
9. Click on Test Login. You should be able to go through the whole login flow and see a success message at the end. If you see a warning screen that says this app is unverified. Ignore the warning, click on advanced, and the click continue.
