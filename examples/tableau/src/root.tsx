import quip from "quip-apps-api";
import React from "react";
import ReactDOM from "react-dom";
import Main from "./components/main";
import {Menu} from "./menus";
import {RootEntity, TableauFilter, TableauParam} from "./model/root";

quip.apps.registerClass(TableauFilter, TableauFilter.ID);
quip.apps.registerClass(TableauParam, TableauParam.ID);
quip.apps.registerClass(RootEntity, RootEntity.ID);

const menu = new Menu();

quip.apps.initialize({
    initializationCallback: function (
        rootNode: Element,
        params: {
            isCreation: boolean;
            creationUrl?: string;
        }
    ) {
        const rootRecord = quip.apps.getRootRecord() as RootEntity;
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
