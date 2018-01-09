// Copyright 2017 Quip

import { toJSONPropTypeShape } from "./model.js";
import Columns from "./Columns";
import styles from "./table-view.less";
import VirtualMove from "./lib/VirtualMove";

export const HEADER_HEIGHT = 33;

const SCROLLBAR_HEIGHT = 17;
const SCROLLBAR_SPACING = 3;

const sum = (...nums) => nums.reduce((acc, num) => acc + num, 0);
const sumWidths = widths => sum(...Object.values(widths));
const getRowHeight = cellHeights => Math.max(...Object.values(cellHeights));
export const sumHeights = heights =>
    sum(...Object.values(heights).map(getRowHeight));

export class TableView extends React.Component {
    static propTypes = {
        columns: toJSONPropTypeShape("array"),
        rows: toJSONPropTypeShape("array"),
        widths: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
        heights: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
        setRowHeight: React.PropTypes.func,
        setWidths: React.PropTypes.func.isRequired,
        getMinWidth: React.PropTypes.func.isRequired,
        onRowDrop: React.PropTypes.func.isRequired,
        onRowDelete: React.PropTypes.func.isRequired,
        onColumnDrop: React.PropTypes.func.isRequired,
        onColumnAdd: React.PropTypes.func,
        onColumnDelete: React.PropTypes.func.isRequired,
        onResizeEnd: React.PropTypes.func,
        customRenderer: React.PropTypes.func,
        onCardClicked: React.PropTypes.func,
        onContextMenu: React.PropTypes.func,
        globalError: React.PropTypes.Component,
        errorStatus: React.PropTypes.string,
        metricType: React.PropTypes.string,
    };

    constructor(props) {
        super(props);
    }

    render() {
        let widths = this.props.widths;
        let heights = this.props.heights;
        const columns = this.props.columns;
        const rows = this.props.rows;
        const width = sumWidths(widths);
        const height =
            sumHeights(heights) +
            HEADER_HEIGHT -
            Object.keys(heights).length +
            SCROLLBAR_HEIGHT +
            SCROLLBAR_SPACING;
        const rowHeights = Object.keys(heights).reduce((acc, rowId) => {
            acc[rowId] = getRowHeight(heights[rowId]);
            return acc;
        }, {});
        return (
            <div
                id="root-el"
                style={{ width, height }}
                className={styles.wrapper}
            >
                <VirtualMove items={rows.data}>
                    {({ items, moveItem }) => (
                        <Columns
                            moveRow={moveItem}
                            rows={{ id: rows.id, data: items }}
                            columns={columns}
                            widths={widths}
                            heights={rowHeights}
                            rootHeight={height}
                            headerHeight={HEADER_HEIGHT}
                            setWidths={this.props.setWidths}
                            getMinWidth={this.props.getMinWidth}
                            setRowHeight={this.props.setRowHeight}
                            onRowDrop={this.props.onRowDrop}
                            onRowDelete={this.props.onRowDelete}
                            onColumnDrop={this.props.onColumnDrop}
                            onColumnAdd={this.props.onColumnAdd}
                            onColumnDelete={this.props.onColumnDelete}
                            onResizeEnd={this.props.onResizeEnd}
                            customRenderer={this.props.customRenderer}
                            onCardClicked={this.props.onCardClicked}
                            onContextMenu={this.props.onContextMenu}
                            globalError={this.props.globalError}
                            errorStatus={this.props.errorStatus}
                            metricType={this.props.metricType}
                        />
                    )}
                </VirtualMove>
            </div>
        );
    }
}
