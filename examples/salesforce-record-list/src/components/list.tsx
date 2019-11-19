// Copyright 2019 Quip

import React, {
    Component,
    MouseEvent as ReactMouseEvent,
    KeyboardEvent as ReactKeyboardEvent,
} from "react";
import quip from "quip-apps-api";
import _ from "quiptext";
import PropTypes, {InferProps} from "prop-types";
import Styles from "./list.less";
import Cell from "./cell";
import Icon from "./icon";
import classNames from "classnames";
import {immutableSwap} from "../lib/util";
import produce from "immer";
import Paginator from "./paginator";
import recordMetric from "../lib/metrics";
import ListHeader from "./list-header";
import {SalesforceColumn} from "../lib/salesforce-types";
import {SalesforceListCell} from "../model/salesforce-list";
import {RowInfo} from "../lib/salesforce-responses";
import CellComment from "../model/cell-comment";

interface ListProps extends InferProps<typeof List.propTypes> {
    themeInfo: {name: string};
    columnWidths: Map<string, number>;
    columns: SalesforceColumn[];
    rows: RowInfo<SalesforceListCell>[];
    onUpdateCell: (recordId: string, colName: string, value: string) => void;
    onAddComment: (
        recordId: string,
        columnName: string,
        domNode: Node) => CellComment;
    onSetColumnWidths: (columnWidths: Map<string, number>) => void;
    onSetShowingColumns: (showingColumns: string[]) => void;
    onSetSortColumn: (sortColumn: string) => void;
    onClickReference: (relativeUrl: string) => void;
}
interface ListState {
    showErrorPopover: boolean;
    draggingColumn: string;
    columnWidths: Map<string, number>;
    frozenRowHeights: number[];
    startIndex: number;
    draggingColumnX: number;
    draggingColumnY: number;
    draggingColumnWidth: number;
    draggingOriginIndex: number;
    draggingDestinationIndex: number;
}

export default class List extends Component<ListProps, ListState> {
    static propTypes = {
        title: PropTypes.string.isRequired,
        link: PropTypes.string,
        themeInfo: PropTypes.object.isRequired,
        sortColumn: PropTypes.string,
        sortDesc: PropTypes.bool,
        isEmpty: PropTypes.bool,
        isPlaceholder: PropTypes.bool,
        isReadOnly: PropTypes.bool,
        isSaving: PropTypes.bool,
        isRefreshing: PropTypes.bool,
        error: PropTypes.instanceOf(Error),
        columns: PropTypes.arrayOf(PropTypes.object).isRequired,
        rows: PropTypes.arrayOf(PropTypes.object).isRequired,
        recordsPerPage: PropTypes.number.isRequired,
        truncateContent: PropTypes.bool,
        columnWidths: PropTypes.object.isRequired,
        onUpdateCell: PropTypes.func.isRequired,
        onAddComment: PropTypes.func.isRequired,
        onSetColumnWidths: PropTypes.func.isRequired,
        showingColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
        onSetShowingColumns: PropTypes.func.isRequired,
        onSetSortColumn: PropTypes.func.isRequired,
        onClickReference: PropTypes.func.isRequired,
    };

    private headerRefs_: Map<string, HTMLElement> = new Map();
    private rowRefs_: HTMLElement[] = [];
    private relativeElement_: HTMLDivElement;
    private needsDragUpdate_: boolean = false;
    private isDraggingColumn_: boolean = false;
    private lastColumns_: {name: string; width: number}[] = [];
    private isResizing_: boolean = false;
    private resizingColumn_: string;
    private dragStartX_: number;
    private dragColumnName_: string;
    private dragColumnStartX_: number;

    constructor(props: ListProps) {
        super(props);
        this.state = {
            showErrorPopover: false,
            draggingColumn: null,
            columnWidths: props.columnWidths,
            frozenRowHeights: [],
            startIndex: 0,
            draggingColumnX: 0,
            draggingColumnY: 0,
            draggingColumnWidth: 0,
            draggingOriginIndex: -1,
            draggingDestinationIndex: -1,
        };
    }

    componentWillReceiveProps(props: ListProps) {
        const {columnWidths: currentColumnWidths} = this.state;
        // When we recieve props, merge column widths with our stateful ones
        // (since they may be dragging but our props should always win)
        if (!this.isDraggingColumn_) {
            let needsUpdate = false;
            const columnWidths = produce(currentColumnWidths, cw => {
                for (const [col, width] of props.columnWidths) {
                    if (cw.get(col) !== width) {
                        needsUpdate = true;
                        cw.set(col, width);
                    }
                }
            });
            if (needsUpdate) {
                this.setState({columnWidths});
            }
        }
        if (props.error && props.error !== this.props.error) {
            this.flashError_();
        }
    }

    getColumnHeaderElement_(name: string) {
        return this.headerRefs_.get(name);
    }

    getColumnWidth_(name: string) {
        const headerEl = this.getColumnHeaderElement_(name);
        return headerEl ? headerEl.getBoundingClientRect().width : null;
    }

    freezeRowHeights_() {
        const frozenRowHeights = this.rowRefs_.map(el =>
            el ? el.getBoundingClientRect().height : 18
        );
        this.setState({frozenRowHeights});
    }

    onHeaderContextMenu_ = (
        event: ReactMouseEvent<HTMLElement>,
        colName: string) => {
        const {truncateContent} = this.props;
        event.preventDefault();
        quip.apps.showContextMenu(
            event.nativeEvent,
            ["hide-column", "manage-columns", "wrap-cells"],
            truncateContent ? ["wrap-cells"] : [],
            [],
            undefined,
            {
                colName,
            });
    };

    onStartDragColumnResizer_ = (
        event: ReactMouseEvent<HTMLElement>,
        colName: string) => {
        const {columns} = this.props;
        const columnWidths = new Map();
        // When we start dragging, store the current widths of all columns. If
        // they have never been dragged, this will use the width that the
        // browser chose automatically
        this.lastColumns_ = columns.map((col, idx) => {
            const name = col.fieldApiName;
            const width = this.getColumnWidth_(name);
            columnWidths.set(name, width);
            return {
                name,
                width,
            };
        });
        this.isResizing_ = true;
        this.resizingColumn_ = colName;
        this.dragStartX_ = event.clientX;
        document.addEventListener("mousemove", this.onMoveColumnResizer_);
        document.addEventListener("mouseup", this.onDropColumnResizer_);
        this.setState({columnWidths});
    };

    onMoveColumnResizer_ = (event: MouseEvent) => {
        if (!this.needsDragUpdate_) {
            this.needsDragUpdate_ = true;
            requestAnimationFrame(() => {
                if (this.needsDragUpdate_) {
                    const delta = event.clientX - this.dragStartX_;
                    const columnWidths = new Map();
                    let shrinkBy = 0;
                    // distribute the delta between the remaining items
                    this.lastColumns_.forEach(({name, width}, idx) => {
                        if (name === this.resizingColumn_) {
                            const remainingColumns =
                                this.lastColumns_.length - idx - 1;
                            shrinkBy = Math.max(delta / remainingColumns, 0);
                            columnWidths.set(name, Math.max(width + delta, 50));
                        } else {
                            columnWidths.set(name, width - shrinkBy);
                        }
                    });
                    this.setState({columnWidths});
                    this.needsDragUpdate_ = false;
                }
            });
        }
    };

    onDropColumnResizer_ = () => {
        const {onSetColumnWidths, columnWidths} = this.props;
        const {columnWidths: calculatedColumnWidths} = this.state;
        this.isResizing_ = false;
        document.removeEventListener("mousemove", this.onMoveColumnResizer_);
        document.removeEventListener("mouseup", this.onDropColumnResizer_);
        columnWidths.set(
            this.resizingColumn_,
            calculatedColumnWidths.get(this.resizingColumn_));
        onSetColumnWidths(columnWidths);
        this.setState({columnWidths});
    };

    onStartDragColumn_ = (
        event: ReactMouseEvent<HTMLElement>,
        colName: string) => {
        this.dragStartX_ = event.clientX;
        this.isDraggingColumn_ = false;
        this.dragColumnName_ = colName;
        this.freezeRowHeights_();
        document.addEventListener("mousemove", this.onMoveColumn_);
        document.addEventListener("mouseup", this.onDropColumn_);
    };

    onMoveColumn_ = (event: MouseEvent) => {
        const {columns} = this.props;
        const delta = event.clientX - this.dragStartX_;
        if (!this.isDraggingColumn_ && Math.abs(delta) >= 2) {
            this.isDraggingColumn_ = true;
            const colName = this.dragColumnName_;
            const draggingColumnWidth = this.getColumnWidth_(colName);
            const {
                top: containerTop,
                left: containerLeft,
            } = this.relativeElement_.getBoundingClientRect();
            const {top, left} = this.getColumnHeaderElement_(
                colName).getBoundingClientRect();
            this.dragColumnStartX_ = left - containerLeft;
            let draggingOriginIndex = -1;
            for (let i = 0; i < columns.length; i++) {
                if (columns[i].fieldApiName === colName) {
                    draggingOriginIndex = i;
                    break;
                }
            }
            this.setState({
                draggingColumn: colName,
                draggingColumnWidth,
                draggingOriginIndex,
                draggingDestinationIndex: draggingOriginIndex,
                draggingColumnX: this.dragColumnStartX_,
                 
                draggingColumnY: top - containerTop - 9,
            });
        } else if (!this.needsDragUpdate_) {
            this.needsDragUpdate_ = true;
            requestAnimationFrame(() => {
                const {draggingColumnWidth} = this.state;
                const draggingColumnX = this.dragColumnStartX_ + delta;
                // Reorder columns based on where the dragging element is
                let draggingDestinationIndex = -1;
                let pWidth = 0;
                for (const col of columns) {
                    draggingDestinationIndex++;
                    const width = this.getColumnWidth_(col.fieldApiName);
                    if (width + pWidth >
                        draggingColumnX + draggingColumnWidth / 2) {
                        // This column starts after 50% of our current drag position,
                        // insert between it and the one before it
                        break;
                    }
                    pWidth = pWidth + width;
                }
                this.setState({
                    draggingColumnX,
                    draggingDestinationIndex,
                });
                this.needsDragUpdate_ = false;
            });
        }
    };

    onDropColumn_ = () => {
        const {showingColumns, onSetShowingColumns} = this.props;
        const {draggingDestinationIndex, draggingOriginIndex} = this.state;
        document.removeEventListener("mousemove", this.onMoveColumn_);
        document.removeEventListener("mouseup", this.onDropColumn_);
        if (this.isDraggingColumn_) {
            this.isDraggingColumn_ = false;
            onSetShowingColumns(
                immutableSwap(
                    showingColumns,
                    draggingOriginIndex,
                    draggingDestinationIndex));
            this.setState({
                draggingColumn: null,
                draggingOriginIndex: undefined,
                draggingDestinationIndex: undefined,
            });
        }
    };

    onColumnHeaderClicked_(e: ReactMouseEvent<HTMLElement>, colName: string) {
        const {onSetSortColumn} = this.props;
        e.preventDefault();
        onSetSortColumn(colName);
    }

    onColumnHeaderKeyPressed_(
        e: ReactKeyboardEvent<HTMLElement>,
        colName: string) {
        // space/enter
        if (e.keyCode === 13 || e.keyCode === 32) {
            const {onSetSortColumn} = this.props;
            e.preventDefault();
            onSetSortColumn(colName);
        }
    }

    goBack_ = () => {
        const {recordsPerPage} = this.props;
        const {startIndex} = this.state;
        if (startIndex - recordsPerPage >= 0) {
            this.setState({startIndex: startIndex - recordsPerPage});
        }
        recordMetric("paginate", {"direction": "back"});
    };
    goForward_ = () => {
        const {recordsPerPage, rows} = this.props;
        const {startIndex} = this.state;
        if (startIndex + recordsPerPage < rows.length) {
            this.setState({startIndex: startIndex + recordsPerPage});
        }
        recordMetric("paginate", {"direction": "forward"});
    };

    renderTable_(
        columns: SalesforceColumn[],
        rows: RowInfo<SalesforceListCell>[],
        isDragging: boolean = false,
        style: {[attr: string]: string | number} = {}) {
        const {
            sortColumn,
            sortDesc,
            isPlaceholder,
            isEmpty,
            onUpdateCell,
            onAddComment,
            onClickReference,
            isReadOnly,
            truncateContent,
        } = this.props;
        const {columnWidths, draggingColumn, frozenRowHeights} = this.state;
        const sortIconName = sortDesc ? "arrowup" : "arrowdown";
        const trStyle = isDragging ? {display: "block"} : {};
        const isResizable = !isPlaceholder;
        if (this.isResizing_) {
            let width = 0;
            for (const w of columnWidths.values()) {
                width += w;
            }
            style.width = width;
        }
        const getHeaderRef = (column: SalesforceColumn) =>
            isDragging
                ? null
                : (r: HTMLElement) =>
                      this.headerRefs_.set(column.fieldApiName, r);
        return <table
            aria-multiselectable="true"
            className={classNames(
                "slds-table slds-table_bordered slds-table_edit slds-table_fixed-layout",
                Styles.listview,
                {
                    [Styles.draggingList]: isDragging,
                    "slds-table_resizable-cols": isResizable,
                })}
            style={style}
            role="grid">
            <thead>
                <tr>
                    {columns.map((column, idx) => <th
                        ref={getHeaderRef(column)}
                        key={`th-col-${idx}`}
                        aria-label={column.label}
                        aria-sort="none"
                        className={classNames(Styles.tableHeader, {
                            "slds-is-sortable": column.sortable,
                            "slds-is-sorted":
                                column.fieldApiName === sortColumn,
                            "slds-is-resizable": isResizable,
                        })}
                        style={{
                            width:
                                columnWidths.get(column.fieldApiName) ||
                                "initial",
                            ...trStyle,
                        }}
                        scope="col">
                        {column.fieldApiName !== draggingColumn ||
                        isDragging ? (
                            <div
                                className="slds-th__action slds-text-link_reset"
                                onClick={
                                    column.sortable
                                        ? e =>
                                              this.onColumnHeaderClicked_(
                                                  e,
                                                  column.fieldApiName)
                                        : null
                                }
                                onKeyDown={
                                    column.sortable
                                        ? e =>
                                              this.onColumnHeaderKeyPressed_(
                                                  e,
                                                  column.fieldApiName)
                                        : null
                                }
                                role="button"
                                tabIndex={0}
                                onContextMenu={e =>
                                    this.onHeaderContextMenu_(
                                        e,
                                        column.fieldApiName)
                                }
                                onMouseDown={e =>
                                    this.onStartDragColumn_(
                                        e,
                                        column.fieldApiName)
                                }>
                                <span className="slds-assistive-text">
                                    Sort by:{" "}
                                </span>
                                <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                                    <span
                                        className={classNames(
                                            "slds-truncate",
                                            Styles.sortableTitle)}
                                        title={column.label}>
                                        {column.label}
                                    </span>
                                    {column.sortable ? (
                                        <span
                                            className={`slds-icon_container slds-icon-utility-${sortIconName}`}>
                                            <Icon
                                                object={sortIconName}
                                                type="utility"
                                                size="x-small"
                                                sortable={true}/>
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                        {isResizable ? (
                            <div
                                className="slds-resizable"
                                onContextMenu={e =>
                                    this.onHeaderContextMenu_(
                                        e,
                                        column.fieldApiName)
                                }
                                onMouseDown={e =>
                                    this.onStartDragColumnResizer_(
                                        e,
                                        column.fieldApiName)
                                }>
                                <input
                                    aria-label={`${column.label} column width`}
                                    className="slds-resizable__input slds-assistive-text"
                                    max="1000"
                                    min="50"
                                    tabIndex={0}
                                    type="range"/>
                                <span className="slds-resizable__handle">
                                    <span className="slds-resizable__divider"/>
                                </span>
                            </div>
                        ) : null}
                    </th>)}
                </tr>
            </thead>
            <tbody>
                {isEmpty ? (
                    <tr>
                        <td colSpan={columns.length}>
                            <div className={Styles.emptyMessage}>
                                <h2>{_("No Records Found")}</h2>
                            </div>
                        </td>
                    </tr>
                ) : null}
                {rows.map(({recordId, cells}, rowIdx) => <tr
                    key={`row-${rowIdx}`}
                    ref={r => (this.rowRefs_[rowIdx] = r)}
                    aria-selected="false"
                    className="slds-hint-parent"
                    style={{
                        height: isDragging ? frozenRowHeights[rowIdx] : null,
                    }}>
                    {cells.map(
                        ({data, column, dirty, comment, schema}, idx) => {
                            return column.fieldApiName === draggingColumn &&
                                !isDragging ? (
                                <td/>
                            ) : (
                                <Cell
                                    key={`${recordId}-${idx}`}
                                    onResetValue={() => {
                                        onUpdateCell(
                                            recordId,
                                            column.fieldApiName,
                                            /** reset value */ null);
                                    }}
                                    onChangeValue={value => {
                                        onUpdateCell(
                                            recordId,
                                            column.fieldApiName,
                                            value);
                                    }}
                                    onCreateComment={domNode =>
                                        onAddComment(
                                            recordId,
                                            column.fieldApiName,
                                            domNode)
                                    }
                                    onClickReference={onClickReference}
                                    isReadOnly={isReadOnly}
                                    width={columnWidths.get(
                                        column.fieldApiName)}
                                    data={data}
                                    truncateContent={truncateContent}
                                    isDirty={dirty}
                                    schema={schema}
                                    column={column}
                                    comment={comment}/>
                            );
                        })}
                </tr>)}
            </tbody>
        </table>;
    }

    render() {
        let {
            title,
            link,
            themeInfo,
            columns,
            rows,
            error,
            isSaving,
            isRefreshing,
            recordsPerPage,
        } = this.props;
        const {
            startIndex,
            showErrorPopover,
            draggingColumn,
            draggingColumnWidth,
            draggingColumnX,
            draggingColumnY,
            draggingOriginIndex,
            draggingDestinationIndex,
        } = this.state;
        const totalCount = rows.length;
        rows = rows.slice(startIndex, startIndex + recordsPerPage);
        let dragColumn = null;
        const rootStyles: {[attr: string]: string | number} = {};
        if (draggingColumn) {
            const dragCols = [columns[draggingOriginIndex]];
            // Produce doesn't seem to like passsing through class instances so
            // we need to cast the response here and below
            const dragRows = produce(rows, r => {
                r.forEach(row => {
                    row.cells = [row.cells[draggingOriginIndex]];
                });
                return r;
            }) as RowInfo<SalesforceListCell>[];
            dragColumn = this.renderTable_(dragCols, dragRows, true, {
                display: "block",
                position: "absolute",
                left: draggingColumnX,
                top: draggingColumnY,
                width: draggingColumnWidth,
                opacity: 0.7,
            });
            rootStyles.pointerEvents = "none";
            columns = immutableSwap(
                columns,
                draggingOriginIndex,
                draggingDestinationIndex);
            rows = produce(rows, r => {
                r.forEach(row => {
                    row.cells = immutableSwap(
                        row.cells,
                        draggingOriginIndex,
                        draggingDestinationIndex);
                });
                return r;
            }) as RowInfo<SalesforceListCell>[];
        }
        return <div
            className={classNames(
                "slds-table_edit_container slds-is-relative",
                Styles.root)}
            ref={r => (this.relativeElement_ = r)}
            style={rootStyles}>
            <ListHeader
                title={title}
                link={link}
                themeInfo={themeInfo}
                error={error}
                isSaving={isSaving}
                isRefreshing={isRefreshing}
                showErrorPopover={showErrorPopover}
                onMouseEnterError={this.showErrorPopover_}
                onMouseLeaveError={this.hideErrorPopover_}>
                <div className={Styles.paginationContainer}>
                    <Paginator
                        startIndex={startIndex}
                        endIndex={Math.min(
                            startIndex + recordsPerPage,
                            totalCount)}
                        totalCount={totalCount}
                        onGoBack={this.goBack_}
                        onGoForward={this.goForward_}/>
                </div>
            </ListHeader>
            <div className={Styles.listContainer}>
                {this.renderTable_(columns, rows)}
            </div>
            {dragColumn}
        </div>;
    }

    flashError_ = () => {
        this.setState({
            showErrorPopover: true,
        });
        setTimeout(() => {
            this.setState({showErrorPopover: false});
        }, 10000);
    };

    showErrorPopover_ = () => {
        this.setState({
            showErrorPopover: true,
        });
    };

    hideErrorPopover_ = () => {
        this.setState({
            showErrorPopover: false,
        });
    };
}
