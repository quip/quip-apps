// Copyright 2017 Quip

import BaseMenu from "../../shared/base-field-builder/base-menu.js";
import Card from "../table-view/Card.less";
import Checkbox from "../../shared/base-field-builder/icons/checkbox.jsx";
import Chevron from "../../shared/base-field-builder/icons/draft-chevron.jsx";
import ColumnPicker from "./column-picker.jsx";
import cx from "classnames";
import Dialog from "../dialog/dialog.jsx";
import ErrorPopover from "./error-popover.jsx";
import Field from "./field.less";
import LockIcon from "../../shared/base-field-builder/icons/lock.jsx";
import Modal from "../table-view/lib/components/Modal";
import RowContainer from "../../shared/base-field-builder/row-container.jsx";
import Styles from "./record-list.less";
import WarningIcon from "./icons/warning.jsx";

import {
    BadRequestError,
    InvalidValueError,
    UnauthenticatedError,
} from "./error.js";

import {COLUMN_TYPE, toJSON} from "../table-view/model.js";
import {CommentToggle} from "../table-view/lib/comment-component.jsx";
import {DateField, EnumField, TokenField} from "./field.jsx";
import {DateFieldEntity} from "./model/field.js";
import {RecordEntity} from "./model/record.js";
import {Y_BORDER} from "../table-view/card.jsx";

import {
    getHeights,
    getWidths,
    ROW_START_HEIGHT,
    ROW_PADDING,
} from "../table-view/utils.js";
import {
    HEADER_HEIGHT,
    sumHeights,
    TableView,
} from "../../shared/table-view/table-view.jsx";

const LOADING_STATUS = {
    LOADING: 0,
    LOADED: 1,
    ERROR: 2,
    UNLOADED: 3,
};

const CELL_OPTIONS_SPACING = 45;
const DRAFT_HEIGHT = 20;
const LINE_HEIGHT = 17;

export default class RecordList extends React.Component {
    static propTypes = {
        isLoggedIn: React.PropTypes.bool.isRequired,
        columns: React.PropTypes.instanceOf(quip.apps.RecordList).isRequired,
        entities: React.PropTypes.arrayOf(
            React.PropTypes.instanceOf(RecordEntity)).isRequired,
        loadingWidth: React.PropTypes.number.isRequired,
        menuDelegate: React.PropTypes.instanceOf(BaseMenu).isRequired,
        title: React.PropTypes.string.isRequired,
        widths: React.PropTypes.object.isRequired,
        onContextMenu: React.PropTypes.func,
        metricType: React.PropTypes.string,
        bottomSpacing: React.PropTypes.number,
        tableLoading: React.PropTypes.bool,
    };

    constructor(props) {
        super(props);
        const heights = getHeights({
            columns: props.columns,
            rows: props.entities,
        });
        this.state = {
            loadingStatus: LOADING_STATUS.UNLOADED,
            query: "",
            showFieldPicker: false,
            widths: getWidths(
                props,
                props.widths,
                this.getDefaultWidth_,
                this.getMinWidth_),
            heights: heights,
            errorBorderHeight: sumHeights(heights) - props.entities.length,
        };
    }

    getDefaultWidth_ = record => {
        if (record.getName() === "summary") {
            return 400;
        } else if (record.getName() === "issuetype") {
            return 120;
        } else if (record.getName() === "key" ||
            record.getName() === "priority") {
            return 140;
        } else if (record.getName() === "status") {
            return 160;
        } else if (record.getName() === "fixVersions") {
            return 200;
        } else {
            return 158;
        }
    };

    getMinWidth_ = (id, type) => {
        if (quip.apps.getRecordById(id).getName() === "fixVersions") {
            return 200;
        }
        return 120;
    };

    componentDidMount() {
        this.mounted = true;
        document.addEventListener("mousedown", this.handleClick_);
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.handleBlur_);

        this.onEntitiesChanged_(this.props.entities);
    }

    handleClick_ = e => {
        const recordsErrorStatus = JSON.parse(this.state.recordsErrorStatus);
        this.props.entities.map(entity => {
            recordsErrorStatus[entity.getRecordId()].showErrorPopover = false;
        });
        const contains =
            this.fieldDialog_ && this.fieldDialog_.contains(e.target);
        this.setState({
            showFieldPicker:
                this.fieldPicker_ && this.fieldPicker_.contains(e.target),
            showGlobalErrorPopover: false,
            recordsErrorStatus: JSON.stringify(recordsErrorStatus),
            fieldDialog: contains ? this.state.fieldDialog : null,
        });
    };

    handleBlur_ = () => {
        const recordsErrorStatus = JSON.parse(this.state.recordsErrorStatus);
        this.props.entities.map(entity => {
            recordsErrorStatus[entity.getRecordId()].showErrorPopover = false;
        });
        this.setState({
            showFieldPicker: false,
            showGlobalErrorPopover: false,
            recordsErrorStatus: JSON.stringify(recordsErrorStatus),
            fieldDialog: null,
        });
    };

    onEntitiesChanged_(entities) {
        if (this.mounted) {
            const recordsErrorStatus = {};
            entities.map(entity => {
                recordsErrorStatus[entity.getRecordId()] = {
                    errorMessage: null,
                    showErrorPopover: false,
                };
            });

            this.setState({
                loadingStatus: this.hasLoaded_(entities)
                    ? LOADING_STATUS.LOADED
                    : LOADING_STATUS.LOADING,
                recordsErrorStatus: JSON.stringify(recordsErrorStatus),
                globalErrorMessage: null,
                showGlobalErrorPopover: false,
            });

            const fetchers = [];
            for (let entity of entities) {
                const fetcher = entity.fetchData();
                fetchers.push(fetcher);
            }
            const rootRecord = quip.apps.getRootRecord();
            rootRecord.setFetching(true);

            Promise.all(fetchers)
                .then(response => {
                    rootRecord.setFetching(false);
                    this.onEntityLoaded_();
                })
                .catch(error => {
                    rootRecord.setFetching(false);
                    if (!this.hasLoaded_(entities)) {
                        this.setState({
                            loadingStatus: LOADING_STATUS.ERROR,
                        });
                    } else {
                        // Show users the stale data.
                        this.onEntityLoaded_();
                    }
                    if (!(error instanceof UnauthenticatedError)) {
                        setTimeout(() => {
                            // Rethrow to log an exception.
                            throw error;
                        });
                    }
                });
        }
    }

    componentWillReceiveProps(nextProps) {
        const columnCount = Object.keys(this.state.widths).length;
        const nextColumnCount = nextProps.columns.count();
        const rowCount = Object.keys(this.state.heights).length;
        const nextRowCount = nextProps.entities.length;

        const newState = {};
        const inHeights = entity => entity.getId() in this.state.heights;
        if (rowCount !== nextRowCount || !nextProps.entities.every(inHeights)) {
            newState.heights = getHeights(
                {columns: nextProps.columns, rows: nextProps.entities},
                this.state.heights);
            newState.errorBorderHeight =
                sumHeights(newState.heights) - nextProps.entities.length;
        }

        let updateWidths = columnCount !== nextColumnCount;
        if (!updateWidths) {
            // Check if one of the ids were not in the widths
            updateWidths = nextProps.columns.getRecords().find(column => {
                return !(column.getId() in this.state.widths);
            });
        }
        if (updateWidths) {
            newState.widths = getWidths(
                nextProps,
                this.state.widths,
                this.getDefaultWidth_,
                this.getMinWidth_);
        }

        if (newState.heights || newState.widths) {
            this.setState(newState);
        }

        // Checks if all the entities are the same. If something has changed,
        // we need to create and fetch new data for the new ones.
        let matches = this.props.entities.length === nextProps.entities.length;
        if (matches) {
            this.props.entities.forEach(entity => {
                const id = entity.getId();
                const exists = nextProps.entities.find(
                    entity => entity.getId() === id);
                if (!exists) {
                    matches = false;
                }
            });
            this.props.entities.map(entity => {
                if (entity.getError() && entity.getShowError()) {
                    const modifiedField = entity
                        .getFields()
                        .find(field => field.isModifiedAfterSaving());
                    if (modifiedField) {
                        this.clearRecordError_(entity);
                    }
                }
            });
        } else {
            const oldIds = this.props.entities.map(entity => entity.getId());
            const newIds = nextProps.entities.map(entity => entity.getId());
            // If all new ids exist in old ids, we don't need to refresh, it's
            // likely a delete.
            matches = !newIds.find(newId => oldIds.indexOf(newId) === -1);
        }

        if (!matches) {
            this.onEntitiesChanged_(nextProps.entities);
        }
    }

    clearRecordError_ = entity => {
        entity.clearError();
        entity.clearSavedValueForFields();
        const recordsErrorStatus = JSON.parse(this.state.recordsErrorStatus);
        recordsErrorStatus[entity.getRecordId()].errorMessage = null;
        recordsErrorStatus[entity.getRecordId()].showErrorPopover = false;
        this.setState({
            recordsErrorStatus: JSON.stringify(recordsErrorStatus),
        });
    };

    componentDidUpdate(prevProps, prevState) {
        let isDirty = false;
        let lastFetchedTime = 0;
        this.props.entities.forEach(entity => {
            if (!isDirty && entity.isDirty()) {
                isDirty = true;
            }
            if (lastFetchedTime < entity.getLastFetchedTime()) {
                lastFetchedTime = entity.getLastFetchedTime();
            }
        });
        if (this.state.loadingStatus == LOADING_STATUS.LOADED &&
            (isDirty !== this.isDirty_ ||
                lastFetchedTime !== this.lastFetchedTime_)) {
            this.isDirty_ = isDirty;
            this.lastFetchedTime_ = lastFetchedTime;
            this.props.menuDelegate.updateToolbar(this.props.entities[0]);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        document.removeEventListener("mousedown", this.handleClick_);
        quip.apps.removeEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.handleBlur_);
    }

    recordErrorHandling = (entity, error) => {
        const recordsErrorStatus = JSON.parse(this.state.recordsErrorStatus);
        const status = recordsErrorStatus[entity.getRecordId()];
        if (status) {
            status.errorMessage = error && error.toString();
            this.setState({
                recordsErrorStatus: JSON.stringify(recordsErrorStatus),
            });
        }
    };

    clearGlobalError = () => {
        this.setState({
            globalErrorMessage: null,
        });
    };

    clearAllRecordErrors = () => {
        const recordsErrorStatus = {};
        this.props.entities.map(entity => {
            entity.clearError();
            recordsErrorStatus[entity.getRecordId()] = {
                errorMessage: null,
                showErrorPopover: false,
            };
        });
        this.setState({
            recordsErrorStatus: JSON.stringify(recordsErrorStatus),
        });
    };

    globalErrorHandling = () => {
        const records = this.props.entities;
        let showGlobalError = false;
        if (records.length > 1 && records[0].getError()) {
            let countErrorOfSameType = 0;
            for (let i = 1; i < records.length; i++) {
                if (records[i].getError()) {
                    if (records[0].getError().toString() ==
                        records[i].getError().toString()) {
                        countErrorOfSameType++;
                    } else {
                        break;
                    }
                }
            }
            // If all records have the same error messages, show it as global
            // error and suppress record error, unless it is invalid value
            // error.
            if (countErrorOfSameType == records.length - 1 &&
                !(records[0].getError() instanceof InvalidValueError)) {
                for (let i = 0; i < records.length; i++) {
                    records[i].setShowError(false);
                }
                this.setState({
                    globalErrorMessage: records[0].getError().toString(),
                    showGlobalErrorPopover: true,
                });
                showGlobalError = true;
                setTimeout(() => {
                    this.setState({showGlobalErrorPopover: false});
                }, 10000);
            }
        }

        if (!showGlobalError) {
            let firstRecordIdWithError;
            for (let i = 0; i < records.length; i++) {
                if (records[i].getError()) {
                    records[i].setShowError(true);
                    if (!firstRecordIdWithError) {
                        firstRecordIdWithError = records[i].getRecordId();
                    }
                }
            }
            if (firstRecordIdWithError) {
                const recordsErrorStatus = JSON.parse(
                    this.state.recordsErrorStatus);
                recordsErrorStatus[
                    firstRecordIdWithError
                ].showErrorPopover = true;
                this.setState({
                    recordsErrorStatus: JSON.stringify(recordsErrorStatus),
                });

                setTimeout(() => {
                    const recordsErrorStatus = JSON.parse(
                        this.state.recordsErrorStatus);
                    recordsErrorStatus[
                        firstRecordIdWithError
                    ].showErrorPopover = false;
                    this.setState({
                        recordsErrorStatus: JSON.stringify(recordsErrorStatus),
                    });
                }, 10000);
            }
        }
    };

    onEntityLoaded_ = () => {
        if (this.state.loadingStatus != LOADING_STATUS.LOADED) {
            this.props.menuDelegate.updateToolbar(this.props.entities[0]);

            const keyColumn = this.props.columns.getRecords()[0];
            if (!quip.apps.getRootRecord().isPlaceholder() &&
                quip.apps.getRootRecord().isOwner() &&
                this.props.entities.length > 0) {
                this.props.entities.forEach(entity => {
                    let fieldKeys = entity
                        .getFields()
                        .map(field => field.getKey());
                    this.props.columns.getRecords().forEach(column => {
                        if (column.getName() !== "key") {
                            entity.addField(column.getName());
                            const index = fieldKeys.indexOf(column.getName());
                            if (index > -1) {
                                fieldKeys.splice(index, 1);
                            }
                        }
                    });
                    fieldKeys.forEach(fieldKey => {
                        const field = entity.getField(fieldKey);
                        if (field) {
                            field.remove();
                        }
                    });
                });
            }
            this.setState({
                loadingStatus: LOADING_STATUS.LOADED,
            });
        }
    };

    hideFieldPicker = () => {
        this.setState({
            showFieldPicker: false,
        });
    };

    showFieldPicker = () => {
        this.setState({showFieldPicker: true});
    };

    addField_ = (e, field) => {
        for (let entity of this.props.entities) {
            entity.addField(field.key);
        }

        const column = this.props.columns.add({
            name: field.key,
            type: COLUMN_TYPE.CUSTOM,
            contents: {
                RichText_defaultText: field.shortLabel || field.label,
            },
            titleEditable: false,
        });
        this.setState({showFieldPicker: false});
    };

    hasLoaded_(entities) {
        return !entities.find(entity => !entity.hasLoaded());
    }

    onColumnDrop_ = (id, index) => {
        this.props.columns.move(quip.apps.getRecordById(id), index);
    };

    onRowDrop_ = (id, index) => {
        const row = quip.apps.getRecordById(id);
        row.getContainingList().move(row, index);
    };

    onRowDelete_ = id => {
        const rowRecord = quip.apps.getRecordById(id);
        rowRecord.delete();
    };

    onColumnDelete_ = id => {
        const columnRecord = quip.apps.getRecordById(id);
        const name = columnRecord.getName();
        columnRecord.delete();
        this.props.entities.forEach(entity => {
            entity.getField(name).remove();
        });
    };

    setWidths_ = newWidths => {
        this.setState(
            ({widths}) => ({
                widths: Object.assign(widths, newWidths),
            }),
            this.saveWidths_);
    };

    onResizeEnd_ = () => {
        this.saveWidths_();
    };

    saveWidths_ = () => {
        if (this.timeout_) {
            // Clear existing timeout.
            clearTimeout(this.timeout_);
            this.timeout_ = null;
        }
        this.timeout_ = setTimeout(() => {
            this.timeout_ = null;
            const record = this.props.columns.getRecords()[0].getParentRecord();
            record.set("widths", this.state.widths);
        }, 2000);
    };

    onDraftClick_ = (draftBadge, field, e) => {
        if (field.isDirty()) {
            this.props.menuDelegate.showDraftContextMenu(e, draftBadge, field);
        }
    };

    onColumnsEdited_ = (success, selectedFields) => {
        this.hideFieldPicker();
        if (success) {
            this.props.entities[0].getFields().forEach(field => {
                if (!selectedFields.find(
                        selectedField =>
                            selectedField.key === field.getKey())) {
                    const columnRecord = this.props.columns
                        .getRecords()
                        .find(column => column.getName() === field.getKey());
                    this.onColumnDelete_(columnRecord.getId());
                }
            });
            selectedFields.forEach(selectedField => {
                if (!this.props.entities[0].getField(selectedField.key)) {
                    this.addField_(null, selectedField);
                }
            });
        }
    };

    renderCell_ = (
        cell,
        row,
        cardHovered,
        isFirstColumn,
        width,
        rowHeight,
        rootHeight,
        setRowHeight,
        cardFocused,
        onCardFocused,
        onCardBlurred) => {
        if (this.state.loadingStatus !== LOADING_STATUS.LOADED) {
            // Displays an empty cell as contents are loading.
            return <div>{isFirstColumn && "Loading…"}</div>;
        }

        const showComments = quip.apps.isMobile() || cardHovered || cardFocused;
        const entity = quip.apps.getRecordById(cell.id);
        let draft;
        let draftBadge;
        const displayStyleFn = showCommentIcon => {
            return {"display": showCommentIcon ? "block" : "none"};
        };
        const commentsTrigger = <CommentToggle
            record={entity}
            showComments={showComments}
            rowHeight={rowHeight}
            isFirstColumn={isFirstColumn}
            displayStyleFn={displayStyleFn}/>;

        if (cell.contents.key !== "key" && entity.isDirty()) {
            const draftStyle = {
                alignSelf: "flex-start",
                position: "relative",
                top: (rowHeight - Y_BORDER * 2 - DRAFT_HEIGHT) / 2,
            };
            draft = <div
                ref={node => {
                    draftBadge = node;
                }}
                style={cardFocused ? draftStyle : undefined}
                className={Styles.draftIndicator}
                onClick={e => {
                    e.stopPropagation();
                    this.onDraftClick_(draftBadge, entity, e);
                }}>
                <span className={Styles.draftText}>Draft</span>
                <Chevron/>
            </div>;
        }

        let component;

        let lockIcon = <div
            title={quiptext("This field is read-only.")}
            className={Field.lockIcon}>
            <LockIcon/>
        </div>;

        const fixedWidth = width - CELL_OPTIONS_SPACING;
        if (cell.contents.key === "key") {
            let errorIndicator;
            let errorPopover;
            if (entity.getError() && entity.getShowError()) {
                const recordsErrorStatus = JSON.parse(
                    this.state.recordsErrorStatus);
                const currStatus =
                    recordsErrorStatus[entity.getRecordId()].showErrorPopover;
                if (currStatus) {
                    const marginTop =
                        entity.domNode.getBoundingClientRect().height + 10;
                    const modalStyle = {
                        content: {
                            border: "0px",
                            borderStyle: "none",
                            borderImageSource: "none",
                        },
                        overlay: {
                            marginLeft: "-10px",
                            marginTop: marginTop + "px",
                        },
                        wrapper: {margin: "0px"},
                    };
                    errorPopover = <Modal
                        onRequestClose={() => {}}
                        rootHeight={0}
                        style={modalStyle}
                        wrapperRef={entity.domNode}>
                        <ErrorPopover
                            errorMessage={entity.getError().toString()}
                            containerClassName={Styles.recordError}/>
                    </Modal>;
                }
                const onMouseEnter = () => {
                    const recordsErrorStatus = JSON.parse(
                        this.state.recordsErrorStatus);
                    recordsErrorStatus[
                        entity.getRecordId()
                    ].showErrorPopover = true;
                    this.setState({
                        recordsErrorStatus: JSON.stringify(recordsErrorStatus),
                    });
                };
                const onMouseLeave = () => {
                    const recordsErrorStatus = JSON.parse(
                        this.state.recordsErrorStatus);
                    recordsErrorStatus[
                        entity.getRecordId()
                    ].showErrorPopover = false;
                    this.setState({
                        recordsErrorStatus: JSON.stringify(recordsErrorStatus),
                    });
                };
                errorIndicator = <div
                    className={Styles.warningInCell}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}>
                    <WarningIcon/>
                </div>;
            }
            const classNames = [Styles.keyCellName];
            if (!entity.isPlaceholder()) {
                classNames.push(Styles.hoverableLink);
            }
            component = <div
                className={Styles.keyCell}
                ref={node => (entity.domNode = ReactDOM.findDOMNode(node))}>
                <div
                    className={classNames.join(" ")}
                    onClick={() => entity.openLink()}>
                    {entity.getHeaderName()}
                </div>
                {commentsTrigger}
                {errorIndicator}
                {errorPopover}
            </div>;
        } else if (entity.getType() === "Date" ||
            entity.getType() === "String" ||
            entity.getType() === "Url") {
            const classNames = [Styles.recordListCell];
            if (entity.isReadOnly()) {
                classNames.push(Field.readOnly);
            }
            component = <div className={classNames.join(" ")}>
                <div
                    className={Styles.recordListCellOptions}
                    style={{width: width}}>
                    {commentsTrigger}
                    {lockIcon}
                    {draft}
                </div>
                {entity instanceof DateFieldEntity ? (
                    <DateField entity={entity} width={fixedWidth}/>
                ) : (
                    <quip.apps.ui.RichTextBox
                        minHeight={LINE_HEIGHT}
                        maxHeight={cardFocused ? undefined : LINE_HEIGHT * 2}
                        onFocus={onCardFocused}
                        onBlur={onCardBlurred}
                        readOnly={entity.isReadOnly()}
                        ref={node =>
                            (entity.domNode = ReactDOM.findDOMNode(node))
                        }
                        record={entity.get("value")}
                        scrollable={false}
                        width={fixedWidth}/>
                )}
            </div>;
        } else if (entity.getType() === "Picklist" ||
            entity.getType() === "Token") {
            const classNames = [
                Styles.recordListCell,
                cardFocused ? Field.cardFocused : Field.cardBlurred,
            ];
            if (entity.isReadOnly()) {
                classNames.push(Field.readOnly);
            }
            component = <div
                className={classNames.join(" ")}
                onClick={() =>
                    entity.getType() === "Token" && entity.domNode.click()
                }>
                <div className={Styles.recordListCellOptions} style={{width}}>
                    {commentsTrigger}
                    {lockIcon}
                    {draft}
                </div>
                {entity.getType() === "Picklist" && <EnumField
                    createDialog={fieldDialog => this.setState({fieldDialog})}
                    entity={entity}
                    onChangeFocus={result => onCardFocused(result)}
                    width={fixedWidth}
                    ref={node =>
                        (entity.domNode = ReactDOM.findDOMNode(node))
                    }/>}
                {entity.getType() === "Token" && <TokenField
                    createDialog={fieldDialog => this.setState({fieldDialog})}
                    dialog={this.state.fieldDialog}
                    entity={entity}
                    focused={cardFocused}
                    onChangeFocus={result => onCardFocused(result)}
                    width={fixedWidth}
                    ref={node => {
                        entity.domNode = ReactDOM.findDOMNode(node);
                    }}/>}
            </div>;
        } else {
            component = <div>Unsupported type</div>;
        }
        return component;
    };

    onMouseEnterGlobalError_ = () => {
        this.setState({
            showGlobalErrorPopover: true,
        });
    };

    onMouseLeaveGlobalError_ = () => {
        this.setState({
            showGlobalErrorPopover: false,
        });
    };

    render() {
        if ((this.state.loadingStatus == LOADING_STATUS.LOADING ||
                this.state.loadingStatus == LOADING_STATUS.UNLOADED) &&
            !this.props.tableLoading) {
            if (this.props.entities.length > 8) {
                return <div
                    style={{
                        textAlign: "center",
                        width: this.props.loadingWidth,
                    }}>
                    {quiptext("Loading…")}
                </div>;
            } else {
                return <div style={{width: this.props.loadingWidth}}>
                    <quip.apps.ui.Spinner
                        key={"record-list-spinner"}
                        size={25}
                        loading={true}/>
                </div>;
            }
        }

        let fieldPicker;
        if (this.state.showFieldPicker) {
            fieldPicker = <Dialog
                ref={node => (this.fieldPicker_ = ReactDOM.findDOMNode(node))}>
                <ColumnPicker
                    initialColumns={this.props.entities[0]
                        .supportedFieldsDataArray()
                        .sort((a, b) => a.label.localeCompare(b.label))}
                    onComplete={this.onColumnsEdited_}
                    selectedColumns={this.props.entities[0]
                        .supportedFieldsDataArray()
                        .filter(field =>
                            this.props.entities[0].getField(field.key)
                        )}/>
            </Dialog>;
        }

        let dialog;
        if (this.state.fieldDialog) {
            const rect = this.rootNode_.getBoundingClientRect();
            dialog = <Dialog
                ref={node => (this.fieldDialog_ = ReactDOM.findDOMNode(node))}
                showBackdrop={false}
                onDismiss={this.state.fieldDialog.onDismiss}
                left={this.state.fieldDialog.left - rect.left}
                top={this.state.fieldDialog.top - rect.top}>
                {this.state.fieldDialog.node}
            </Dialog>;
        }

        let {widths, heights} = this.state;
        const col = toJSON(this.props.columns);
        const row = this.serializeEntitiesToRow(this.props.entities);

        let errorBorder;
        let errorIndicator;
        let errorPopover;
        if (this.state.globalErrorMessage) {
            if (this.state.showGlobalErrorPopover) {
                const marginTop = 25;
                const modalStyle = {
                    content: {
                        border: "0px",
                        borderStyle: "none",
                        borderImageSource: "none",
                    },
                    overlay: {
                        marginLeft: "20px",
                        marginTop: marginTop + "px",
                    },
                    wrapper: {margin: "0px"},
                };
                errorPopover = <Modal
                    onRequestClose={() => {}}
                    rootHeight={0}
                    style={modalStyle}
                    wrapperRef={this.rootNode_}>
                    <ErrorPopover
                        errorMessage={this.state.globalErrorMessage}
                        containerClassName={Styles.globalError}/>
                </Modal>;
            }

            errorIndicator = <div
                className={Styles.warningGlobal}
                onMouseEnter={this.onMouseEnterGlobalError_}
                onMouseLeave={this.onMouseLeaveGlobalError_}>
                <WarningIcon/>
                {errorPopover}
            </div>;

            errorBorder = <div
                className={Styles.errorBorder}
                style={{
                    top: HEADER_HEIGHT - 1,
                    height: this.state.errorBorderHeight + 1,
                    width: "100%",
                }}/>;
        }

        let messageDiv;
        if (this.state.loadingStatus == LOADING_STATUS.ERROR) {
            messageDiv = <div className={Styles.noConnect}>
                <div className={Styles.errorText}>
                    <WarningIcon/>
                    <div>Could Not Connect</div>
                </div>
                <div
                    className={Styles.retry}
                    onClick={() =>
                        this.onEntitiesChanged_(this.props.entities)
                    }>
                    Retry
                </div>
            </div>;
            // Reset row and heights to zero so that incomplete data is not
            // rendered. We will display a full element error.
            row.data = [];
            heights = {};
        } else if (row.data.length == 0) {
            messageDiv = <div className={Styles.empty}>
                No Items To Display
            </div>;
        }

        return <div ref={node => (this.rootNode_ = node)}>
            {fieldPicker}
            {dialog}
            <TableView
                columns={col}
                customRenderer={this.renderCell_}
                heights={heights}
                onColumnDelete={this.onColumnDelete_}
                onColumnDrop={this.onColumnDrop_}
                onContextMenu={this.props.onContextMenu}
                onRowDrop={this.onRowDrop_}
                onRowDelete={this.onRowDelete_}
                onResizeEnd={this.onResizeEnd_}
                rows={row}
                setWidths={this.setWidths_}
                getMinWidth={this.getMinWidth_}
                widths={widths}
                globalError={errorIndicator}
                errorStatus={this.state.recordsErrorStatus}
                metricType={this.props.metricType}
                bottomSpacing={this.props.bottomSpacing}/>
            {messageDiv}
            {errorBorder}
        </div>;
    }

    serializeEntitiesToRow(entities) {
        // Turns records into a format table-view can understand.
        return {
            id: "rows",
            data: entities.map(entity => ({
                id: entity.getId(),
                custom: {
                    id: "custom",
                    data: entity
                        .getFields()
                        .map(field => {
                            const column = this.props.columns
                                .getRecords()
                                .find(
                                    column =>
                                        field.getKey() === column.getName());
                            return {
                                id: field.getId(),
                                columnId: column.getId(),
                                contents: {
                                    key: field.getKey(),
                                    value: field.getDisplayValue(),
                                    dirty: field.isDirty(),
                                    loaded: this.state.loadingStatus,
                                },
                            };
                        })
                        .concat([
                            {
                                id: entity.getId(),
                                columnId: this.props.columns
                                    .getRecords()
                                    .find(column => "key" === column.getName())
                                    .getId(),
                                contents: {
                                    key: "key",
                                    value: entity.getHeaderName(),
                                },
                            },
                        ]),
                },
            })),
        };
    }
}
