import quip from "quip";
import Connect from "./connectRecord";
import App from "./App.jsx";

class RootRecord extends quip.apps.RootRecord {
    static getProperties = () => ({
        image: quip.apps.ImageRecord,
    });

    static getDefaultProperties = () => ({
        image: {},
    });
}
quip.apps.registerClass(RootRecord, "root");

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        const rootRecord = quip.apps.getRootRecord();
        const imageRecord = rootRecord.get("image");
        console.debug("init", rootRecord, imageRecord);
        const ConnectedApp = Connect(rootRecord, App);
        ReactDOM.render(<ConnectedApp />, rootNode);
    },
    toolbarCommandIds: ["imagePicker"],
    menuCommands: [
        {
            id: "imagePicker",
            label: quiptext("Upload Image"),
            handler: (name, context, p3) => {
                console.debug("menu handler called");
                if (p3 && p3.length && p3[0].blob) {
                    const imgData = p3[0].blob.getData();
                    console.debug("IMGData", imgData);
                    const imgBlob = new Blob([new Uint8Array(imgData)]);
                    const rootRecord = quip.apps.getRootRecord();
                    rootRecord.clear("image");
                    const imageRecord = rootRecord.get("image");
                    imageRecord.uploadFile(imgBlob);
                }
            },
            actionId: quip.apps.DocumentMenuActions.SHOW_FILE_PICKER,
        },
    ],
});
