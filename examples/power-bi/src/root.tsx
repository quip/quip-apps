import quip from "quip-apps-api";
import React from "react";
import ReactDOM from "react-dom";
import Main from "./components/main";
import {Menu} from "./menus";
import {RootEntity} from "./model/root";

quip.apps.registerClass(RootEntity, RootEntity.ID);

quip.apps.initialize({
    initializationCallback: (
        rootNode: Element,
        params: {
            isCreation: boolean;
            creationUrl?: string;
            initOptions?: string;
        }
    ) => {
        const menu = new Menu();
        const rootRecord = quip.apps.getRootRecord() as RootEntity;
        rootRecord.reloadTemplateParams();

        ReactDOM.render(
            <Main
                rootRecord={rootRecord}
                menu={menu}
                isCreation={params.isCreation}
                creationUrl={params.creationUrl}
                initOptions={params.initOptions}
            />,
            rootNode
        );
    },
});
