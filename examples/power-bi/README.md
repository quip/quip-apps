# Power BI Live App for Quip

Disclaimer: the source code of this live app is provided as is, and is not an official product or feature. Support is not provided.

## What is it?
This live app allows users to embed Power BI dashboards on Quip documents, making it easy to collaborate with colleagues and drive decisions based on live data.

## Installation
### Requirements
- [x] You must be an administrator of your Quip site
- [x] Your Quip site must be signed up to Quip Advanced or higher
- [x] You must be able to create an app registration in Microsoft Azure Active Directory
- [x] You must have Node v12 or higher installed on your machine

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
4. Run the following commands in your Terminal from the repository folder to build the live app and upload it to Quip
```
npm install
npm run build
quip-cli publish
quip-cli release --beta (and select the only version that appears in the list)
```
5. Open [Quip Developer Console](https://quip.com/dev/console) again (refresh it if you're still there) and, this time, click on the Power BI Dashboard live app. Open the **Auth** tab
6. Find the section called "Add New Auth Configuration", select App Type: **OAUTH2** and click on **Add**
7. Fill out the auth configuration **exactly** as follows:
```
Name: power-bi
Scope: offline_access https://analysis.windows.net/powerbi/api/Report.Read.All
Proxy API Domains: https://api.powerbi.com
Refresh Token Strategy: STANDARD
```
Don't save/update just yet. Leave the form open there.

8. Create an app in Power BI. Visit https://dev.powerbi.com/Apps and register a new app. Fill out the registration form as follows:
```
Name: Quip Power BI Live App
Application Type: Server-side web application
Home Page URL: https://quip.com
Redirect URL: <<copy & paste it from the Quip Developer Console auth form you left open>>
API Access: Read all datasets, dashboards, reports, workspaces
```
9. Save. Then copy Client ID and Client Secret and paste them in the Quip Developer Console auth form you left open. Don't save just yet!
10. Open [Azure Active Directory](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview), select **App Registrations**, click on the **Endpoints** tab and copy and paste the **OAuth 2.0 authorization endpoint (v2)** and **OAuth 2.0 token endpoint (v2)** into the Quip Developer Console auth form you left open, in the Authorize URL and Token URL fields respectively. Click Update
11. Again inside the Auth tab in Quip Developer Console, click on **Test Login** and check if you are prompted to log into Power BI. If it all goes well, you should see a "Success!" message
12. Great. Now follow the [usage instructions](#usage) to make sure the live app works before deploying it to all users.

### Deployment
Follow these instructions once you are ready to deploy the live app to your users:

1. Open [Quip Developer Console](https://quip.com/dev/console) and select the Power BI Dashboard live app. Then open the Builds tab
2. Find the live app build in the list and click on **Release**
3. At the top, you should get a green message with instructions on how to install the live app so that all users can access it. If you are an admin, click on Install and follow the instructions to install the live app. If you are not an admin, click on Request Install, and let your admin know that you have made the request. They will be able to open Quip Admin Console > Live Apps and install the live app from there


Enjoy! :heart:

## Usage

Open any Quip document and type @Power BI Dashboard, then click Insert.

If you are asked to log in, click on Sign In with Microsoft, otherwise select a dashboard from the ones you can access, and choose Insert.

That's it!

If you are looking to add this live app to a template, you are also able to predefine the Dashboard URL. To do that, insert the live app into a template, then open the Power BI Dashbaord menu and select Template Mode.