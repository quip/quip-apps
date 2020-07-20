import quip from "quip-apps-api";
import React from "react";
import ReactDOM from "react-dom";
import Main from "./components/main";
import {Menu} from "./menus";
import {RootEntity} from "./model/root";
quip.apps.registerClass(RootEntity, RootEntity.ID);
const menu = new Menu();
quip.apps.initialize({
    initializationCallback: function (rootNode, params) {
        const rootRecord = quip.apps.getRootRecord();
        ReactDOM.render(
            <Main
                rootRecord={rootRecord}
                menu={menu}
                isCreation={params.isCreation}
                creationUrl={params.creationUrl}
            />,
            rootNode
        );
    },
});
