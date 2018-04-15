# Google Maps

A simple example to show how to add a google map to your quip document

## Setup

### 1. Create a Live App

Go to [console](https://quip.com/dev/console) and click on "Create a Live App". Copy the App ID and replace the `"id"` field in `app/manifest.json`.

## 2. Add your Google Maps API key

- Get a Google Maps API Key from [here](https://developers.google.com/maps/documentation/javascript/get-api-key )
- Place that Key in GOOGLE_MAPS_API_KEY variable in App.jsx
- Build the project with 'npm run build' and replace app.ele

### 3. Build .ele bundle

```bash
npm run build
```

### 4. Update App

1. Go to [console](https://quip.com/dev/console)
2. Click on the app you just created
3. Click on "Upload Bundle" and select the bundle file `app/app.ele`
4. Click on "Upload"

### 5. That's it

## Example

![Example Usage](https://user-images.githubusercontent.com/12212922/38780544-221b0e3e-40a6-11e8-965c-169a79ef8884.gif "Example Usage")