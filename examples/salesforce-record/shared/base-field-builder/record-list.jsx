// Copyright 2017 Quip

import BaseMenu from "../../shared/base-field-builder/base-menu.js";
import Card from "../table-view/Card.less";
import Chevron from "../../shared/base-field-builder/icons/draft-chevron.jsx";
import cx from "classnames";
import FieldPicker from "./field-picker.jsx";
import LockIcon from "../../shared/base-field-builder/icons/lock.jsx";
import Styles from "./record-list.less";
import {COLUMN_TYPE, toJSON} from "../table-view/model.js";
import {entityListener} from "./utils.jsx";
import {EnumField} from "./field.jsx";
import {RecordEntity} from "./model/record.js";
import {
    HEADER_HEIGHT,
    sumHeights,
    TableView,
} from "../../shared/table-view/table-view.jsx";
import WarningIcon from "./icons/warning.jsx";
import ErrorPopover from "./error-popover.jsx";
import {InvalidValueError, BadRequestError} from "./error.js";
import Modal from "../table-view/lib/components/Modal";

import {
    getHeights,
    getWidths,
    ROW_START_HEIGHT,
    ROW_PADDING,
} from "../table-view/utils.js";

import {
    FieldEntity,
    TextFieldEntity,
    BooleanFieldEntity,
    EnumFieldEntity,
} from "./model/field.js";

const LOADING_STATUS = {
    LOADING: 0,
    LOADED: 1,
    ERROR: 2,
    UNLOADED: 3,
};

const CELL_OPTIONS_SPACING = 45;

export default class RecordList extends React.Component {
    static propTypes = {
        isLoggedIn: React.PropTypes.bool.isRequired,
        columns: React.PropTypes.instanceOf(quip.apps.RecordList).isRequired,
        entities: React.PropTypes.arrayOf(
            React.PropTypes.instanceOf(RecordEntity)).isRequired,
        loadingWidth: React.PropTypes.number.isRequired,
        menuDelegate: React.PropTypes.instanceOf(BaseMenu).isRequired,
        rows: React.PropTypes.instanceOf(quip.apps.RecordList).isRequired,
        title: React.PropTypes.string.isRequired,
        widths: React.PropTypes.object.isRequired,
        onContextMenu: React.PropTypes.func,
    };

    constructor(props) {
        super(props);
        const recordsErrorStatus = {};
        this.props.entities.map(entity => {
            recordsErrorStatus[entity.getRecordId()] = {
                errorMessage: null,
                showErrorPopover: false,
            };
        });
        this.state = {
            loadingStatus: LOADING_STATUS.UNLOADED,
            query: "",
            showFieldPicker: false,
            widths: getWidths(props, props.widths, this.getCustomWidth_),
            heights: getHeights(props),
            recordsErrorStatus: JSON.stringify(recordsErrorStatus),
            globalErrorMessage: null,
            showGlobalErrorPopover: false,
            errorBorderHeight: 0,
        };
    }

    getCustomWidth_ = record => {
        if (record.getName() === "summary") {
            return 400;
        } else if (record.getName() === "issuetype") {
            return 120;
        } else if (record.getName() === "key" ||
            record.getName() === "priority") {
            return 140;
        } else if (record.getName() === "status") {
            return 160;
        } else {
            return 158;
        }
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
        this.setState({
            showFieldPicker:
                this.fieldPicker_ && this.fieldPicker_.contains(e.target),
            showGlobalErrorPopover: false,
            recordsErrorStatus: JSON.stringify(recordsErrorStatus),
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
        });
    };

    onEntitiesChanged_(entities) {
        if (this.mounted) {
            this.setState({
                loadingStatus: LOADING_STATUS.LOADING,
            });
            const fetchers = [];
            for (let entity of entities) {
                if (!entity.isPlaceholder()) {
                    const fetcher = entity.fetchData();
                    fetchers.push(fetcher);
                }
            }
            const rootRecord = quip.apps.getRootRecord();
            rootRecord.setFetching(true);

            Promise.all(fetchers)
                .then(response => {
                    rootRecord.setFetching(false);
                    this.onEntityLoaded_();
                    this.setState({
                        loadingStatus: LOADING_STATUS.LOADED,
                    });
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
                });
        }
    }

    componentWillReceiveProps(nextProps) {
        const columnCount = Object.keys(this.state.widths).length;
        const nextColumnCount = nextProps.columns.count();
        const rowCount = Object.keys(this.state.heights).length;
        const nextRowCount = nextProps.rows.count();

        const newState = {};
        if (rowCount !== nextRowCount) {
            newState.heights = getHeights(nextProps, this.state.heights);
        }
        if (columnCount !== nextColumnCount) {
            newState.widths = getWidths(
                nextProps,
                this.state.widths,
                this.getCustomWidth_);
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
        } else {
            // We rerender whenever an element in the parent record has changed.
            // This may change in the future. But for now we can use it to
            // update the view.
            const keyColumn = nextProps.columns.getRecords()[0];
            nextProps.rows.getRecords().forEach(row => {
                // We haven't loaded the data to generate the columns yet.
                if (!row.getCell(keyColumn)) {
                    return;
                }
                const id = row.getCell(keyColumn).get("contents").id;
                const entity = quip.apps.getRecordById(id);

                nextProps.columns.getRecords().forEach(column => {
                    const cell = row.getCell(column);
                    const oldDisplayValue = cell.get("contents").displayValue;
                    const field = entity.getField(column.getName());
                    if (field && oldDisplayValue !== field.getDisplayValue()) {
                        // The only purpose to manipulate this model is so that
                        // table view will refresh since the model has changed.
                        const contents = Object.assign(
                            {},
                            cell.get("contents"));
                        contents.displayValue = field.getDisplayValue();
                        cell.set("contents", contents);
                    }
                });
            });
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
        recordsErrorStatus[
            entity.getRecordId()
        ].errorMessage = error.toString();
        this.setState({
            recordsErrorStatus: JSON.stringify(recordsErrorStatus),
        });
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
            this.setState({
                loadingStatus: LOADING_STATUS.LOADED,
            });
            this.props.menuDelegate.updateToolbar(this.props.entities[0]);

            const keyColumn = this.props.columns.getRecords()[0];
            if (!quip.apps.getRootRecord().isPlaceholder() &&
                quip.apps.getRootRecord().isOwner() &&
                this.props.rows.count() > 0 &&
                !this.props.rows.get(0).getCell(keyColumn)) {
                let fieldKeys = [];
                if (this.props.entities[0]) {
                    fieldKeys = this.props.entities[0]
                        .getFields()
                        .map(field => field.getKey());
                }
                let index = 0;
                // Rows have not been initialized yet, we'll do it here.
                this.props.entities.forEach(entity => {
                    let row = this.props.rows.get(index);
                    ++index;
                    this.props.columns.getRecords().forEach(column => {
                        for (let entity of this.props.entities) {
                            if (column.getName() !== "key") {
                                entity.addField(column.getName());
                                const index = fieldKeys.indexOf(
                                    column.getName());
                                if (index > -1) {
                                    fieldKeys.splice(index, 1);
                                }
                            }
                        }

                        const data = {
                            contents: {
                                id: entity.getId(),
                                key: column.getName(),
                                type:
                                    column.getName() === "key"
                                        ? "String"
                                        : entity
                                              .getField(column.getName())
                                              .getType(),
                            },
                        };
                        row.addCell(column, data);
                    });

                    fieldKeys.forEach(fieldKey => {
                        entity.getField(fieldKey).remove();
                    });
                });
                this.forceUpdate();
            }
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
                RichText_defaultText: field.label,
            },
            titleEditable: false,
        });
        // This column should always exist.
        const keyColumn = this.props.columns.getRecords()[0];
        this.props.rows.getRecords().forEach(row => {
            // TODO (josh): Fix this, this is pretty stupid. We should be using
            // RichTextEntity in the JiraRecord model so that we can easily look
            // up the key.
            let id = row.getCell(keyColumn).get("contents").id;
            let entity = quip.apps.getRecordById(id);
            const data = {
                contents: {
                    id: entity.getId(),
                    key: column.getName(),
                    type: entity.getField(column.getName()).getType(),
                },
            };
            row.addCell(column, data);
        });
        this.setState({showFieldPicker: false});
    };

    hasLoaded_(entities) {
        return !entities.find(entity => !entity.hasLoaded());
    }

    onColumnDrop_ = (id, index) => {
        this.props.columns.move(quip.apps.getRecordById(id), index);
    };

    onColumnDelete_ = id => {
        const columnRecord = quip.apps.getRecordById(id);
        this.props.entities.forEach(entity => {
            entity.getField(columnRecord.getName()).remove();
        });
        columnRecord.delete();
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
            record.setProperty("widths", this.state.widths);
        }, 2000);
    };

    setRowHeight_ = (row, column, height) => {
        this.setState(({heights}) => ({
            heights: Object.assign(heights, {
                [row.getId()]: Object.assign(heights[row.getId()] || {}, {
                    // Height comes directly from RichTextBoxes so we need to
                    // add padding back in
                    [column.getId()]: Math.max(
                        height + ROW_PADDING,
                        ROW_START_HEIGHT),
                }),
            }),
            errorBorderHeight: sumHeights(heights),
        }));
    };

    onDraftClick_ = (draftBadge, field, e) => {
        if (field.isDirty()) {
            this.props.menuDelegate.showDraftContextMenu(e, draftBadge, field);
        }
    };

    renderCell_ = (record, row, showComments, isFirstColumn, width) => {
        const contents = record.get("contents");
        const entity = quip.apps.getRecordById(contents.id);
        const field = entity.getField(contents.key);
        const commentRecord = field ? field : entity;
        showComments = showComments || commentRecord.getCommentCount() > 0;
        let draft;
        let draftBadge;
        const commentsTrigger = <span onClick={e => e.stopPropagation()}>
            <quip.apps.ui.CommentsTrigger
                className={cx(
                    Card.commentsTrigger,
                    showComments
                        ? Card.commentWrapper
                        : Card.commentWrapperHide,
                    {
                        [Card.firstColumnComment]: isFirstColumn,
                    })}
                record={commentRecord}
                showEmpty/>
        </span>;

        if (field && field.isDirty()) {
            draft = <div
                ref={node => {
                    draftBadge = node;
                }}
                className={Styles.draftIndicator}
                onClick={e => this.onDraftClick_(draftBadge, field, e)}>
                <span className={Styles.draftText}>Draft</span>
                <Chevron/>
            </div>;
        }

        let cell;
        let consumedComment = false;

        let lockIcon = <div
            title={"This field is read-only."}
            className={Styles.lockIcon}>
            <LockIcon/>
        </div>;

        if (contents.key === "key") {
            consumedComment = true;
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
                            "border-image-source": "none",
                        },
                        overlay: {
                            marginLeft: "-10px",
                            marginTop: marginTop + "px",
                        },
                        wrapper: {margin: "0px"},
                    };
                    errorPopover = <Modal
                        isOpen={true}
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
            cell = <div
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
        } else if (contents.type === "Date" ||
            contents.type === "String" ||
            contents.type === "Url") {
            const classNames = [Styles.recordListCell];
            if (field.isReadOnly()) {
                classNames.push(Styles.readOnly);
            }
            const rowRecord = quip.apps.getRecordById(row.id);
            const columnRecord = record.getColumn();
            consumedComment = true;
            cell = <div className={classNames.join(" ")}>
                <div
                    className={Styles.recordListCellOptions}
                    style={{width: width}}>
                    {commentsTrigger}
                    {lockIcon}
                    {draft}
                </div>
                <quip.apps.ui.RichTextBox
                    onComponentHeightChanged={height =>
                        this.setRowHeight_(rowRecord, columnRecord, height)}
                    readOnly={field.isReadOnly()}
                    ref={node => (field.domNode = ReactDOM.findDOMNode(node))}
                    record={field.get("value")}
                    scrollable={false}
                    width={width - CELL_OPTIONS_SPACING}/>
            </div>;
        } else if (contents.type === "Picklist") {
            consumedComment = true;
            const classNames = [Styles.recordListCell];
            if (field.isReadOnly()) {
                classNames.push(Styles.readOnly);
            }
            const updatedWidth = width - CELL_OPTIONS_SPACING;
            cell = <div className={classNames.join(" ")}>
                <div className={Styles.recordListCellOptions} style={{width}}>
                    {commentsTrigger}
                    {lockIcon}
                    {draft}
                </div>
                <EnumField
                    entity={field}
                    width={updatedWidth}
                    ref={node => (field.domNode = ReactDOM.findDOMNode(node))}/>
            </div>;
        } else {
            cell = <div/>;
        }
        return {cardComponent: cell, consumedComment: consumedComment};
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
        if (this.state.loadingStatus == LOADING_STATUS.LOADING ||
            this.state.loadingStatus == LOADING_STATUS.UNLOADED) {
            if (this.props.entities.length > 8) {
                return <div
                    style={{
                        textAlign: "center",
                        width: this.props.loadingWidth,
                    }}>
                    Loading…
                </div>;
            } else {
                return <div style={{width: this.props.loadingWidth}}>
                    <quip.apps.ui.Image.Placeholder
                        key={"record-list-spinner"}
                        size={25}
                        loading={true}/>
                </div>;
            }
        }

        let fieldPicker;
        if (this.state.showFieldPicker) {
            fieldPicker = <FieldPicker
                ref={node => (this.fieldPicker_ = ReactDOM.findDOMNode(node))}
                className={Styles.fieldPicker}
                entity={this.props.entities[0]}
                fromTop={true}
                query={this.state.query}
                onSelectField={this.addField_}/>;
        }

        let {widths, heights} = this.state;
        const col = toJSON(this.props.columns);
        let row = toJSON(this.props.rows);

        if (this.props.rows.count() > 0 &&
            !this.props.rows
                .getRecords()[0]
                .getCell(this.props.columns.get(0))) {
            // Data may still be syncing at the moment. The original owner might
            // not have fetched yet.
            row.data = [];
            heights = {};
        }
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
                        "border-image-source": "none",
                    },
                    overlay: {
                        marginLeft: "20px",
                        marginTop: marginTop + "px",
                    },
                    wrapper: {margin: "0px"},
                };
                errorPopover = <Modal
                    isOpen={true}
                    rootHeight={0}
                    style={modalStyle}
                    wrapperRef={this.wrapper}>
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
                        this.onEntitiesChanged_(this.props.entities)}>
                    Retry
                </div>
            </div>;
        } else if (row.data.length == 0) {
            messageDiv = <div className={Styles.empty}>
                No Items To Display
            </div>;
        }

        return <div ref={node => (this.wrapper = node)}>
            {fieldPicker}
            <TableView
                columns={col}
                customRenderer={this.renderCell_}
                heights={heights}
                onColumnDelete={this.onColumnDelete_}
                onColumnDrop={this.onColumnDrop_}
                onContextMenu={this.props.onContextMenu}
                onResizeEnd={this.onResizeEnd_}
                rows={row}
                setRowHeight={this.setRowHeight_}
                setWidths={this.setWidths_}
                statusTypes={{}}
                widths={widths}
                globalError={errorIndicator}
                errorStatus={this.state.recordsErrorStatus}/>
            {messageDiv}
            {errorBorder}
        </div>;
    }
}
