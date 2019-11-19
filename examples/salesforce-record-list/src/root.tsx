// Copyright 2019 Quip

import React, {ComponentType, StatelessComponent} from "react";
import ReactDOM from "react-dom";
import quip from "quip-apps-api";
import SalesforceResponse from "./model/salesforce-response";
import {RootEntity} from "./model/root";
import {ListsResponse} from "./model/lists-response";
import {SalesforceListEntity} from "./model/salesforce-list";
import CellComment from "./model/cell-comment";
import {ListMenu} from "./menus";
import Main from "./components/main";
import menuActions from "./lib/menu-actions";
import {IconSettings} from "@salesforce/design-system-react";
import StandardSprite from "@salesforce-ux/design-system/assets/icons/standard-sprite/svg/symbols.svg";
import ActionSprite from "@salesforce-ux/design-system/assets/icons/action-sprite/svg/symbols.svg";
import UtilitySprite from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";
import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.css";
import "./dsr-quip-mods.css";
import "./styles.css";
import recordMetric from "./lib/metrics";

quip.apps.registerClass(SalesforceResponse, SalesforceResponse.ID);
quip.apps.registerClass(RootEntity, RootEntity.ID);
quip.apps.registerClass(ListsResponse, ListsResponse.ID);
quip.apps.registerClass(SalesforceListEntity, SalesforceListEntity.ID);
quip.apps.registerClass(CellComment, CellComment.ID);

const listMenu = new ListMenu(menuActions);

const iconSettingsWrapper = <P extends object>(
    WrappedComponent: ComponentType<P>) => {
    const IconSettingsWrapper: StatelessComponent<P> = (
        props: Object | null) => <IconSettings
        onRequestIconPath={({name}: {category: string; name: string}) =>
            `#${name}`
        }>
        <div>
            <StandardSprite/>
            <ActionSprite/>
            <UtilitySprite/>
            <WrappedComponent {...props as P}/>
        </div>
    </IconSettings>;
    return IconSettingsWrapper;
};

const RootComponent = iconSettingsWrapper(Main);

quip.apps.initialize({
    menuCommands: listMenu.allMenuCommands(),
    toolbarCommandIds: listMenu.getDefaultToolbarCommandIds(),
    initializationCallback: function(rootNode, params) {
        const rootRecord = quip.apps.getRootRecord() as RootEntity;
        let error;
        try {
            ReactDOM.render(
                <RootComponent
                    rootRecord={rootRecord}
                    listMenu={listMenu}
                    isCreation={params.isCreation}
                    creationUrl={params.creationUrl}
                    initOptionsJson={params.initOptions}
                    error={error}/>,
                rootNode);
        } catch (e) {
            recordMetric("error", {
                "error_type": "render",
                "message": e.message,
                "stack": e.stack,
            });
            throw e;
        }
    },
});
