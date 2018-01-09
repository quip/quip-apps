// Copyright 2017 Quip

import {RecordPickerEntity} from "./model/record-picker.js";
import PlaceholderData from "./placeholder-data.js";

import {
    FieldEntity,
    NumericFieldEntity,
    TextFieldEntity,
    BooleanFieldEntity,
    EnumFieldEntity,
} from "../../shared/base-field-builder/model/field.js";

import {SalesforceRecordEntity} from "./model/salesforce-record.js";

import RecordPicker from "./record-picker.jsx";
import {FieldBuilderMenu} from "./menus.js";
import {SalesforceClient} from "./client.js";

// TODO: actually replace quip.apps.ui.Image.Placeholder with
// quip.apps.ui.Spinner in code when enough clients have it.
if (quip.apps.ui.Spinner) {
    quip.apps.ui.Image.Placeholder = quip.apps.ui.Spinner;
}

quip.apps.registerClass(RecordPickerEntity, RecordPickerEntity.ID);
quip.apps.registerClass(SalesforceRecordEntity, SalesforceRecordEntity.ID);
quip.apps.registerClass(FieldEntity, FieldEntity.ID);
quip.apps.registerClass(TextFieldEntity, TextFieldEntity.ID);
quip.apps.registerClass(NumericFieldEntity, NumericFieldEntity.ID);
quip.apps.registerClass(BooleanFieldEntity, BooleanFieldEntity.ID);
quip.apps.registerClass(EnumFieldEntity, EnumFieldEntity.ID);

let rootComponent;
export function getRecordComponent() {
    const recordPicker = rootComponent.getWrappedComponent();
    return recordPicker.getRecordComponent();
}

export function getRecordPickerComponent() {
    return rootComponent.getWrappedComponent();
}

const DEV_LOCALLY = false;
const menuDelegate = new FieldBuilderMenu();

quip.apps.initialize({
    menuCommands: menuDelegate.allMenuCommands(),
    toolbarCommandIds: [quip.apps.DocumentMenuCommands.MENU_MAIN, "save-data"],
    initializationCallback: function(root, params) {
        const rootRecord = quip.apps.getRootRecord();

        let auth;
        if (!DEV_LOCALLY) {
            auth = quip.apps.auth("salesforce");
        }
        const salesforceClient = new SalesforceClient(auth);
        rootRecord.setClient(salesforceClient);
        if (params.isCreation && params.creationUrl) {
            const recordId = params.creationUrl
                .split("sObject/")[1]
                .split("/view")[0];
            if (recordId.length == 18) {
                rootRecord.fetchData().then(() => {
                    rootRecord.setSelectedRecord(recordId);
                });
            }
        } else if (params.isCreation) {
            rootRecord.loadPlaceholderData(PlaceholderData);
        }

        ReactDOM.render(
            <RecordPicker
                entity={rootRecord}
                menuDelegate={menuDelegate}
                ref={node => {
                    rootComponent = node;
                    rootRecord.setDom(ReactDOM.findDOMNode(node));
                }}/>,
            root);
        menuDelegate.refreshToolbar();
    },
});
