// Copyright 2017 Quip

import AddCard, { kAddCardHeight } from "./add-card.jsx";
import Card from "./card.jsx";
import { showCardContextMenu } from "./menus.js";
import { BoardEntity, entityListener } from "./model.jsx";
import getClosest from "./getClosest";

import styles from "./board.less";

export const kColumnWidth = 269; // 800 / 3 columns
const kCardDropTargetMargin = 3;
const cardDraggableAreaHeight = 20;

const minDragXYDiff = 15;

class Board extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(BoardEntity).isRequired,
        onSelectedCardChanged: React.PropTypes.func.isRequired,
        focusOnMount: React.PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            contextMenuCard: null,
            dragCurrentX: undefined,
            dragCurrentY: undefined,
            draggingCard: undefined,
            dragStartX: undefined,
            dragStartY: undefined,
            dropTargetColumnId: undefined,
            dropTargetIndex: undefined,
            focused: props.focusOnMount,
            focusedCard: undefined,
            isDraggingSomething: false,
            selectedCard: undefined,
        };
        this.width_ = 0;
        this.height_ = 0;
    }

    componentDidMount() {
        window.addEventListener("mousemove", this.onMouseMove_);
        window.addEventListener("mouseup", this.onMouseUp_);
        window.addEventListener("click", this.onClick_);
        window.addEventListener("keyup", this.onKeyUp_);
        quip.elements.addEventListener(
            quip.elements.EventType.ELEMENT_BLUR,
            this.onBlur_,
        );
        //this.onCardFocus_();
        //listenForCardFocus(this.onCardFocus_);
    }

    componentWillUnmount() {
        window.removeEventListener("mousemove", this.onMouseMove_);
        window.removeEventListener("mouseup", this.onMouseUp_);
        window.removeEventListener("click", this.onClick_);
        window.removeEventListener("keyup", this.onKeyUp_);
        quip.elements.removeEventListener(
            quip.elements.EventType.ELEMENT_BLUR,
            this.onBlur_,
        );
        //unlistenForCardFocus(this.onCardFocus_);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedCard !== this.state.selectedCard) {
            this.props.onSelectedCardChanged(this.state.selectedCard);
        }
    }

    render() {
        const {
            draggingCard,
            columnDropTargetIndex,
            cardDropTargetColumnId,
            cardDropTargetIndex,
        } = this.getCurrentDragState_();
        const { isDraggingSomething } = this.state;
        let children = [];
        let left = 0;
        this.props.entity.getColumns().forEach((columnEntity, i) => {
            const columnDragging = Boolean(
                draggingCard &&
                    draggingCard.isHeader() &&
                    draggingCard.getColumn().id() === columnEntity.id(),
            );
            const dropTargetIndex =
                columnEntity.id() === cardDropTargetColumnId
                    ? cardDropTargetIndex
                    : undefined;
            if (columnDropTargetIndex === 0 && i === 0) {
                children.push(
                    <ColumnDropTarget key="column-drop-target" left={left} />,
                );
                left += kColumnWidth;
            }
            children = children.concat(
                this.getColumnContents_(
                    columnEntity,
                    columnDragging && i > columnDropTargetIndex
                        ? left - kColumnWidth
                        : left,
                    columnDragging,
                    draggingCard,
                    dropTargetIndex,
                    isDraggingSomething,
                ),
            );
            if (!columnDragging) {
                left += kColumnWidth;
            }
            if (
                columnDropTargetIndex !== undefined &&
                i === columnDropTargetIndex - 1
            ) {
                children.push(
                    <ColumnDropTarget key="column-drop-target" left={left} />,
                );
                left += kColumnWidth;
            }
        });

        return (
            <div
                ref={ref => {
                    this._ref = ref;
                }}
                onMouseDown={e => {
                    if (e.target === this._ref) this.setFocusedCard(null);
                }}
                className={styles.board}
                style={this.computeDimensions_()}
                tabIndex="0"
            >
                {children}
            </div>
        );
    }

    getColumnContents_(
        columnEntity,
        left,
        columnDragging,
        draggingCard,
        dropTargetIndex,
        isDraggingSomething,
    ) {
        const {
            selectedCard,
            dragStartX,
            dragStartY,
            dragCurrentX,
            dragCurrentY,
        } = this.state;
        const columnSelected = Boolean(
            selectedCard &&
                selectedCard.isHeader() &&
                selectedCard.getColumn().id() === columnEntity.id(),
        );
        let contents = [];
        let top = 0;
        if (columnDragging) {
            top += dragCurrentY - dragStartY;
            left += dragCurrentX - dragStartX;
        }
        const kCardDropTargetHeight =
            (draggingCard && draggingCard.getHeight()) || 0;
        columnEntity.getCards().forEach((cardEntity, i) => {
            const selected = Boolean(
                this.state.selectedCard &&
                    cardEntity.id() === this.state.selectedCard.id(),
            );
            const focused = Boolean(
                this.state.focusedCard &&
                    cardEntity.id() === this.state.focusedCard.id(),
            );
            const dragging = Boolean(
                !columnDragging &&
                    draggingCard &&
                    cardEntity.id() === draggingCard.id(),
            );

            let cardTop = top;
            let cardLeft = left;
            if (dragging) {
                cardTop += dragCurrentY - dragStartY;
                cardLeft += dragCurrentX - dragStartX;
                if (i === dropTargetIndex || i > dropTargetIndex) {
                    cardTop -= kCardDropTargetHeight;
                }
            }

            contents.push(
                <Card
                    cardDraggableAreaHeight={cardDraggableAreaHeight}
                    columnDragging={columnDragging}
                    dragging={dragging}
                    entity={cardEntity}
                    focused={focused}
                    isDraggingSomething={isDraggingSomething}
                    key={cardEntity.id()}
                    left={cardLeft}
                    onCardRest={this.onCardRest_}
                    onContextMenu={this.onCardContextMenu_}
                    onHeightChanged={this.onCardHeightChanged_}
                    onMouseDown={this.onCardMouseDown_}
                    selected={selected}
                    setFocusedCard={this.setFocusedCard}
                    top={cardTop}
                />,
            );

            if (!dragging) {
                if (i === 0)
                    top += cardEntity.getHeight() - cardDraggableAreaHeight;
                else top += cardEntity.getHeight();
            }

            if (dropTargetIndex !== undefined && i === dropTargetIndex - 1) {
                contents.push(
                    <CardDropTarget
                        key="card-drop-target"
                        top={top}
                        left={left}
                    />,
                );
                top += kCardDropTargetHeight;
            }
        });

        contents.push(
            <AddCard
                key={`${columnEntity.id()}-add-card`}
                columnEntity={columnEntity}
                top={top}
                left={left}
                columnSelected={columnSelected}
                columnDragging={columnDragging}
                cardDragging={!columnDragging && !!draggingCard}
                isDraggingSomething={isDraggingSomething}
                hidden={false}
            />,
        );

        return contents;
    }

    onClick_ = e => {
        const isClickInCard = !!getClosest(e.target, ".card__card");
        if (!isClickInCard) {
            this.setState({
                focusedCard: null,
                selectedCard: null,
            });
        }
    };

    onKeyUp_ = e => {
        switch (e.keyCode) {
            case 8: {
                // Delete
                const selectedCard = this.state.selectedCard;
                if (selectedCard && !selectedCard.hasFocus()) {
                    if (selectedCard.isHeader()) {
                        selectedCard.getColumn().delete();
                    } else {
                        selectedCard.delete();
                    }
                    this.setState({ focusedCard: null, selectedCard: null });
                }
                break;
            }
        }
    };

    onBlur_ = () => {
        this.setState({
            selectedCard: null,
            focusedCard: null,
        });
    };

    setFocusedCard = cardEntity => {
        this.setState({
            focusedCard: cardEntity,
            selectedCard: null,
        });
    };

    onCardContextMenu_ = (e, cardEntity) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.contextMenuCard) {
            return;
        }
        this.setState({
            focusedCard: null,
            selectedCard: null,
            contextMenuCard: cardEntity,
        });
        showCardContextMenu(e.currentTarget, cardEntity, () => {
            this.setState({
                contextMenuCard: null,
            });
        });
    };

    onCardMouseDown_ = (e, cardEntity) => {
        this.isDraggingSomethingCard = cardEntity;
        this.setState({
            draggingCard: cardEntity,
            dragStartX: e.pageX,
            dragStartY: e.pageY,
            dragCurrentX: e.pageX,
            dragCurrentY: e.pageY,
            focusedCard: null,
            isDraggingSomething: true,
            selectedCard: cardEntity,
        });
    };

    onMouseMove_ = e => {
        if (this.state.draggingCard) {
            e.preventDefault();
            this.setState({
                dragCurrentX: e.pageX,
                dragCurrentY: e.pageY,
            });
        }
    };

    onMouseUp_ = () => {
        const draggingCard = this.state.draggingCard;
        if (draggingCard) {
            const {
                dragStartX,
                dragStartY,
                dragCurrentX,
                dragCurrentY,
            } = this.state;
            const {
                columnDropTargetIndex,
                cardDropTargetColumnId,
                cardDropTargetIndex,
            } = this.getCurrentDragState_();
            this.setState({
                draggingCard: undefined,
            });
            if (
                !(
                    Math.abs(dragStartY - dragCurrentY) > minDragXYDiff ||
                    Math.abs(dragStartX - dragCurrentX) > minDragXYDiff
                )
            ) {
                return;
            }

            if (columnDropTargetIndex !== undefined) {
                this.props.entity.moveColumn(
                    draggingCard.getColumn(),
                    columnDropTargetIndex,
                );
            } else if (cardDropTargetIndex !== undefined) {
                for (const columnEntity of this.props.entity.getColumns()) {
                    if (cardDropTargetColumnId === columnEntity.id()) {
                        if (
                            columnEntity.id() === draggingCard.getColumn().id()
                        ) {
                            columnEntity.moveCard(
                                draggingCard,
                                cardDropTargetIndex,
                            );
                        } else {
                            columnEntity.insertCard(
                                draggingCard,
                                cardDropTargetIndex,
                            );
                        }
                        break;
                    }
                }
            }
        }
    };

    onCardRest_ = entityId => {
        if (
            this.isDraggingSomethingCard &&
            entityId === this.isDraggingSomethingCard.id()
        ) {
            if (
                this.state.draggingCard &&
                this.state.draggingCard.id() === entityId
            ) {
                return;
            }
            this.isDraggingSomethingCard = null;
            this.setState({
                isDraggingSomething: false,
            });
        }
    };

    onCardHeightChanged_ = () => {
        this.forceUpdate();
    };

    getCurrentDragState_() {
        const {
            draggingCard,
            dragStartX,
            dragStartY,
            dragCurrentX,
            dragCurrentY,
        } = this.state;
        if (
            !draggingCard ||
            (dragCurrentX === dragStartX && dragCurrentY === dragStartY)
        ) {
            return {
                draggingCard: undefined,
                columnDropTargetIndex: undefined,
                cardDropTargetColumnId: undefined,
                cardDropTargetIndex: undefined,
            };
        }

        let { centerX, centerY } = this.computeCardPosition_(draggingCard);
        centerX += dragCurrentX - dragStartX;
        centerY += dragCurrentY - dragStartY;
        if (draggingCard.isHeader()) {
            return {
                draggingCard: draggingCard,
                columnDropTargetIndex: this.computeColumnDropTarget_(
                    draggingCard.getColumn(),
                    centerX,
                ),
                cardDropTargetColumnId: undefined,
                cardDropTargetIndex: undefined,
            };
        } else {
            const { targetColumnId, targetIndex } = this.computeCardDropTarget_(
                draggingCard,
                centerX,
                centerY,
            );
            return {
                draggingCard: draggingCard,
                columnDropTargetIndex: undefined,
                cardDropTargetColumnId: targetColumnId,
                cardDropTargetIndex: targetIndex,
            };
        }
    }

    computeCardPosition_(cardEntity) {
        const columnEntity = cardEntity.getColumn();
        let left = 0;
        for (const column of this.props.entity.getColumns()) {
            if (column.id() === columnEntity.id()) {
                break;
            }
            left += kColumnWidth;
        }
        let top = 0;
        for (const card of columnEntity.getCards()) {
            if (card.id() === cardEntity.id()) {
                break;
            }
            top += card.getHeight();
        }
        return {
            centerX: left + kColumnWidth / 2,
            centerY: top + cardEntity.getHeight() / 2,
        };
    }

    computeColumnDropTarget_(draggingColumn, xPosition) {
        let targetIndex = 0;
        let currentColumnLeft = 0;
        const columns = this.props.entity.getColumns();
        for (let i = 0; i < columns.length; i++) {
            if (xPosition < currentColumnLeft) {
                break;
            }
            targetIndex = i;
            if (columns[i].id() !== draggingColumn.id()) {
                currentColumnLeft += kColumnWidth;
            }
        }
        if (xPosition > currentColumnLeft) {
            targetIndex++;
        }
        return targetIndex;
    }

    computeCardDropTarget_(draggingCard, xPosition, yPosition) {
        const columns = this.props.entity.getColumns();
        let targetColumn = columns[0];
        for (let i = 0; i < columns.length; i++) {
            if (xPosition < kColumnWidth * i) {
                break;
            }
            targetColumn = columns[i];
        }
        const cards = targetColumn.getCards();
        let targetIndex = 0;
        let currentCardTop = 0;
        for (let i = 0; i < cards.length; i++) {
            if (!cards[i].isHeader() && yPosition < currentCardTop) {
                break;
            }
            targetIndex = i;
            if (cards[i].id() !== draggingCard.id()) {
                currentCardTop += cards[i].getHeight();
            }
        }
        if (yPosition > currentCardTop) {
            targetIndex++;
        }
        // Don't insert before a header.
        targetIndex = Math.max(targetIndex, 1);
        return {
            targetColumnId: targetColumn.id(),
            targetIndex: targetIndex,
        };
    }

    computeDimensions_ = () => {
        const width = kColumnWidth * this.props.entity.getColumns().length;
        let height = this.props.entity.calculateHeight();
        if (height !== 0) {
            height = height + kAddCardHeight;
        }
        return { width, height };
    };
}
export default entityListener(Board);

class ColumnDropTarget extends React.Component {
    static propTypes = {
        left: React.PropTypes.number.isRequired,
    };

    render() {
        return (
            <div
                className={styles.columnDropTarget}
                style={{ left: this.props.left }}
            />
        );
    }
}

class CardDropTarget extends React.Component {
    static propTypes = {
        top: React.PropTypes.number.isRequired,
        left: React.PropTypes.number.isRequired,
    };

    render() {
        return (
            <div
                className={styles.cardDropTarget}
                style={{
                    top: this.props.top,
                    left: this.props.left + kCardDropTargetMargin,
                    width: kColumnWidth - kCardDropTargetMargin * 2,
                }}
            />
        );
    }
}
