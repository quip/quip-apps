import cx from "classnames";
import React, {Component} from "react";
import {toJSONPropTypeShape, toJSON} from "./model.js";
import {Motion} from "react-motion";
import isEqual from "lodash.isequal";
import Card from "./card.jsx";
import {animateTo} from "./lib/animation";
import ChevronDown from "./lib/components/icons/ChevronDown";
import Grabber from "./lib/components/icons/Grabber";
import {hashCode} from "./utils.js";

const {RichTextBox} = quip.apps.ui;

import styles from "./Column.less";

class Column extends Component {
    static propTypes = {
        columns: toJSONPropTypeShape("array"),
        rows: toJSONPropTypeShape("array"),
        column: toJSONPropTypeShape("object"),
        index: React.PropTypes.number.isRequired,
        moveColumn: React.PropTypes.func.isRequired,
        onColumnAdd: React.PropTypes.func,
        onColumnDelete: React.PropTypes.func.isRequired,
        onColumnSort: React.PropTypes.func.isRequired,
        onContextMenu: React.PropTypes.func.isRequired,
        onRowDelete: React.PropTypes.func.isRequired,
        customRenderer: React.PropTypes.func.isRequired,
        // Height / width
        rootHeight: React.PropTypes.number.isRequired,
        width: React.PropTypes.number.isRequired,
        widths: React.PropTypes.object.isRequired,
        heights: React.PropTypes.object.isRequired,
        setRowHeight: React.PropTypes.func,
        // Resize columns
        onResizeColumn: React.PropTypes.func.isRequired,
        onResizeColumnStart: React.PropTypes.func.isRequired,
        onResizeColumnEnd: React.PropTypes.func.isRequired,
        resizing: React.PropTypes.bool.isRequired,
        // Column dragging
        columnDraggingInProgress: React.PropTypes.bool,
        columnDragInProgress: React.PropTypes.func.isRequired,
        onColumnDrop: React.PropTypes.func.isRequired,
        // Row dragging
        onRowDrag: React.PropTypes.func.isRequired,
        rowDraggingIndex: React.PropTypes.number,
        rowDraggingInProgress: React.PropTypes.bool.isRequired,
        globalError: React.PropTypes.element,
        errorStatus: React.PropTypes.string,
        metricType: React.PropTypes.string,
        toggleActiveDrag: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            titleFocused: false,
            titleBeforeFocus: null,
            titleHovered: false,
            cardFocused: false,
            isDraggingColumn: false,
            dragStartX: 0,
            dragCurrentX: 0,
            dragAnchorX: 0,
            columnDropWidths: {prev: null, next: null},
            columnDragMoved: 0,
            columnDropOffset: 0,
            columnDragOffset: 0,
        };
        this.columnDomMap_ = {};
    }

    componentDidMount() {
        window.addEventListener("mousemove", this.onMouseMove_);
        window.addEventListener("mouseup", this.columnDraggingDrop_);
    }

    componentWillUnmount() {
        window.removeEventListener("mousemove", this.onMouseMove_);
        window.removeEventListener("mouseup", this.columnDraggingDrop_);
    }

    componentWillReceiveProps(nextProps) {
        const {index} = this.props;
        const {index: nextIndex} = nextProps;
        const {columnDragMoved, isDraggingColumn} = this.state;

        if (index !== nextIndex && isDraggingColumn) {
            const indexDiff = nextIndex - index;
            this.setColumnBounds(nextProps, {
                moved: columnDragMoved + indexDiff,
            });
        }
    }

    columnDraggingStart_ = e => {
        if (this.props.metricType) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "column_drag",
            });
        }
        const {column, columnDragInProgress} = this.props;
        const {left} = this.columnDomMap_[column.id].getBoundingClientRect();
        columnDragInProgress(true);
        this.props.toggleActiveDrag(true);
        this.setState({
            isDraggingColumn: true,
            dragStartX: e.clientX,
            dragAnchorX: e.clientX - left,
            dragCurrentX: e.clientX,
        });

        this.setColumnBounds(this.props, {moved: 0});
    };

    columnDraggingDrop_ = () => {
        const {isDraggingColumn} = this.state;
        if (!isDraggingColumn) {
            return;
        }

        const {index, column, columnDragInProgress} = this.props;
        columnDragInProgress(false);
        this.props.onColumnDrop(column.id, index);
        this.props.toggleActiveDrag(false);
        this.setState({
            isDraggingColumn: false,
            dragStartX: 0,
            dragCurrentX: 0,
            columnDragOffset: 0,
        });
    };

    setColumnBounds = (props, {moved}) => {
        const {widths, columns, index} = props;

        const records = columns.data;

        const sum = arr => arr.reduce((acc, col) => acc + widths[col.id], 0);

        const colDropAt = colIndex => {
            const colId = records[colIndex].id;
            return records[colIndex].draggable ? widths[colId] : null;
        };

        let dropOffset = 0;
        if (moved < 0) {
            dropOffset =
                -1 * sum(records.slice(index + 1, index + 1 + Math.abs(moved)));
        } else if (moved > 0) {
            dropOffset = sum(records.slice(index - Math.abs(moved), index));
        }

        const drops = {
            prev: index !== 0 ? colDropAt(index - 1) : null,
            next: index < records.length - 1 ? colDropAt(index + 1) : null,
        };

        let dragOffset = 0;
        if (moved < 0) {
            // And cols that have been moved after the dragging index
            dragOffset = sum(
                records.slice(index + 1, index + 1 + Math.abs(moved)));
        } else if (moved > 0) {
            // cols that have been moved before the dragging index
            dragOffset =
                -1 * sum(records.slice(index - Math.abs(moved), index));
        }

        this.setState({
            columnDropWidths: drops,
            columnDropOffset: dropOffset,
            columnDragOffset: dragOffset,
            columnDragMoved: moved,
        });
    };

    columnDrag_ = e => {
        const {clientX} = e;
        const {
            isDraggingColumn,
            columnDropWidths,
            dragStartX,
            dragAnchorX,
            columnDropOffset,
        } = this.state;

        if (!isDraggingColumn) return;

        const columnWidth = this.props.widths[this.props.column.id];
        const movement = clientX - dragStartX - columnDropOffset;
        const left = movement < 0;
        const direction = left ? "prev" : "next";
        const updateIndex = val => (left ? val - 1 : val + 1);
        const columnDropWidth = columnDropWidths[direction];

        this.setState({
            dragCurrentX: clientX,
        });

        if (columnDropWidth !== null) {
            // Drop point uses the anchor position since columns are dragged
            // by the left edge. If we are moving to the left, the dragged anchor
            // has to cross 50% past the next column. To the right, it needs
            // to pass 10% into the next column.
            const anchor = left ? dragAnchorX : columnWidth - dragAnchorX;
            const dropThreshold = left ? 0.5 : 0.1;
            const drop = anchor + columnDropWidth * dropThreshold;

            if (Math.abs(movement) > drop) {
                this.moveColumn(
                    this.props.column,
                    updateIndex(this.props.index));
            }
        }
    };

    moveColumn = (column, index) => {
        this.props.moveColumn(column.id, index);
    };

    calcStyle = () => {
        const {
            columns,
            index,
            widths,
            columnDraggingInProgress,
            rowDraggingInProgress,
        } = this.props;
        const {
            dragCurrentX,
            dragStartX,
            isDraggingColumn,
            columnDragOffset,
        } = this.state;
        const disableAnimate =
            isDraggingColumn ||
            (!columnDraggingInProgress && !rowDraggingInProgress);

        const sum = arr => arr.reduce((acc, col) => acc + widths[col.id], 0);
        const columnLeftOffset = sum(columns.data.slice(0, index));

        const x =
            dragCurrentX - dragStartX + columnLeftOffset + columnDragOffset;

        return {x: disableAnimate ? x : animateTo(x)};
    };

    onMouseMove_ = e => {
        const {isDraggingColumn} = this.state;
        const {column, resizing} = this.props;
        if (isDraggingColumn) {
            // Disable default behaviors like text selection
            e.preventDefault();
            this.columnDrag_(e);
        } else if (resizing) {
            this.props.onResizeColumn(e, column);
        }
    };

    showContextMenu = e => {
        const {column, index} = this.props;
        const commands = [
            "sortAscending",
            "sortDescending",
            quip.apps.DocumentMenuCommands.SEPARATOR,
            "addColumn",
        ];
        if (column.deletable) {
            commands.push("deleteColumn");
        }
        const context = {
            sortAscending: () => this.props.onColumnSort(column.id, true),
            sortDescending: () => this.props.onColumnSort(column.id, false),
            deleteColumn: () => this.props.onColumnDelete(column.id),
            addColumn: type =>
                this.props.onColumnAdd(column.id, type, index + 1),
        };

        quip.apps.showContextMenuFromButton(
            e.currentTarget,
            commands,
            [],
            [],
            () => {},
            context);
    };

    handleHeaderInputKey = e => {
        // Dont allow enter key
        if (e.keyCode === 13) {
            return true;
        }
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (!isEqual(nextProps, this.props) ||
            !isEqual(nextState, this.state) ||
            nextProps.resizing)
            return true;
        return false;
    }

    onCardFocused_ = isFocused => {
        this.setState({cardFocused: isFocused});
    };

    onColumnTitleFocus_ = () => {
        // When there is no text content (just placeholder text),
        // a single space is returned by getTextContent.
        // Trim is used here so we can detect emptiness and effectively use
        // getPlaceholderText in onColumnTitleBlur_.
        this.setState({
            titleBeforeFocus: this.props.column.contents
                .getTextContent()
                .trim(),
            titleFocused: true,
        });
    };

    onColumnTitleBlur_ = () => {
        const columnContents = this.props.column.contents;
        const curr_title = this.props.column.contents.getTextContent().trim();
        const prev_title = this.state.titleBeforeFocus
            ? this.state.titleBeforeFocus
            : this.props.column.contents.getPlaceholderText();
        if (this.props.metricType && curr_title != prev_title) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "edit_column_title",
            });
        }
        this.setState({
            titleBeforeFocus: null,
            titleFocused: false,
        });
    };

    render() {
        const {
            column,
            width,
            heights,
            rootHeight,
            onRowDrag,
            onRowDelete,
            columnDraggingInProgress,
            rowDraggingInProgress,
            index,
            columns,
            rows,
            resizing,
        } = this.props;
        const {
            isDraggingColumn,
            titleHovered,
            titleFocused,
            cardFocused,
        } = this.state;
        const isFirstColumn = index === 0;
        const isLastColumn = index === columns.data.length - 1;
        const motionStyle = this.calcStyle();
        const titleEdit =
            column.titleEditable &&
            !isDraggingColumn &&
            !resizing &&
            (titleHovered || titleFocused);
        const titleDraggable = !column.titleEditable && column.draggable;
        return <Motion style={motionStyle}>
            {({x}) => {
                const translateStr = `translate(${x}px, 0px)`;
                return <div
                    key={column.id}
                    ref={el => (this.columnDomMap_[column.id] = el)}
                    className={styles.columnWrapper}
                    style={Object.assign({
                        width,
                        zIndex: isDraggingColumn || cardFocused ? 99 : index,
                        transform: translateStr,
                        // Yosemite fix
                        WebkitTransform: translateStr,
                    })}>
                    <div className={styles.columnHeader}>
                        {!column.draggable &&
                            this.props.globalError && <div>
                                {this.props.globalError}
                            </div>}
                        {column.draggable &&
                            !quip.apps.isMobile() && <div
                                onMouseDown={this.columnDraggingStart_}
                                onMouseUp={this.columnDraggingDrop_}
                                className={styles.dragHandle}>
                                {!quip.apps.isMobile() && <Grabber/>}
                            </div>}
                        <div
                            className={cx(styles.columnTitle, {
                                [styles.columnTitleEdit]: titleEdit,
                                [styles.columnTitleDrag]: titleDraggable,
                            })}
                            onMouseEnter={
                                columnDraggingInProgress
                                    ? undefined
                                    : () =>
                                          this.setState({
                                              titleHovered: true,
                                          })
                            }
                            onMouseLeave={() =>
                                this.setState({
                                    titleHovered: false,
                                })
                            }
                            onMouseDown={
                                titleDraggable
                                    ? this.columnDraggingStart_
                                    : undefined
                            }
                            onMouseUp={
                                titleDraggable
                                    ? this.columnDraggingDrop_
                                    : undefined
                            }>
                            <RichTextBox
                                width="100%"
                                scrollable={false}
                                maxHeight={18}
                                record={column.contents}
                                handleKeyEvent={this.handleHeaderInputKey}
                                readOnly={
                                    !column.titleEditable ||
                                    columnDraggingInProgress
                                }
                                disableSelection={columnDraggingInProgress}
                                onFocus={this.onColumnTitleFocus_}
                                onBlur={this.onColumnTitleBlur_}
                                useDocumentTheme={false}/>
                        </div>
                        {!quip.apps.isMobile() && <div
                            className={styles.dropdown}
                            onClick={this.showContextMenu}>
                            <ChevronDown/>
                        </div>}
                        {!isDraggingColumn &&
                            !quip.apps.isMobile() && <div
                                onMouseDown={e =>
                                    this.props.onResizeColumnStart(e, column)
                                }
                                onMouseUp={this.props.onResizeColumnEnd}
                                className={styles.resizeHandle}/>}
                    </div>
                    {rows.data.map((row, i) => {
                        if (i === this.props.rowDraggingIndex) {
                            return <div
                                key={row.id}
                                style={{
                                    position: "absolute",
                                    width: "100%",
                                }}/>;
                        }
                        const isFirstRow = i === 0;
                        const isLastRow = i === rows.data.length - 1;
                        const statusTypes = {};
                        const statuses = column.statusTypes;
                        if (statuses) {
                            const records = statuses.getRecords();
                            statusTypes.data = records.map(r => toJSON(r));
                        }
                        return <Card
                            key={hashCode(row.id)}
                            rowIndex={i}
                            width={width}
                            rootHeight={rootHeight}
                            heights={heights}
                            setRowHeight={this.props.setRowHeight}
                            row={row}
                            column={column}
                            rows={rows}
                            isFirstRow={isFirstRow}
                            isLastRow={isLastRow}
                            isFirstColumn={isFirstColumn}
                            isLastColumn={isLastColumn}
                            isDraggingColumn={isDraggingColumn}
                            onRowDrag={onRowDrag}
                            onRowDelete={onRowDelete}
                            onCardFocused={this.onCardFocused_}
                            type={column.type}
                            columnDraggingInProgress={columnDraggingInProgress}
                            rowDraggingInProgress={rowDraggingInProgress}
                            rowDraggingIndex={this.props.rowDraggingIndex}
                            customRenderer={this.props.customRenderer}
                            onCardClicked={this.props.onCardClicked}
                            onContextMenu={this.props.onContextMenu}
                            metricType={this.props.metricType}
                            statusTypes={statusTypes}/>;
                    })}
                </div>;
            }}
        </Motion>;
    }
}

export default Column;
