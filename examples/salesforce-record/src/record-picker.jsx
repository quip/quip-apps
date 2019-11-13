// Copyright 2017 Quip
import BaseMenu from "../../shared/base-field-builder/base-menu.js";
import Dialog from "../../shared/dialog/dialog.jsx";
import RowContainer from "../../shared/base-field-builder/row-container.jsx";
import Styles from "./record-picker.less";
import {getErrorMessage} from "../../shared/base-field-builder/error.js";
import {RecordPickerEntity} from "./model/record-picker.js";
import {DEFAULT_SELECTED_OBJECTS} from "./config.js";

const LOADING_STATUS = {
    LOADING: 0,
    LOADED: 1,
    ERROR: 2,
};

const recordDividerSentinel = {};
const moreRecordsSentinel = {};

export default class RecordPicker extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(RecordPickerEntity).isRequired,
        menuDelegate: React.PropTypes.instanceOf(BaseMenu).isRequired,
        onSelectRecord: React.PropTypes.func.isRequired,
        onDismiss: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showAllTypes: false,
            recordTypeLoadingStatus: LOADING_STATUS.LOADING,
            recordTypeLoadingError: null,
            recordTypes: [],
            selectedRecordType: null,
            nameFields: [],
            searchField: null,
            listViews: [],
            selectedListView: null,
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
        this.fetchRecordTypes_();
    }

    componentWillUnmount() {
        this.requestToken_ = undefined;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.selectedRecordType !== prevState.selectedRecordType) {
            this.setState({searchField: null}, () => {
                this.fetchListViewsAndRecordFields_();
            });
            return;
        }

        if (this.state.listViews !== prevState.listViews ||
            this.state.selectedListView !== prevState.selectedListView ||
            this.state.searchField !== prevState.searchField) {
            this.setState(
                {
                    query: "",
                },
                this.fetchRecordData_);
            return;
        }
    }

    showAllTypes_ = () => {
        this.setState(
            {
                showAllTypes: true,
                recordTypeLoadingStatus: LOADING_STATUS.LOADING,
                listViewsLoadingStatus: LOADING_STATUS.LOADING,
                sobjectsLoadingStatus: LOADING_STATUS.LOADING,
            },
            this.fetchRecordTypes_);
    };

    fetchRecordTypes_() {
        const {showAllTypes} = this.state;
        const client = this.props.entity.getClient();
        const allObjectsP = client.fetchObjectTypes();
        let selectedObjectsP = Promise.resolve([]);
        if (!showAllTypes) {
            selectedObjectsP = client.fetchSelectedAppEntityTypes();
        }

        Promise.all([allObjectsP, selectedObjectsP])
            .then(([recordTypes, selectedObjects]) => {
                recordTypes.sort((a, b) => {
                    if (a.labelPlural < b.labelPlural) {
                        return -1;
                    }
                    if (a.labelPlural > b.labelPlural) {
                        return 1;
                    }
                    return 0;
                });

                if (!showAllTypes) {
                    if (selectedObjects.length === 0) {
                        selectedObjects = DEFAULT_SELECTED_OBJECTS;
                    }

                    const prevTypes = this.props.entity.getPreviouslySelectedObjectTypes();
                    const prevRecordTypes = recordTypes.filter(
                        object =>
                            prevTypes.includes(object.apiName) &&
                            !selectedObjects.includes(object.apiName));

                    recordTypes = recordTypes.filter(object =>
                        selectedObjects.includes(object.apiName)
                    );

                    recordTypes.push(recordDividerSentinel);
                    if (prevRecordTypes.length) {
                        recordTypes.push(...prevRecordTypes);
                        recordTypes.push(recordDividerSentinel);
                    }
                    recordTypes.push(moreRecordsSentinel);
                }

                this.setState({
                    recordTypes,
                    selectedRecordType: recordTypes[0],
                    recordTypeLoadingStatus: LOADING_STATUS.LOADED,
                });
            })
            .catch(err => {
                this.setState({
                    recordTypeLoadingStatus: LOADING_STATUS.ERROR,
                    recordTypeLoadingError: err,
                });
            });
    }

    fetchListViewsAndRecordFields_() {
        if (!this.state.selectedRecordType) {
            return;
        }

        this.setState({listViewsLoadingStatus: LOADING_STATUS.LOADING});

        const client = this.props.entity.getClient();

        Promise.all([
            client.fetchSchema(this.state.selectedRecordType.apiName),
            client.fetchListViewsForType(this.state.selectedRecordType.apiName),
        ])
            .then(([schema, listViews]) => {
                 
                const searchField = schema.nameFields.includes("Name")
                    ? schema.fields["Name"]
                    : schema.fields[schema.nameFields[0]];

                const nameFields = Object.values(schema.fields).filter(f =>
                    schema.nameFields.includes(f.apiName)
                );
                this.setState({
                    nameFields,
                    searchField,
                    listViewsLoadingStatus: LOADING_STATUS.LOADED,
                    listViews,
                    selectedListView: listViews[0],
                });
            })
            .catch(err => {
                this.setState({
                    listViewsLoadingStatus: LOADING_STATUS.ERROR,
                    listViewsLoadingError: err,
                });
            });
    }

    fetchRecordData_() {
        const {
            selectedListView,
            selectedRecordType,
            query,
            searchField,
        } = this.state;

        if (!selectedRecordType || !selectedListView || !searchField) {
            return;
        }

        this.setState({sobjectsLoadingStatus: LOADING_STATUS.LOADING});

        // Sentinel value used so we only respond to latest search.
        const requestToken = {};
        this.requestToken_ = requestToken;

        this.props.entity
            .getClient()
            .fetchRecordDataForListView(
                selectedRecordType.apiName,
                selectedListView.id,
                query,
                searchField.apiName)
            .then(records => {
                if (requestToken !== this.requestToken_) {
                    return;
                }
                this.setState({
                    sobjects: records,
                    selectedObjectId: null,
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
        if (newlySelectedRecordType === moreRecordsSentinel) {
            this.showAllTypes_();
            return;
        }

        this.setState({
            selectedRecordType: newlySelectedRecordType,
        });
    };

    selectListView_ = (e, selectedListView) => {
        this.setState({
            selectedListView,
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

        this.props.entity
            .getClient()
            .fetchSchema(this.state.selectedRecordType.apiName)
            .then(schema => {
                this.props.onSelectRecord(this.state.selectedObjectId, schema);
            });
    };

    selectSearchField = searchField => {
        this.setState({searchField});
    };

    render() {
        const {
            recordTypes,
            recordTypeLoadingStatus,
            recordTypeLoadingError,
            selectedRecordType,
            listViews,
            selectedListView,
            listViewsLoadingStatus,
            listViewsLoadingError,
            query,
            sobjects,
            sobjectsLoadingStatus,
            sobjectsLoadingError,
            selectedObjectId,
            nameFields,
            searchField,
        } = this.state;

        const {onDismiss, entity, menuDelegate} = this.props;

        return <Dialog onDismiss={onDismiss}>
            <div className={Styles.dialog}>
                <div className={Styles.header}>
                    {quiptext("Select Salesforce Record")}
                </div>
                <div className={Styles.picker}>
                    <RecordTypePicker
                        recordTypeLoadingStatus={recordTypeLoadingStatus}
                        recordTypeLoadingError={recordTypeLoadingError}
                        selectedRecordType={selectedRecordType}
                        types={recordTypes}
                        onClick={this.selectRecordType_}/>
                    <div className={Styles.columnGroup}>
                        <ListViewPicker
                            listViews={listViews}
                            listViewsLoadingStatus={listViewsLoadingStatus}
                            listViewsLoadingError={listViewsLoadingError}
                            selectedListView={selectedListView}
                            onClick={this.selectListView_}/>
                        {listViewsLoadingStatus ===
                            LOADING_STATUS.LOADED && <RecordFilter
                            query={query}
                            sobjects={sobjects}
                            sobjectsLoadingStatus={sobjectsLoadingStatus}
                            sobjectsLoadingError={sobjectsLoadingError}
                            entity={entity}
                            selectedRecordType={selectedRecordType}
                            selectedListView={selectedListView}
                            selectedObjectId={selectedObjectId}
                            onClick={this.selectRecordId_}
                            onSubmit={this.selectRecord_}
                            onUpdateQuery={this.setQuery_}
                            nameFields={nameFields}
                            searchField={searchField}
                            onSearchFieldChanged={this.selectSearchField}
                            menuDelegate={menuDelegate}/>}
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
        recordTypeLoadingStatus: React.PropTypes.number,
        recordTypeLoadingError: React.PropTypes.instanceOf(Error),
        types: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        selectedRecordType: React.PropTypes.object,
        onClick: React.PropTypes.func.isRequired,
    };

    renderRow_ = (type, isHighlighted, index) => {
        if (type === recordDividerSentinel) {
            return <div className={Styles.recordTypesHR}>
                <hr/>
            </div>;
        }
        const classNames = [Styles.recordTypeRow];
        if (type === moreRecordsSentinel) {
            return <div
                className={classNames.join(" ")}
                onClick={e => this.props.onClick(e, type)}>
                More{" "}
                <svg className={Styles.chevronIcon} viewBox="0 0 18 10">
                    <Chevron/>
                </svg>
            </div>;
        }
        if (this.props.selectedRecordType === type) {
            classNames.push(Styles.highlighted);
        }
        return <div
            className={classNames.join(" ")}
            onClick={e => this.props.onClick(e, type)}>
            {type.labelPlural}
        </div>;
    };

    render() {
        const {recordTypeLoadingStatus, recordTypeLoadingError} = this.props;

        if (recordTypeLoadingStatus === LOADING_STATUS.LOADING) {
            return <quip.apps.ui.Spinner size={25} loading={true}/>;
        } else if (recordTypeLoadingError === LOADING_STATUS.ERROR) {
            return <div className={Styles.errorLoading}>
                {getErrorMessage(listViewsLoadingError)}
            </div>;
        }
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
        selectedListView: React.PropTypes.object,
        onClick: React.PropTypes.func.isRequired,
    };

    renderRow_ = (listView, isHighlighted, index) => {
        const classNames = [Styles.listViewRow];
        if (this.props.selectedListView === listView) {
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
            return <quip.apps.ui.Spinner size={25} loading={true}/>;
        }
        if (listViewsLoadingStatus === LOADING_STATUS.ERROR) {
            return <div className={Styles.errorLoading}>
                {getErrorMessage(listViewsLoadingError)}
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
        sobjects: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        sobjectsLoadingStatus: React.PropTypes.number.isRequired,
        sobjectsLoadingError: React.PropTypes.string,
        entity: React.PropTypes.instanceOf(RecordPickerEntity).isRequired,
        selectedRecordType: React.PropTypes.object,
        selectedListView: React.PropTypes.object,
        selectedObjectId: React.PropTypes.string,
        onClick: React.PropTypes.func.isRequired,
        onSubmit: React.PropTypes.func.isRequired,
        onUpdateQuery: React.PropTypes.func.isRequired,
        searchField: React.PropTypes.object,
        nameFields: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        onSearchFieldChanged: React.PropTypes.func.isRequired,
        menuDelegate: React.PropTypes.instanceOf(BaseMenu).isRequired,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.focusInput_();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedRecordType !== this.props.selectedRecordType ||
            nextProps.selectedListView !== this.props.selectedListView) {
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

    updateSearchField_ = apiName => {
        const searchField = this.props.nameFields.find(
            f => f.apiName === apiName);
        this.props.onSearchFieldChanged(searchField);
    };

    showSearchFieldMenu_ = (e, elm) => {
        this.props.menuDelegate.showSearchFieldContextMenu(
            e,
            elm,
            this.props.nameFields,
            this.updateSearchField_);
    };

    render() {
        const {
            query,
            sobjects,
            sobjectsLoadingStatus,
            sobjectsLoadingError,
            onClick,
            onSubmit,
            onUpdateQuery,
            selectedListView,
            searchField,
        } = this.props;

        const searchable =
            selectedListView &&
            searchField &&
            (searchField.dataType === "String" ||
                searchField.dataType === "Reference");

        const searchPlaceholder = searchable
            ? `${selectedListView.label} - ${searchField.label}`
            : "";

        let recordsContent;
        const hasError = sobjectsLoadingStatus === LOADING_STATUS.ERROR;
        if (sobjectsLoadingStatus === LOADING_STATUS.LOADING) {
            recordsContent = <quip.apps.ui.Spinner size={25} loading={true}/>;
        } else if (hasError) {
            recordsContent = <div className={Styles.errorLoading}>
                {getErrorMessage(sobjectsLoadingError)}
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
                <SearchIcon/>
                <svg
                    ref={node => (this.downChevron_ = node)}
                    onClick={e =>
                        this.showSearchFieldMenu_(e, this.downChevron_)
                    }
                    className={Styles.chevronIcon}
                    viewBox="0 0 18 18">
                    <Chevron/>
                </svg>
                <input
                    className={Styles.searchInputControl}
                    value={query}
                    onChange={e => onUpdateQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    ref={node => (this.searchInput_ = node)}
                    disabled={hasError || !searchable}/>
            </div>
            {recordsContent}
        </div>;
    }
}

class SearchIcon extends React.Component {
    render() {
        return <svg className={Styles.searchIcon} viewBox="0 0 18 18">
            <path
                className={Styles.svgPath}
                d="M15.7,15.7a1.008,1.008,0,0,1-1.426,0l-3.811-3.811a6.029,6.029,0,1,1,1.426-1.426L15.7,14.273A1.008,1.008,0,0,1,15.7,15.7ZM7,3a4,4,0,1,0,4,4A4,4,0,0,0,7,3Z"/>
        </svg>;
    }
}

class Chevron extends React.Component {
    render() {
        return <path
            className={Styles.svgPath}
            d="M8.993,11.994A1,1,0,0,1,8.285,11.7L4.28,7.7A1,1,0,0,1,5.7,6.291l3.3,3.29,3.3-3.29A1,1,0,0,1,13.706,7.7L9.7,11.7A1,1,0,0,1,8.993,11.994Z"/>;
    }
}
