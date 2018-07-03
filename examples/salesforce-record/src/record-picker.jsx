// Copyright 2017 Quip

import BaseMenu from "../../shared/base-field-builder/base-menu.js";
import ChevronIcon from "../../shared/base-field-builder/icons/chevron.jsx";
import Dialog from "../../shared/dialog/dialog.jsx";
import RowContainer from "../../shared/base-field-builder/row-container.jsx";
import Styles from "./record-picker.less";
import {
    DefaultError,
    UnauthenticatedError,
    isNonDefaultError,
} from "../../shared/base-field-builder/error.js";

import {getDisplayName, getSupportedListViews} from "./config.js";
import {RecordPickerEntity} from "./model/record-picker.js";
import {getRecordComponent} from "./root.jsx";

const LOADING_STATUS = {
    LOADING: 0,
    LOADED: 1,
    ERROR: 2,
};

export default class RecordPicker extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(RecordPickerEntity).isRequired,
        onSelectRecord: React.PropTypes.func.isRequired,
        onDismiss: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        const recordTypes = props.entity.getSupportedRecordTypes();
        this.state = {
            recordTypes,
            selectedRecordType: recordTypes[0],
            listViews: [],
            selectedListViewKey: null,
            listViewsLoadingStatus: LOADING_STATUS.LOADING,
            listViewsLoadingError: null,
            sobjects: [],
            sobjectsLoadingStatus: LOADING_STATUS.LOADING,
            sobjectsLoadingError: null,
            query: "",
            selectedObjectId: null,
        };
    }

    componentDidMount() {
        if (this.props.entity.getClient().isLoggedIn() &&
            this.props.entity.getClient().onSourceInstance()) {
            this.fetchData_();
        }
    }

    componentWillUnmount() {
        this.requestToken_ = undefined;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.selectedRecordType !== prevState.selectedRecordType) {
            this.fetchListViews_();
            return;
        }

        if (this.state.listViews !== prevState.listViews ||
            this.state.selectedListViewKey !== prevState.selectedListViewKey) {
            this.setState(
                {
                    query: "",
                },
                this.fetchRecordData_);
            return;
        }
    }

    fetchData_() {
        // TODO: Remove this up-front fetch of all object list views.
        this.setState({
            listViewsLoadingStatus: LOADING_STATUS.LOADING,
        });
        this.props.entity
            .fetchData()
            .then(() => {
                this.setState(
                    {
                        listViewsLoadingStatus: LOADING_STATUS.LOADED,
                    },
                    this.fetchListViews_);
            })
            .catch(err => {
                console.error(err);
                // TODO: Remove circular dependency.
                getRecordComponent().errorHandling(err);
                this.setState({
                    listViewsLoadingStatus: LOADING_STATUS.ERROR,
                    listViewsLoadingError: err,
                });
            });
    }

    fetchListViews_() {
        // TODO: Make this dynamic.
        if (!this.state.selectedRecordType ||
            this.state.listViewsLoadingStatus !== LOADING_STATUS.LOADED) {
            return;
        }

        const listViews = this.props.entity.getListViewsForType(
            this.state.selectedRecordType);

        this.setState({
            listViews,
            selectedListViewKey: listViews[0].key,
        });
    }

    fetchRecordData_() {
        this.setState({sobjectsLoadingStatus: LOADING_STATUS.LOADING});

        // Sentinel value used so we only respond to latest search.
        const requestToken = {};
        this.requestToken_ = requestToken;

        this.props.entity
            .fetchRecordDataForListView(
                this.state.selectedRecordType,
                this.state.selectedListViewKey,
                this.state.query)
            .then(records => {
                if (requestToken !== this.requestToken_) {
                    return;
                }
                this.setState({
                    sobjects: records,
                    sobjectsLoadingStatus: LOADING_STATUS.LOADED,
                });
            })
            .catch(error => {
                console.error(error);
                if (requestToken !== this.requestToken_) {
                    return;
                }
                this.setState({
                    sobjectsLoadingStatus: LOADING_STATUS.ERROR,
                    sobjectsLoadingError: error,
                });
            });
    }

    setQuery_ = query => {
        if (this.timeoutId_) {
            window.clearTimeout(this.timeoutId_);
        }

        this.timeoutId_ = window.setTimeout(() => {
            this.fetchRecordData_();
            this.timeoutId_ = undefined;
        }, 500);

        this.setState({
            query,
        });
    };

    selectRecordType_ = (e, newlySelectedRecordType) => {
        this.setState({
            selectedRecordType: newlySelectedRecordType,
        });
    };

    selectListView_ = (e, newlySelectedListView) => {
        this.setState({
            selectedListViewKey: newlySelectedListView.key,
        });
    };

    selectRecordId_ = (e, newlySelectedRecord) => {
        if (newlySelectedRecord &&
            newlySelectedRecord.id != this.state.selectedObjectId) {
            this.setState({
                selectedObjectId: newlySelectedRecord.id,
            });
        }
    };

    selectRecord_ = e => {
        if (this.state.selectedObjectId === null) {
            return;
        }

        this.props.onSelectRecord(this.state.selectedObjectId);
    };

    render() {
        const {
            recordTypes,
            selectedRecordType,
            listViews,
            selectedListViewKey,
            listViewsLoadingStatus,
            listViewsLoadingError,
            query,
            sobjects,
            sobjectsLoadingStatus,
            sobjectsLoadingError,
            selectedObjectId,
        } = this.state;

        const {onDismiss, entity} = this.props;
        let recordFilterPlaceholder = quiptext("Search");
        listViews.forEach(listView => {
            if (listView.key === selectedListViewKey) {
                recordFilterPlaceholder += " " + listView.label;
            }
        });

        return <Dialog onDismiss={onDismiss}>
            <div className={Styles.dialog}>
                <div className={Styles.header}>
                    {quiptext("Select Salesforce Record")}
                </div>
                <div className={Styles.picker}>
                    <RecordTypePicker
                        selectedType={selectedRecordType}
                        types={recordTypes}
                        onClick={this.selectRecordType_}/>
                    <div className={Styles.columnGroup}>
                        <ListViewPicker
                            listViews={listViews}
                            listViewsLoadingStatus={listViewsLoadingStatus}
                            listViewsLoadingError={listViewsLoadingError}
                            selectedListViewKey={selectedListViewKey}
                            onClick={this.selectListView_}/>
                        {listViewsLoadingStatus ===
                            LOADING_STATUS.LOADED && <RecordFilter
                            query={query}
                            sobjects={sobjects}
                            sobjectsLoadingStatus={sobjectsLoadingStatus}
                            sobjectsLoadingError={sobjectsLoadingError}
                            entity={entity}
                            selectedRecordType={selectedRecordType}
                            selectedListViewKey={selectedListViewKey}
                            searchPlaceholder={recordFilterPlaceholder}
                            selectedObjectId={selectedObjectId}
                            onClick={this.selectRecordId_}
                            onSubmit={this.selectRecord_}
                            onUpdateQuery={this.setQuery_}/>}
                    </div>
                </div>
                <div className={Styles.actions}>
                    <quip.apps.ui.Button
                        text={quiptext("Cancel")}
                        onClick={onDismiss}/>
                    <quip.apps.ui.Button
                        primary={true}
                        disabled={selectedObjectId === null}
                        text={quiptext("Select Record")}
                        onClick={this.selectRecord_}/>
                </div>
            </div>
        </Dialog>;
    }
}

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
        listViewsLoadingError: React.PropTypes.instanceOf(Error),
        selectedListViewKey: React.PropTypes.string,
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
        const {listViewsLoadingStatus, listViewsLoadingError} = this.props;
        if (listViewsLoadingStatus === LOADING_STATUS.LOADING) {
            return <quip.apps.ui.Image.Placeholder size={25} loading={true}/>;
        }
        if (listViewsLoadingStatus === LOADING_STATUS.ERROR) {
            const shouldShowSpecificErrorMessage = isNonDefaultError(
                listViewsLoadingError);
            return <div className={Styles.errorLoading}>
                {shouldShowSpecificErrorMessage
                    ? listViewsLoadingError.message
                    : quiptext("Could Not Connect")}
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
        query: React.PropTypes.string.isRequired,
        sobjects: React.PropTypes.isRequired, // TODO:
        sobjectsLoadingStatus: React.PropTypes.number.isRequired,
        sobjectsLoadingError: React.PropTypes.string.isRequired,
        entity: React.PropTypes.instanceOf(RecordPickerEntity).isRequired,
        selectedRecordType: React.PropTypes.string.isRequired,
        selectedListViewKey: React.PropTypes.string,
        selectedObjectId: React.PropTypes.string,
        onClick: React.PropTypes.func.isRequired,
        searchPlaceholder: React.PropTypes.string,
        onSubmit: React.PropTypes.func,
        onUpdateQuery: React.PropTypes.func,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.focusInput_();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedRecordType !== this.props.selectedRecordType ||
            nextProps.selectedListViewKey !== this.props.selectedListViewKey) {
            this.focusInput_();
        }
    }

    focusInput_ = () => {
        if (this.searchInput_) {
            this.searchInput_.focus();
        }
    };

    renderRow_ = (recordData, isHighlighted, index) => {
        const classNames = [Styles.recordRow];
        if (this.props.selectedObjectId === recordData.id) {
            classNames.push(Styles.highlighted);
        }

        return <div className={classNames.join(" ")}>{recordData.name}</div>;
    };

    render() {
        const {
            query,
            sobjects,
            sobjectsLoadingStatus,
            sobjectsLoadingError,
            searchPlaceholder,
            onClick,
            onSubmit,
            onUpdateQuery,
        } = this.props;

        let recordsContent;
        const hasError = sobjectsLoadingStatus === LOADING_STATUS.ERROR;
        if (sobjectsLoadingStatus === LOADING_STATUS.LOADING) {
            recordsContent = <quip.apps.ui.Image.Placeholder
                size={25}
                loading={true}/>;
        } else if (hasError) {
            const shouldShowSpecificErrorMessage = isNonDefaultError(
                sobjectsLoadingError);
            recordsContent = <div className={Styles.errorLoading}>
                {shouldShowSpecificErrorMessage
                    ? sobjectsLoadingError.message
                    : quiptext("Could Not Connect")}
            </div>;
        } else {
            if (sobjects.length == 0) {
                recordsContent = <div className={Styles.noResult}>
                    {quiptext("No Results")}
                </div>;
            } else {
                recordsContent = <RowContainer
                    rows={sobjects}
                    renderRow={this.renderRow_}
                    containerClassName={Styles.scrollableList}
                    isActive={true}
                    onSubmitSelectedRow={onSubmit}
                    onSelectionChange={onClick}/>;
            }
        }
        return <div className={Styles.recordFilter}>
            <div className={Styles.searchInput}>
                <input
                    className={Styles.searchInputControl}
                    value={query}
                    onChange={e => onUpdateQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    ref={node => (this.searchInput_ = node)}
                    disabled={hasError}/>
            </div>
            {recordsContent}
        </div>;
    }
}
