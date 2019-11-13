// Copyright 2017 Quip

import {AUTH_CONFIG_NAMES} from "./config.js";
import BaseMenu from "../../shared/base-field-builder/base-menu.js";
import Dialog from "../../shared/dialog/dialog.jsx";
import {
    entityListener,
    parseRecordFromUrl,
} from "../../shared/base-field-builder/utils.jsx";
import {RecordPickerEntity} from "./model/record-picker.js";
import Record from "../../shared/base-field-builder/record.jsx";
import Styles from "./record-picker.less";
import {UnauthenticatedError} from "../../shared/base-field-builder/error.js";
import PlaceholderData from "./placeholder-data.js";
import {
    BooleanFieldEntity,
    DateFieldEntity,
    DeprecatedDateFieldEntity,
    DateTimeFieldEntity,
    EnumFieldEntity,
    FieldEntity,
    MultipicklistEntity,
    NumericFieldEntity,
    ReferenceFieldEntity,
    TextFieldEntity,
} from "../../shared/base-field-builder/model/field.js";

import {SalesforceRecordEntity} from "../../shared/salesforce/model/salesforce-record.js";

import RecordPicker from "./record-picker.jsx";
import {FieldBuilderMenu} from "./menus.js";
import {
    MismatchedInstanceError,
    SalesforceClient,
} from "../../shared/salesforce/client.js";

quip.apps.registerClass(BooleanFieldEntity, BooleanFieldEntity.ID);
quip.apps.registerClass(DateFieldEntity, DateFieldEntity.ID);
quip.apps.registerClass(
    DeprecatedDateFieldEntity,
    DeprecatedDateFieldEntity.ID);
quip.apps.registerClass(DateTimeFieldEntity, DateTimeFieldEntity.ID);
quip.apps.registerClass(EnumFieldEntity, EnumFieldEntity.ID);
quip.apps.registerClass(FieldEntity, FieldEntity.ID);
quip.apps.registerClass(MultipicklistEntity, MultipicklistEntity.ID);
quip.apps.registerClass(NumericFieldEntity, NumericFieldEntity.ID);
quip.apps.registerClass(RecordPickerEntity, RecordPickerEntity.ID);
quip.apps.registerClass(ReferenceFieldEntity, ReferenceFieldEntity.ID);
quip.apps.registerClass(SalesforceRecordEntity, SalesforceRecordEntity.ID);
quip.apps.registerClass(TextFieldEntity, TextFieldEntity.ID);

let rootComponent;
export function getRecordComponent() {
    return getRootComponent().getRecordComponent();
}

export function getRootComponent() {
    return rootComponent.getWrappedComponent();
}

const menuDelegate = new FieldBuilderMenu();

quip.apps.initialize({
    menuCommands: menuDelegate.allMenuCommands(),
    toolbarCommandIds: menuDelegate.getDefaultToolbarCommandIds(),
    initializationCallback: function(root, params) {
        const rootRecord = quip.apps.getRootRecord();
        const auth = quip.apps.auth(
            rootRecord.useSandbox()
                ? AUTH_CONFIG_NAMES.SANDBOX
                : AUTH_CONFIG_NAMES.PRODUCTION);
        const salesforceClient = new SalesforceClient(auth);
        rootRecord.setClient(salesforceClient);
        const initOptions = JSON.parse(params.initOptions || null);

        // Connect to the recordId if user has logged in. If not then
        // set the intended record as fallbackRecord so the next time
        // the user connects to Salesforce it will automatically connect
        // to the fallbackRecord.
        const maybeConnect = recordInfo => {
            if (salesforceClient.isLoggedIn()) {
                rootRecord.fetchRecord(
                    recordInfo.recordId,
                    recordInfo.userDefinedFields);
            } else {
                const placeholderData = PlaceholderData;
                if (recordInfo.placeholderRecordName) {
                    placeholderData.fieldsData["fields"]["Name"]["value"] =
                        recordInfo.placeholderRecordName;
                }
                if (recordInfo.placeholderRecordType) {
                    placeholderData.schema["label"] =
                        recordInfo.placeholderRecordType;
                    placeholderData.schema["labelPlural"] =
                        recordInfo.placeholderRecordType;
                }
                rootRecord.loadPlaceholderData(placeholderData);
                rootRecord.setFallbackRecordInfo(recordInfo);
            }
        };

        if (params.isCreation && params.creationUrl) {
            const recordInfo = parseRecordFromUrl(params.creationUrl);
            if (recordInfo.recordId) {
                maybeConnect(recordInfo);
            } else {
                rootRecord.loadPlaceholderData();
            }
        } else if (params.isCreation) {
            rootRecord.loadPlaceholderData();
        } else if (initOptions &&
            initOptions["record_id"] &&
            !rootRecord.getHasBeenRedirected()) {
            let previousFields = null;
            const previousRecord = rootRecord.getSelectedRecord();
            if (previousRecord && !previousRecord.isPlaceholder()) {
                previousFields = previousRecord
                    .getFields()
                    .map(f => f.getKey());
            }
            // By using the SRLA API call from html_import, we can specify the
            // JSON fields to pass in for the call. Users can pass in a list
            // of defined_fields, which specify which fields they would like
            // to be visible in the Salesforce Record. If the user does not
            // specify any defined_fields, all the previousFields from the
            // previousRecord would appear. If the user does specify
            // defined_fields, the previousFields variable would be overwritten
            // by the defined_fields.
            if (initOptions["user_defined_fields"]) {
                previousFields = initOptions["user_defined_fields"];
            }
            const recordInfo = {
                "recordId": initOptions["record_id"],
                "placeholderRecordName": initOptions["record_name"],
                "placeholderRecordType": initOptions["record_type"],
                "placeholderOrg": initOptions["org_name"],
                "userDefinedFields": previousFields,
            };
            maybeConnect(recordInfo);
            quip.apps.recordQuipMetric("redirect_via_init_options");
            rootRecord.setHasBeenRedirected(true);
        } else if (quip.apps.CreationSource &&
            params.creationSource === quip.apps.CreationSource.TEMPLATE) {
            rootRecord.loadPlaceholderData();
        }

        if (!params.isCreation) {
            rootRecord.ensureCurrentDataVersion();
        }

        ReactDOM.render(
            <WrappedRoot
                isCreation={params.isCreation}
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

class Root extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(RecordPickerEntity).isRequired,
        menuDelegate: React.PropTypes.instanceOf(BaseMenu).isRequired,
        isCreation: React.PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showRecordPicker: false,
            showMismatchedInstanceError: false,
            prevMenuCommand: null,
        };
    }

    componentDidMount() {
        const {entity, menuDelegate} = this.props;
        menuDelegate.refreshToolbar();
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.hideRecordPicker_);

        if (entity.getClient().isLoggedIn()) {
            this.doesConnectToFallbackRecordOnLoggedIn_();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        this.props.menuDelegate.refreshToolbar();
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.hideRecordPicker_);
    }

    getRecordComponent() {
        return this.recordComponent_.getWrappedComponent();
    }

    onConnect_ = e => {
        e.preventDefault();
        this.ensureLoggedIn().then(() => {
            if (this.doesConnectToFallbackRecordOnLoggedIn_()) {
                return;
            }
            this.props.menuDelegate.updateToolbar(
                this.props.entity.getSelectedRecord());
            this.setState({showRecordPicker: true});
        });
    };

    doesConnectToFallbackRecordOnLoggedIn_() {
        const rootRecord = this.props.entity;
        const fallbackRecordInfo = rootRecord.getFallbackRecordInfo();
        if (fallbackRecordInfo) {
             
            // user connects to, display an error message and don't clear out
            // the fallbackRecordInfo yet.
            rootRecord.fetchRecord(
                fallbackRecordInfo.recordId,
                fallbackRecordInfo.userDefinedFields);
            rootRecord.setFallbackRecordInfo(null);
            this.props.menuDelegate.updateToolbar(
                this.props.entity.getSelectedRecord());
            return true;
        }
        return false;
    }

    showMismatchedInstanceErrorDialog_(prevMenuCommand) {
        this.hideRecordPicker_();
        this.setState({
            prevMenuCommand,
            showMismatchedInstanceError: true,
        });
    }

    selectRecord_ = (selectedRecordId, schema) => {
        const previousRecord = this.props.entity.getSelectedRecord();
        let previousFields = null;
        if (previousRecord &&
            !previousRecord.isPlaceholder() &&
            previousRecord.getType() === schema.apiName) {
            previousFields = previousRecord.getFields().map(f => f.getKey());
        }
        this.props.entity.setSelectedRecord(
            selectedRecordId,
            schema,
            previousFields);
        this.hideRecordPicker_();
    };

    hideRecordPicker_ = () => {
        this.setState({showRecordPicker: false});
    };

    changeRecord = () => {
        this.setState({showRecordPicker: true});
    };

    logoutAndReconnect_ = () => {
        this.props.entity
            .logout()
            .then(() => this.dismissMismatchedInstanceErrorDialog_())
            .then(() => this.ensureLoggedIn())
            .then(() => {
                this.props.menuDelegate.updateToolbar(
                    this.props.entity.getSelectedRecord());
                this.props.menuDelegate.executeMenuOption(
                    this.state.prevMenuCommand);
                this.setState({prevMenuCommand: null});
            });
    };

    ensureLoggedIn(prevMenuCommand = null) {
        return this.props.entity.ensureLoggedIn().catch(err => {
            this.handleLoginError_(err, prevMenuCommand);
            // Re-raise so that callers can catch.
            return Promise.reject();
        });
    }

    handleLoginError_(err, prevMenuCommand) {
        if (err instanceof MismatchedInstanceError) {
            this.showMismatchedInstanceErrorDialog_(prevMenuCommand);
            return;
        }
        // Use loginError instead of err object because it's {} when login fails
        const loginError = new UnauthenticatedError(
            "Unable to login to Salesforce");
        this.getRecordComponent().errorHandling(loginError);
    }

    dismissMismatchedInstanceErrorDialog_ = () => {
        this.setState({
            showMismatchedInstanceError: false,
        });
    };

    renderMismatchedInstanceDialog_() {
        return <Dialog onDismiss={this.dismissMismatchedInstanceErrorDialog_}>
            <div className={Styles.errorDialog}>
                <div className={Styles.header}>
                    {quiptext("Reconnect to Salesforce?")}
                </div>
                <div className={Styles.errorTextBlock}>
                    <div className={Styles.errorTextDescription}>
                        {quiptext(
                            "This record is connected to %(hostname1)s " +
                                "but you're logged into %(hostname2)s. Would " +
                                "you like to logout and reconnect to modify " +
                                "this record?",
                            {
                                "hostname1": <b>
                                    {this.props.entity.getHostname()}
                                </b>,
                                "hostname2": <b>
                                    {this.props.entity
                                        .getClient()
                                        .getHostname()}
                                </b>,
                            })}
                    </div>
                </div>
                <div className={Styles.actions}>
                    <quip.apps.ui.Button
                        text={quiptext("Cancel")}
                        onClick={this.dismissMismatchedInstanceErrorDialog_}/>
                    <quip.apps.ui.Button
                        primary={true}
                        text={quiptext("Log Out and Reconnect")}
                        onClick={this.logoutAndReconnect_}/>
                </div>
            </div>
        </Dialog>;
    }

    loginHelpDiv() {
        return <div className={Styles.loginContext}>
            <span>
                {quiptext(
                    "Trouble connecting? Make sure your Quip and Salesforce admin has ")}
            </span>
            <a
                onClick={e => e.stopPropagation()}
                target="_blank"
                href="https://www.quipsupport.com/hc/en-us/articles/360022156351-Quip-Salesforce-Integration-Summary">
                {quiptext("already set up the integration")}
            </a>
            <span>
                {quiptext(
                    ", and that your browser isn't blocking the login popup.")}
            </span>
        </div>;
    }

    render() {
        const {showMismatchedInstanceError, showRecordPicker} = this.state;

        const {entity, menuDelegate} = this.props;

        let dialog;
        if (showMismatchedInstanceError) {
            dialog = this.renderMismatchedInstanceDialog_();
        } else if (showRecordPicker) {
            dialog = <RecordPicker
                entity={entity}
                onSelectRecord={this.selectRecord_}
                onDismiss={this.hideRecordPicker_}
                menuDelegate={this.props.menuDelegate}/>;
        }
        if (entity.fetchingRecord()) {
            // Should hit this only in url unfurling case
            return <quip.apps.ui.Spinner size={25} loading={true}/>;
        }
        const selectedRecord = entity.getSelectedRecord();
        const recordComponent = <Record
            isCreation={this.props.isCreation}
            entity={selectedRecord}
            menuDelegate={menuDelegate}
            ref={node => (this.recordComponent_ = node)}/>;

        const recordContainerClassNames = [];
        let chooseRecordButton;
        let contextInstructions;
        let placeholderOverlay;
        let recordContainerOnclick;
        if (selectedRecord && selectedRecord.isPlaceholder()) {
            const loggedIn = entity.getClient().isLoggedIn();
            if (!loggedIn) {
                contextInstructions = this.loginHelpDiv();
            }
            let org = "Salesforce";
            const fallbackRecordInfo = entity.getFallbackRecordInfo();
            if (fallbackRecordInfo) {
                if (fallbackRecordInfo.placeholderOrg) {
                    org = fallbackRecordInfo.placeholderOrg;
                }
            }
            const actionText = loggedIn
                ? quiptext("Select Record…")
                : quiptext("Connect to %(org)s", {
                      "org": org,
                  });
            recordContainerClassNames.push(Styles.placeholder);
            chooseRecordButton = <div className={Styles.openPicker}>
                <quip.apps.ui.Button
                    disabled={showRecordPicker}
                    text={actionText}/>
            </div>;
            placeholderOverlay = <div className={Styles.placeholderOverlay}/>;
            recordContainerOnclick = this.onConnect_;
        }
        return <div className={Styles.root}>
            <div
                className={recordContainerClassNames.join(" ")}
                onClick={recordContainerOnclick}>
                {chooseRecordButton}
                {contextInstructions}
                {placeholderOverlay}
                {recordComponent}
            </div>
            {dialog}
        </div>;
    }
}

const WrappedRoot = entityListener(Root);
