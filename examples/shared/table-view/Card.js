import React, {Component} from "react";
import {Motion} from "react-motion";
import cx from "classnames";
import {
    toJSONPropTypeShape,
    X_DELETE_MARGIN,
    X_SIZE,
    CARD_HORIZONTAL_PADDING,
} from "../../shared/table-view/model.js";
import ChevronDown from "./lib/components/icons/ChevronDown";
import Grabber from "./lib/components/icons/Grabber";
import {animateTo} from "./lib/animation";

const {RichTextBox} = quip.apps.ui;

import styles from "./Card.less";

const ENTER_KEYCODE = 13;
const ARROW_DOWN_KEYCODE = 40;
const ARROW_UP_KEYCODE = 38;

export const Y_PADDING = 5;
export const Y_BORDER = 1;
const GRABBER_HEIGHT = 19;
const ROW_CHEVRON_HEIGHT = 14;

const DEBUG_ROW_ORDER = false;
class Card extends Component {
    static propTypes = {
        // Required props
        width: React.PropTypes.number.isRequired,
        customRenderer: React.PropTypes.func.isRequired,
        onRowDelete: React.PropTypes.func.isRequired,
        onContextMenu: React.PropTypes.func,
        // Column records
        column: toJSONPropTypeShape("object"),
        // Row records
        row: toJSONPropTypeShape("object"),
        rows: toJSONPropTypeShape("array"),
        // Dragging
        onRowDrag: React.PropTypes.func,
        rowIndex: React.PropTypes.number,
        rowDraggingIndex: React.PropTypes.number,
        // Height getting / setting
        heights: React.PropTypes.object,
        rootHeight: React.PropTypes.number,
        setRowHeight: React.PropTypes.func,
        // Booleans
        isFirstRow: React.PropTypes.bool,
        isLastRow: React.PropTypes.bool,
        isFirstColumn: React.PropTypes.bool,
        isLastColumn: React.PropTypes.bool,
        isDraggingColumn: React.PropTypes.bool,
        columnDraggingInProgress: React.PropTypes.bool,
        rowDraggingInProgress: React.PropTypes.bool,
        onCardFocused: React.PropTypes.func,
        onCardClicked: React.PropTypes.func,
        metricType: React.PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            cardHovered: false,
            cardFocused: false,
        };
        /* This doesn't need to be on state because `showContextMenuFromButton`
         does the rendering */
        this.showRowMenu = false;
        this.cell = props.row[props.column.type].data.find(
            record => record.columnId === props.column.id);
    }

    componentWillReceiveProps(nextProps) {
        const {row, column} = nextProps;
        this.cell = row[column.type].data.find(
            record => record.columnId === column.id);
    }

    moveCursorBetweenRows(direction) {
        const {column, row, rows, onCardClicked} = this.props;
        const rowIndex = rows.data.findIndex(data => data.id === row.id);
        let moveTo;
        if (direction === "up") {
            moveTo = rowIndex - 1 >= 0 ? rowIndex - 1 : rows.data.length - 1;
        } else if (direction === "down") {
            moveTo = rowIndex + 1 <= rows.data.length - 1 ? rowIndex + 1 : 0;
        }

        if (onCardClicked) {
            const cell = rows.data[moveTo][column.type].data.find(
                record => record.columnId === column.id);
            onCardClicked(cell.id, column);
        }
        return true;
    }

    onCardFocused_ = isFocused => {
        if (isFocused) {
            quip.apps.addDetachedNode(ReactDOM.findDOMNode(this));
        } else {
            quip.apps.removeDetachedNode(ReactDOM.findDOMNode(this));
        }
        this.props.onCardFocused(isFocused);
        this.setState({
            cardFocused: isFocused,
        });
    };

    makeCard = (record, cardHovered, isFirstColumn) => {
        const {
            heights,
            row,
            rootHeight,
            setRowHeight,
            rowDraggingInProgress,
            columnDraggingInProgress,
        } = this.props;
        const rowHeight = heights[row.id];
        return this.props.customRenderer(
            record,
            row,
            cardHovered,
            isFirstColumn,
            this.props.width - CARD_HORIZONTAL_PADDING * 2,
            rowHeight,
            rootHeight,
            setRowHeight,
            this.state.cardFocused,
            this.onCardFocused_,
            rowDraggingInProgress,
            columnDraggingInProgress,
            this.props.metricType);
    };

    makePadding = isFirstColumn => {
        if (isFirstColumn) {
            return `${Y_PADDING}px ${CARD_HORIZONTAL_PADDING}px ${Y_PADDING}px 5px`;
        } else {
            return `${Y_PADDING}px ${CARD_HORIZONTAL_PADDING}px ${Y_PADDING}px ${CARD_HORIZONTAL_PADDING}px`;
        }
    };

    onMouseDown_ = e => {
        this.props.onRowDrag(e, this.props.row);
    };

    onCardHovered_ = isHovered => this.setState({cardHovered: isHovered});

    calcStyle = () => {
        const {
            rows,
            rowIndex,
            heights,
            rowDraggingInProgress,
            columnDraggingInProgress,
            isDraggingColumn,
        } = this.props;
        const disableAnimate =
            isDraggingColumn ||
            (!rowDraggingInProgress && !columnDraggingInProgress);
        // No rows means the Card is being dragged by the row so we dont need
        // to calc the style
        if (!rows) return {y: 0};

        const rowsBefore = rows.data.slice(0, rowIndex);
        const y = rowsBefore.reduce((acc, row) => acc + heights[row.id], 0);

        return {y: disableAnimate ? y : animateTo(y)};
    };

    toggleRowMenu = (e, row) => {
        e.stopPropagation();
        const command = "deleteRow";
        const commands = [command];
        const context = {
            [command]: () => {
                this.props.onRowDelete(row.id);
                return this.cell;
            },
        };

        if (!this.showRowMenu) {
            this.showRowMenu = true;
            if (this.props.onContextMenu) {
                this.props.onContextMenu(commands, context, this.cell);
            }
            quip.apps.showContextMenuFromButton(
                e.currentTarget,
                commands,
                [],
                [],
                () => {
                    this.showRowMenu = false;
                },
                context);
        } else {
            this.showRowMenu = false;
        }
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.rowDraggingIndex !== null) {
            const dragging = nextProps.rowDraggingIndex;
            const rowIndex = nextProps.rowIndex;
            if (rowIndex !== dragging - 1 && rowIndex !== dragging + 1) {
                return false;
            }
        }
        return true;
    }

    render() {
        const {
            width,
            heights,
            row,
            rows,
            isFirstRow,
            isLastRow,
            isFirstColumn,
            isLastColumn,
            rowIndex,
        } = this.props;
        const {cardHovered, cardFocused} = this.state;
        const {cell} = this;

        const rowHeight = heights[row.id];

        const grabberStyle = {
            alignSelf: "flex-start",
            position: "relative",
            top: (rowHeight - (Y_BORDER + Y_PADDING) * 2 - GRABBER_HEIGHT) / 2,
        };

        const rowChevronStyle = {
            alignSelf: "flex-start",
            position: "relative",
            top:
                (rowHeight - (Y_BORDER + Y_PADDING) * 2 - ROW_CHEVRON_HEIGHT) /
                2,
        };

        const cardComponent = this.makeCard(cell, cardHovered, isFirstColumn);
        return <Motion style={this.calcStyle()}>
            {({y}) => {
                const translateStr = `translate(0px, ${y - 1 - rowIndex}px)`;
                const cardWrapStyle = {
                    position: "absolute",
                    width: width,
                    transform: translateStr,
                    // Yosemite fix
                    WebkitTransform: translateStr,
                    height:
                        cardFocused && !quip.apps.isMobile()
                            ? undefined
                            : rowHeight,
                    minHeight: cardFocused ? rowHeight : undefined,
                    zIndex: cardFocused ? 100 : undefined,
                };
                const cardStyle = {
                    position: "relative",
                    height:
                        cardFocused && !quip.apps.isMobile()
                            ? undefined
                            : rowHeight,
                    minHeight: cardFocused ? rowHeight : undefined,
                    width: isFirstColumn ? width : width + 1,
                    left: isFirstColumn ? "0px" : "-1px",
                    padding: this.makePadding(isFirstColumn),
                };
                return <div
                    style={cardWrapStyle}
                    className={styles.wrapper}
                    onClick={() =>
                        this.props.onCardClicked &&
                        this.props.onCardClicked(cell.id, this.props.column)
                    }
                    onMouseEnter={() => this.onCardHovered_(true)}
                    onMouseLeave={() => this.onCardHovered_(false)}>
                    {DEBUG_ROW_ORDER &&
                        isFirstColumn && <div className={styles.debugOrder}>
                            {rows &&
                                rows.data.findIndex(
                                    data => data.id === row.id)};
                        </div>}
                    <div
                        style={cardStyle}
                        className={cx(styles.card, {
                            [styles.cardFocused]: cardFocused,
                            [styles.cardClamped]:
                                !cardFocused && !quip.apps.isMobile(),
                            [styles.firstRow]: isFirstRow,
                            [styles.lastRow]: isLastRow,
                            [styles.firstColumn]: isFirstColumn,
                            [styles.lastColumn]: isLastColumn,
                        })}>
                        {isFirstColumn && <div
                            style={cardFocused ? grabberStyle : undefined}
                            className={styles.grabber}
                            onMouseDown={this.onMouseDown_}>
                            {!quip.apps.isMobile() && <Grabber/>}
                        </div>}
                        {cardComponent}
                        {isFirstColumn && <div
                            key={row.id}
                            style={cardFocused ? rowChevronStyle : undefined}
                            className={styles.rowChevron}
                            onClick={e => this.toggleRowMenu(e, row)}>
                            <ChevronDown/>
                        </div>}
                    </div>
                </div>;
            }}
        </Motion>;
    }
}

export default Card;
