import quip from "quip-apps-api";
import React from "react";
import ReactDOM from "react-dom";
import Main from "./components/main";
import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css";

quip.apps.initialize({
    initializationCallback: function (
        rootNode: Element,
        params: {
            isCreation: boolean;
            creationUrl?: string;
        }
    ) {
        ReactDOM.render(
            <Main
                isCreation={params.isCreation}
                creationUrl={params.creationUrl}/>,
            rootNode);
    },
});
