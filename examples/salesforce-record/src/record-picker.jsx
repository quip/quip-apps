// Copyright 2017 Quip

import BaseMenu from "../../shared/base-field-builder/base-menu.js";
import ChevronIcon from "../../shared/base-field-builder/icons/chevron.jsx";
import Dialog from "../../shared/dialog/dialog.jsx";
import InstructionsDialog from "./instructions-dialog.jsx";
import {entityListener} from "../../shared/base-field-builder/utils.jsx";
import Record from "../../shared/base-field-builder/record.jsx";
import RowContainer from "../../shared/base-field-builder/row-container.jsx";
import Styles from "./record-picker.less";
import {
    DefaultError,
    UnauthenticatedError,
} from "../../shared/base-field-builder/error.js";

import {
    SUPPORTED_OBJECT_TYPE_KEYS,
    getDisplayName,
    getSupportedListViews,
} from "./config.js";
import {RecordPickerEntity} from "./model/record-picker.js";
import {MismatchedInstanceError} from "./client.js";

const LOADING_STATUS = {
    LOADING: 0,
    LOADED: 1,
    ERROR: 2,
};

class RecordPicker extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(RecordPickerEntity).isRequired,
        menuDelegate: React.PropTypes.instanceOf(BaseMenu).isRequired,
    };

    constructor(props) {
        super(props);
        const states = {
            showDialog: false,
            listViewsLoadingStatus: LOADING_STATUS.LOADING,
            showConnectedAppInstructions: false,
            showMismatchedInstanceError: false,
            prevMenuCommand: null,
        };
        this.state = Object.assign(states, this.defaultDialogState());
    }

    defaultDialogState() {
        const defaultRecordType = SUPPORTED_OBJECT_TYPE_KEYS[0];
        const defaultListView = getSupportedListViews(defaultRecordType)[0];
        return {
            selectedRecordType: defaultRecordType,
            selectedListViewKey: defaultListView,
            selectedRecordId: null,
            selectedRelatedListKey: null,
        };
    }

    componentDidMount() {
        this.props.menuDelegate.refreshToolbar();
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.hideDialog_);
        if (this.props.entity.getClient().isLoggedIn() &&
            this.props.entity.getClient().onSourceInstance()) {
            this.fetchData();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedRelatedListKey === null &&
            this.state.selectedRelatedListKey !== null &&
            this.columnGroupNode_) {
            const columnGroupNode = ReactDOM.findDOMNode(this.columnGroupNode_);
            columnGroupNode.scrollLeft = columnGroupNode.scrollWidth;
        }
        this.props.menuDelegate.refreshToolbar();
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.hideDialog_);
    }

    getRecordComponent() {
        return this.recordComponent_.getWrappedComponent();
    }

    relatedListCommandId_(type, relatedList) {
        return `related_${type}_${relatedList.key}`;
    }

    fetchData() {
        this.setState({
            listViewsLoadingStatus: LOADING_STATUS.LOADING,
        });
        this.props.entity
            .fetchData()
            .then(() => {
                this.setState({
                    listViewsLoadingStatus: LOADING_STATUS.LOADED,
                });
            })
            .catch(err => {
                console.error(err);
                this.getRecordComponent().errorHandling(err);
                this.setState({
                    listViewsLoadingStatus: LOADING_STATUS.ERROR,
                });
            });
    }

    addRelatedListsToMenu_ = () => {
        const menuCommands = this.props.menuDelegate.allMenuCommands();
        const relatedMenuCommands = SUPPORTED_OBJECT_TYPE_KEYS.map(type => {
            const relatedLists = this.props.entity.getRelatedListsForType(type);
            return relatedLists.map(relatedList => {
                const label = relatedList.label;
                const key = this.relatedListCommandId_(type, relatedList);
                return {
                    id: key,
                    label: label,
                    handler: () => {
                        this.setState({
                            selectedRelatedListKey: relatedList.key,
                        });
                    },
                };
            });
        });
        const flattenedRelatedMenuCommands = [].concat(...relatedMenuCommands);
        const allMenuCommands = [
            ...flattenedRelatedMenuCommands,
            ...menuCommands,
        ];
        quip.apps.updateToolbar({menuCommands: allMenuCommands});
    };

    showDialog_ = e => {
        e.preventDefault();
        if (this.props.entity.getClient().isLoggedIn()) {
            if (this.state.listViewsLoadingStatus == LOADING_STATUS.ERROR ||
                (this.state.listViewsLoadingStatus == LOADING_STATUS.LOADED &&
                    this.props.entity.isExpired())) {
                this.fetchData();
            }
            this.setState({showDialog: true});
        } else {
            this.ensureLoggedIn().then(() => {
                this.props.menuDelegate.updateToolbar(
                    this.props.entity.getSelectedRecord());
                this.fetchData();
                this.setState({showDialog: true});
            });
        }
    };

    showMismatchedInstanceErrorDialog_(prevMenuCommand) {
        this.hideDialog_();
        this.setState({
            prevMenuCommand,
            showMismatchedInstanceError: true,
        });
    }

    hideDialog_ = e => {
        const states = {
            showDialog: false,
        };
        this.setState(Object.assign(states, this.defaultDialogState()));
    };

    restoreToDefaultState = () => {
        const states = {
            showDialog: true,
        };
        this.setState(Object.assign(states, this.defaultDialogState()));
    };

    selectRecordType_ = (e, newlySelectedRecordType) => {
        e.preventDefault();
        if (newlySelectedRecordType != this.state.selectedRecordType) {
            const defaultListView = getSupportedListViews(
                newlySelectedRecordType)[0];
            this.setState({
                selectedRecordType: newlySelectedRecordType,
                selectedListViewKey: defaultListView,
                selectedRecordId: null,
                selectedRelatedListKey: null,
            });
        }
    };

    selectListView_ = (e, newlySelectedListView) => {
        e.preventDefault();
        if (newlySelectedListView.key != this.state.selectedListViewKey) {
            this.setState({
                selectedListViewKey: newlySelectedListView.key,
                selectedRecordId: null,
                selectedRelatedListKey: null,
            });
        }
    };

    selectRecordId_ = (e, newlySelectedRecord) => {
        if (newlySelectedRecord &&
            newlySelectedRecord.id != this.state.selectedRecordId) {
            this.setState({
                selectedRecordId: newlySelectedRecord.id,
            });
        }
    };

    selectRecord_ = e => {
        if (this.state.selectedRecordId !== null) {
            this.props.entity.setSelectedRecord(this.state.selectedRecordId);
            this.hideDialog_();
        }
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

    render() {
        let connectedAppInstructions;
        let recordPickerDialog;
        if (this.state.showConnectedAppInstructions) {
            connectedAppInstructions = <InstructionsDialog
                onDismiss={() => {
                    this.setState({showConnectedAppInstructions: false});
                }}/>;
        } else if (this.state.showMismatchedInstanceError) {
            recordPickerDialog = <Dialog
                onDismiss={this.dismissMismatchedInstanceErrorDialog_}>
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
                            onClick={
                                this.dismissMismatchedInstanceErrorDialog_
                            }/>
                        <quip.apps.ui.Button
                            primary={true}
                            text={quiptext("Log Out and Reconnect")}
                            onClick={this.logoutAndReconnect_}/>
                    </div>
                </div>
            </Dialog>;
        } else if (this.state.showDialog) {
            const recordType = this.state.selectedRecordType;
            const relatedMenuCommandIds = this.props.entity
                .getRelatedListsForType(recordType)
                .map(relatedList => {
                    return this.relatedListCommandId_(recordType, relatedList);
                });

            const listViews = this.props.entity.getListViewsForType(recordType);
            const listViewsLoadingStatus = this.state.listViewsLoadingStatus;
            const selectedListView = listViews.filter(listView => {
                return listView.key === this.state.selectedListViewKey;
            });
            let recordFilterPlaceholder = quiptext("Search");
            if (selectedListView && selectedListView[0]) {
                recordFilterPlaceholder += " " + selectedListView[0].label;
            }
            recordPickerDialog = <Dialog onDismiss={this.hideDialog_}>
                <div className={Styles.dialog}>
                    <div className={Styles.header}>
                        {quiptext("Select Salesforce Record")}
                    </div>
                    <div className={Styles.picker}>
                        <RecordTypePicker
                            selectedType={recordType}
                            types={SUPPORTED_OBJECT_TYPE_KEYS}
                            onClick={this.selectRecordType_}/>
                        <div
                            className={Styles.columnGroup}
                            ref={node => (this.columnGroupNode_ = node)}>
                            <ListViewPicker
                                listViews={listViews}
                                listViewsLoadingStatus={listViewsLoadingStatus}
                                selectedListViewKey={
                                    this.state.selectedListViewKey
                                }
                                onClick={this.selectListView_}/>
                            {listViewsLoadingStatus ==
                                LOADING_STATUS.LOADED && <RecordFilter
                                entity={this.props.entity}
                                selectedRecordType={recordType}
                                selectedListViewKey={
                                    this.state.selectedListViewKey
                                }
                                searchPlaceholder={recordFilterPlaceholder}
                                selectedRecordId={this.state.selectedRecordId}
                                menuDelegate={this.props.menuDelegate}
                                menuCommandIds={relatedMenuCommandIds}
                                onClick={this.selectRecordId_}
                                onSubmit={this.selectRecord_}/>}
                        </div>
                    </div>
                    <div className={Styles.actions}>
                        <quip.apps.ui.Button
                            text={quiptext("Cancel")}
                            onClick={this.hideDialog_}/>
                        <quip.apps.ui.Button
                            primary={true}
                            disabled={this.state.selectedRecordId === null}
                            text={quiptext("Select Record")}
                            onClick={this.selectRecord_}/>
                    </div>
                </div>
            </Dialog>;
        }

        const selectedRecord = this.props.entity.getSelectedRecord();
        // Should hit this only in url unfurling case
        if (!selectedRecord) {
            return <quip.apps.ui.Image.Placeholder size={25} loading={true}/>;
        }
        const recordComponent = <Record
            entity={selectedRecord}
            menuDelegate={this.props.menuDelegate}
            ref={node => (this.recordComponent_ = node)}/>;

        const recordContainerClassNames = [];
        let chooseRecordButton;
        let placeholderOverlay;
        let recordContainerOnclick;
        if (selectedRecord && selectedRecord.isPlaceholder()) {
            const actionText = this.props.entity.getClient().isLoggedIn()
                ? quiptext("Select Record…")
                : quiptext("Connect to Salesforce…");
            recordContainerClassNames.push(Styles.placeholder);
            chooseRecordButton = <div className={Styles.openPicker}>
                <quip.apps.ui.Button
                    disabled={this.state.showDialog}
                    text={actionText}/>
            </div>;
            placeholderOverlay = <div className={Styles.placeholderOverlay}/>;
            recordContainerOnclick = this.showDialog_;
        }
        return <div className={Styles.root}>
            <div
                className={recordContainerClassNames.join(" ")}
                onClick={recordContainerOnclick}>
                {chooseRecordButton}
                {placeholderOverlay}
                {recordComponent}
            </div>
            {recordPickerDialog}
            {connectedAppInstructions}
        </div>;
    }
}

export default entityListener(RecordPicker);

class RecordTypePicker extends React.Component {
    static propTypes = {
        types: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
        selectedType: React.PropTypes.string.isRequired,
        onClick: React.PropTypes.func.isRequired,
    };

    renderRow_ = (type, isHighlighted, index) => {
        const classNames = [Styles.recordTypeRow];
        if (this.props.selectedType === type) {
            classNames.push(Styles.highlighted);
        }
        return <div
            className={classNames.join(" ")}
            onClick={e => this.props.onClick(e, type)}>
            {getDisplayName(type) || type}
        </div>;
    };

    render() {
        return <div className={Styles.recordTypePicker}>
            <RowContainer
                rows={this.props.types}
                renderRow={this.renderRow_}
                containerClassName={Styles.scrollableList}/>
        </div>;
    }
}

class ListViewPicker extends React.Component {
    static propTypes = {
        listViews: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        listViewsLoadingStatus: React.PropTypes.oneOf(
            Object.values(LOADING_STATUS)),
        selectedListViewKey: React.PropTypes.string.isRequired,
        onClick: React.PropTypes.func.isRequired,
    };

    renderRow_ = (listView, isHighlighted, index) => {
        const classNames = [Styles.listViewRow];
        const selectedListViewKey = this.props.selectedListViewKey;
        if (selectedListViewKey === listView.key) {
            classNames.push(Styles.highlighted);
        }
        return <div
            className={classNames.join(" ")}
            onClick={e => this.props.onClick(e, listView)}>
            {listView.label}
        </div>;
    };

    render() {
        if (this.props.listViewsLoadingStatus == LOADING_STATUS.LOADING) {
            return <quip.apps.ui.Image.Placeholder size={25} loading={true}/>;
        }
        if (this.props.listViewsLoadingStatus == LOADING_STATUS.ERROR) {
            return <div className={Styles.errorLoading}>
                {quiptext("Could Not Connect")}
            </div>;
        }
        return <div className={Styles.listViewPicker}>
            <RowContainer
                rows={this.props.listViews}
                renderRow={this.renderRow_}
                containerClassName={Styles.scrollableList}/>
        </div>;
    }
}

class RecordFilter extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(RecordPickerEntity).isRequired,
        selectedRecordType: React.PropTypes.string.isRequired,
        selectedListViewKey: React.PropTypes.string.isRequired,
        selectedRecordId: React.PropTypes.string,
        menuDelegate: React.PropTypes.instanceOf(BaseMenu).isRequired,
        menuCommandIds: React.PropTypes.arrayOf(React.PropTypes.string)
            .isRequired,
        onClick: React.PropTypes.func.isRequired,
        initialQuery: React.PropTypes.string,
        searchPlaceholder: React.PropTypes.string,
        onSubmit: React.PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            query: this.props.initialQuery || "",
            recordsData: [],
            recordDataLoadingStatus: LOADING_STATUS.LOADING,
            timeoutId: null,
        };
    }

    componentDidMount() {
        this.fetchRecordData_();
        this.focusInput_();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedRecordType !== this.props.selectedRecordType ||
            nextProps.selectedListViewKey !== this.props.selectedListViewKey) {
            this.setState({query: "", recordsData: []}, () => {
                this.fetchRecordData_(this.state.query);
                this.focusInput_();
            });
        }
    }

    fetchRecordData_ = searchTerm => {
        const selectedRecordType = this.props.selectedRecordType;
        this.setState({recordDataLoadingStatus: LOADING_STATUS.LOADING});
        this.props.entity
            .fetchRecordDataForListView(
                selectedRecordType,
                this.props.selectedListViewKey,
                searchTerm)
            .then(records => {
                if (!this.state.recordsData ||
                    !this.state.recordsData.requestTime ||
                    this.state.recordsData.requestTime < records.requestTime) {
                    this.setState({recordsData: records});
                }
                this.setState({recordDataLoadingStatus: LOADING_STATUS.LOADED});
            })
            .catch(errorMessage => {
                console.error(errorMessage);
                let requestTimeOfError;
                if (errorMessage.includes("requestTime:")) {
                    const seg = errorMessage.split("requestTime:");
                    if (seg.length >= 1) {
                        requestTimeOfError = new Number(seg[1]);
                    }
                }
                if (!this.state.recordsData ||
                    !this.state.recordsData.requestTime ||
                    (requestTimeOfError &&
                        requestTimeOfError >
                            this.state.recordsData.requestTime)) {
                    this.setState({
                        recordDataLoadingStatus: LOADING_STATUS.ERROR,
                    });
                } // else keep the old state
            });
    };

    onChange_ = e => {
        let timeoutId = this.state.timeoutId;
        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }
        const searchTerm = e.target.value;
        timeoutId = window.setTimeout(() => {
            this.fetchRecordData_(searchTerm);
            this.setState({timeoutId: null});
        }, 500);
        this.setState({
            timeoutId: timeoutId,
            query: e.target.value,
        });
    };

    focusInput_ = () => {
        if (this.searchInput_) {
            this.searchInput_.focus();
        }
    };

    renderRow_ = (recordData, isHighlighted, index) => {
        const highlighted = this.props.selectedRecordId === recordData.id;
        return <RecordFilterRow
            recordData={recordData}
            isHighlighted={highlighted}
            menuDelegate={this.props.menuDelegate}
            menuCommandIds={this.props.menuCommandIds}/>;
    };

    render() {
        const resultRecords = this.state.recordsData;
        const placeholder = this.props.searchPlaceholder
            ? this.props.searchPlaceholder
            : quiptext("Search");
        let recordsContent;
        if (this.state.recordDataLoadingStatus == LOADING_STATUS.LOADING) {
            recordsContent = <quip.apps.ui.Image.Placeholder
                size={25}
                loading={true}/>;
        } else if (this.state.recordDataLoadingStatus == LOADING_STATUS.ERROR) {
            recordsContent = <div className={Styles.errorLoading}>
                {quiptext("Could Not Connect")}
            </div>;
        } else {
            if (resultRecords.length == 0) {
                recordsContent = <div className={Styles.noResult}>
                    {quiptext("No Results")}
                </div>;
            } else {
                recordsContent = <RowContainer
                    rows={resultRecords}
                    renderRow={this.renderRow_}
                    containerClassName={Styles.scrollableList}
                    isActive={true}
                    onSubmitSelectedRow={this.props.onSubmit}
                    onSelectionChanage={this.props.onClick}/>;
            }
        }
        return <div className={Styles.recordFilter}>
            <div className={Styles.searchInput}>
                <input
                    className={Styles.searchInputControl}
                    value={this.state.query}
                    onChange={this.onChange_}
                    placeholder={placeholder}
                    ref={node => (this.searchInput_ = node)}/>
            </div>
            {recordsContent}
        </div>;
    }
}

class RecordFilterRow extends React.Component {
    static propTypes = {
        recordData: React.PropTypes.object.isRequired,
        isHighlighted: React.PropTypes.bool.isRequired,
        menuDelegate: React.PropTypes.instanceOf(BaseMenu).isRequired,
        menuCommandIds: React.PropTypes.arrayOf(React.PropTypes.string)
            .isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {showingMenu: false};
    }

    showMenu_ = e => {
        if (this.state.showingMenu) {
            return;
        }
        this.setState({showingMenu: true});
        this.props.menuDelegate.showRecordPickerContextMenu(
            e,
            this.menuButton_,
            this.props.menuCommandIds,
            () => this.setState({showingMenu: false}));
    };

    render() {
        const classNames = [Styles.recordRow];
        if (this.props.isHighlighted) {
            classNames.push(Styles.highlighted);
        }
        const menuButtonClassNames = [Styles.menuButton];
        if (this.state.showingMenu) {
            menuButtonClassNames.push(Styles.active);
        }
        return <div className={classNames.join(" ")}>
            {this.props.recordData.name}
        </div>;
    }
}
