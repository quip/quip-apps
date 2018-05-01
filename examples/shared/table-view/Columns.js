import React, { Component } from "react";
import { toJSONPropTypeShape } from "./model.js";
import Column from "./Column";
import Card from "./Card";
import { hashCode } from "./utils.js"
import VirtualMove from "./lib/VirtualMove";

import styles from "./Columns.less";

class Columns extends Component {
    static propTypes = {
        columns: toJSONPropTypeShape("array"),
        rows: toJSONPropTypeShape("array"),
        widths: React.PropTypes.object.isRequired,
        heights: React.PropTypes.object.isRequired,
        headerHeight: React.PropTypes.number.isRequired,
        rootHeight: React.PropTypes.number.isRequired,
        setWidths: React.PropTypes.func.isRequired,
        getMinWidth: React.PropTypes.func.isRequired,
        setRowHeight: React.PropTypes.func,
        moveRow: React.PropTypes.func.isRequired,
        onRowDrop: React.PropTypes.func.isRequired,
        onRowDelete: React.PropTypes.func.isRequired,
        onColumnDrop: React.PropTypes.func.isRequired,
        onColumnAdd: React.PropTypes.func,
        onColumnDelete: React.PropTypes.func.isRequired,
        customRenderer: React.PropTypes.func.isRequired,
        onResizeEnd: React.PropTypes.func,
        onContextMenu: React.PropTypes.func,
        globalError: React.PropTypes.element,
        errorStatus: React.PropTypes.string,
        metricType: React.PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            resizing: [],
            dragCurrentY: 0,
            dragStartY: 0,
            startingX: 0,
            rowDrops: { prev: null, next: null },
            rowDropOffset: 0,
            rowDragOffset: 0,
            draggingRowIndex: null,
            draggingRowMoved: 0,
            columnDraggingInProgress: false,
            rowDraggingInProgress: false,
        };
    }

    componentDidMount() {
        window.addEventListener("mousemove", this.dragRow);
        window.addEventListener("mouseup", this.onMouseUp_);
    }

    componentWillUnmount() {
        window.removeEventListener("mousemove", this.dragRow);
        window.removeEventListener("mouseup", this.onMouseUp_);
    }

    columnDragInProgress = columnDraggingInProgress => {
        this.setState({ columnDraggingInProgress });
    };

    // Start Row Dragging Functions
    onRowDrag = (e, row) => {
        if (this.props.metricType) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "row_drag",
            });
        }
        const index = this.props.rows.data.findIndex(
            dataRow => dataRow.id === row.id,
        );
        this.setState({ rowDraggingInProgress: true });
        this.setRowDragBounds({
            e,
            rows: this.props.rows,
            index,
            moved: this.state.draggingRowMoved,
            initial: true,
        });
    };

    setRowDragBounds = ({ e, rows, index, moved, initial = false }, cb) => {
        const { clientY } = e;
        const { heights, headerHeight } = this.props;

        const row = rows.data[index];
        const rowHeight = heights[row.id];
        const records = rows.data;

        const sum = arr => arr.reduce((acc, row) => acc + heights[row.id], 0);
        const rowDropAt = rowIndex =>
            (rowHeight + heights[rows.data[rowIndex].id]) / 2;

        // For determining total amount of y pixels draggeed
        let dropOffset = 0;
        if (moved < 0) {
            // If moving down, displaced height is all rows that have been
            // moved after the dragging row
            dropOffset =
                -1 * sum(records.slice(index + 1, index + 1 + Math.abs(moved)));
        } else if (moved > 0) {
            // If moving up, displaced height is all rows that have been moved
            // before the dragging row
            dropOffset = sum(records.slice(index - Math.abs(moved), index));
        }

        // For determining the prev/next row drop thresholds
        const drops = {
            prev: index !== 0 ? rowDropAt(index - 1) : null,
            next: index < rows.data.length - 1 ? rowDropAt(index + 1) : null,
        };

        // For positioning the dragging row
        let dragOffset = headerHeight;
        if (moved === 0) {
            // All rows before current dragging index
            dragOffset += sum(records.slice(0, index));
        } else if (moved < 0) {
            dragOffset += sum([
                // All rows before dragging index
                ...records.slice(0, index),
                // And rows that have been moved after the dragging index
                ...records.slice(index + 1, index + 1 + Math.abs(moved)),
            ]);
        } else if (moved > 0) {
            // Rows that have been moved before the dragging index
            dragOffset += sum(records.slice(0, index - moved));
        }

        const values = {
            dragCurrentY: clientY,
            rowDrops: drops,
            rowDropOffset: dropOffset,
            rowDragOffset: dragOffset,
            draggingRowIndex: index,
            draggingRowMoved: moved,
        };

        if (initial) {
            values.dragStartY = clientY;
        }

        this.setState(values, cb);
    };

    componentWillReceiveProps(nextProps) {
        const { draggingRowIndex } = this.state;
        if (draggingRowIndex !== null && this._nextBounds) {
            const { rows } = this.props;
            const { rows: nextRows } = nextProps;
            if (
                rows.data[draggingRowIndex].id !==
                nextRows.data[draggingRowIndex].id
            ) {
                this.setRowDragBounds(
                    Object.assign({ rows: nextRows }, this._nextBounds),
                    () => delete this._nextBounds,
                );
            }
        }
    }

    stopRowDrag = () => {
        const { draggingRowIndex } = this.state;
        if (draggingRowIndex === null) return;
        const row = this.props.rows.data[draggingRowIndex];
        if (row) {
            this.props.onRowDrop(row.id, draggingRowIndex);
        }
        this.setState({
            dragCurrentY: 0,
            dragStartY: 0,
            rowDrops: { prev: null, next: null },
            rowDropOffset: 0,
            rowDragOffset: 0,
            draggingRowIndex: null,
            draggingRowMoved: 0,
            rowDraggingInProgress: false,
        });
    };

    dragRow = e => {
        const { clientY } = e;
        const {
            rowDrops,
            rowDropOffset,
            draggingRowIndex,
            draggingRowMoved,
            dragStartY,
        } = this.state;

        if (draggingRowIndex === null) return;

        const row = this.props.rows.data[draggingRowIndex];
        const movement = clientY - dragStartY - rowDropOffset;
        const direction = movement < 0 ? "prev" : "next";
        const updateIndex = val => (movement < 0 ? val - 1 : val + 1);
        const drop = rowDrops[direction];

        this.setState({
            dragCurrentY: clientY,
        });

        if (drop !== null && Math.abs(movement) > drop) {
            return this.moveRow(row, {
                e,
                index: updateIndex(draggingRowIndex),
                moved: updateIndex(draggingRowMoved),
            });
        }
    };

    moveRow = (row, { e, index, moved }) => {
        this._nextBounds = { e, index, moved };
        this.props.moveRow(row.id, index);
    };

    makeDraggingRow = () => {
        const { heights, widths, columns, rows } = this.props;
        const {
            rowDragOffset,
            draggingRowIndex,
            dragCurrentY,
            dragStartY,
            rowDraggingInProgress,
        } = this.state;

        const row = rows.data[draggingRowIndex];
        const y = dragCurrentY - dragStartY + rowDragOffset;

        const translateStr = `translate(0px, ${y}px)`;
        const wrapperStyle = {
            position: "absolute",
            transform: translateStr,
            // Yosemite fix
            WebkitTransform: translateStr,
            zIndex: 99,
            width: "100%",
            display: "flex",
        };

        return (
            <div style={wrapperStyle}>
                {columns.data.map((column, i) => {
                    const id = column.id;
                    const width = widths[id];
                    const height = heights[row.id];
                    return (
                        <div key={id} style={{ width, height }}>
                            <Card
                                column={column}
                                customRenderer={this.props.customRenderer}
                                customMenuRenderer={
                                    this.props.customMenuRenderer
                                }
                                onCardClicked={this.props.onCardClicked}
                                heights={heights}
                                isFirstColumn={i === 0}
                                onRowDrag={this.onRowDrag}
                                rowDraggingInProgress={rowDraggingInProgress}
                                row={row}
                                type={column.type}
                                width={width}
                                metricType={this.props.metricType}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };
    // End Row Dragging Functions

    // Start Width Changing Functions
    onResizeColumn = e => {
        const { resizing, startingX } = this.state;

        if (!resizing.length) return;

        // Prevent default behaviors if resizing
        e.preventDefault();

        const { setWidths } = this.props;
        const [owner] = resizing;
        const movement = startingX - e.clientX;
        const newOwnerWidth = owner.startingWidth - movement;

        const widths = {
            [owner.id]: newOwnerWidth,
        };

        const types = {
            [owner.id]: owner.type,
        };

        if (this.atMinimumWidth_(widths, types)) return;
        setWidths(widths);
    };

    atMinimumWidth_ = (widths, types) =>
        Object.keys(widths).some(id => {
            const width = widths[id];
            return width < this.props.getMinWidth(id, types[id]);
        });

    onResizeColumnStart = (e, col) => {
        if (this.props.metricType) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "column_resize",
            });
        }
        const { widths } = this.props;
        const { id } = col;
        const ownerStartWidth = widths[id];

        this.setState({
            startingX: e.clientX,
            resizing: [{ id: id, startingWidth: ownerStartWidth }],
        });
    };

    onResizeColumnEnd = () => {
        this.setState({ resizing: [] });
        this.props.onResizeEnd();
    };
    // End Width Changing Functions

    onMouseUp_ = () => {
        const {
            columnDraggingInProgress,
            rowDraggingInProgress,
            resizing,
        } = this.state;
        if (
            columnDraggingInProgress ||
            rowDraggingInProgress ||
            resizing.length
        ) {
            this.onResizeColumnEnd();
            this.stopRowDrag();
        }
    };

    render() {
        const { rows, columns, widths, rootHeight, heights } = this.props;
        const {
            resizing,
            draggingRowIndex,
            columnDraggingInProgress,
            rowDraggingInProgress,
        } = this.state;

        return (
            <div className={styles.wrapper}>
                {draggingRowIndex !== null && this.makeDraggingRow()}
                <VirtualMove items={columns.data}>
                    {({ items, moveItem }) =>
                        items.map((column, i) => (
                            <Column
                                moveColumn={moveItem}
                                key={hashCode(column.id)}
                                index={i}
                                columns={
                                    {id: hashCode(columns.id), data: items}
                                }
                                rows={rows}
                                column={column}
                                width={widths[column.id]}
                                widths={widths}
                                heights={heights}
                                setRowHeight={this.props.setRowHeight}
                                rootHeight={rootHeight}
                                resizing={!!resizing.length}
                                onResizeColumn={this.onResizeColumn}
                                onResizeColumnStart={this.onResizeColumnStart}
                                onResizeColumnEnd={this.onResizeColumnEnd}
                                onRowDrag={this.onRowDrag}
                                onRowDelete={this.props.onRowDelete}
                                rowDraggingIndex={draggingRowIndex}
                                onColumnDrop={this.props.onColumnDrop}
                                columnDragInProgress={this.columnDragInProgress}
                                columnDraggingInProgress={
                                    columnDraggingInProgress
                                }
                                rowDraggingInProgress={rowDraggingInProgress}
                                onColumnAdd={this.props.onColumnAdd}
                                onColumnDelete={this.props.onColumnDelete}
                                customRenderer={this.props.customRenderer}
                                onCardClicked={this.props.onCardClicked}
                                onContextMenu={this.props.onContextMenu}
                                globalError={
                                    i == 0 ? this.props.globalError : null
                                }
                                errorStatus={
                                    i == 0 ? this.props.errorStatus : null
                                }
                                metricType={this.props.metricType}
                            />
                        ))
                    }
                </VirtualMove>
            </div>
        );
    }
}

export default Columns;
