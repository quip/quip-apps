// Copyright 2017 Quip
//import quip from "quip";

export const kDefaultColumnColors = [
    quip.elements.ui.ColorMap.RED.KEY,
    quip.elements.ui.ColorMap.YELLOW.KEY,
    quip.elements.ui.ColorMap.BLUE.KEY,
    quip.elements.ui.ColorMap.GREEN.KEY,
    quip.elements.ui.ColorMap.ORANGE.KEY,
    quip.elements.ui.ColorMap.VIOLET.KEY,
];

const ACTIVITY_LOG_MESSAGES = {
    ADD_COLUMN: () => {
        return "added a column.";
    },
    REMOVE_COLUMN: columnText => {
        return `removed a column: "${columnText}".`;
    },
    ADD_CARD: () => {
        return "added a card.";
    },
    REMOVE_CARD: cardText => {
        return `removed a card: "${cardText}".`;
    },
    MOVE_CARD: (prevColumnName, nextColumnName) => {
        return `moved a card from "${prevColumnName}" to "${nextColumnName}".`;
    },
};

export class BoardEntity extends quip.elements.RootEntity {
    static getProperties() {
        return {
            columns: quip.elements.RecordList.Type(ColumnEntity),
            // TODO(elsigh): why not just compute this?
            nextColumnColor: "string",
        };
    }

    static getDefaultProperties() {
        return { columns: [] };
    }

    static DATA_VERSION = 2;

    initialize() {
        this.get("columns").listen(() => this.notifyListeners());
    }

    getColumns() {
        return this.get("columns").getRecords();
    }

    addColumn(headerText) {
        const color = this.getNextColumnColor_();
        let index = this.get("columns").count();
        let newColumn = this.get("columns").add({ color }, index);
        newColumn.addCard(true, headerText, 0);
        newColumn.addCard(false, "", 1);
        //quip.elements.sendMessage(ACTIVITY_LOG_MESSAGES.ADD_COLUMN());
        quip.elements.recordQuipMetric("add_column");
        return newColumn;
    }

    moveColumn(columnEntity, index) {
        this.get("columns").move(columnEntity, index);
        quip.elements.recordQuipMetric("move_column");
    }

    calculateHeight() {
        let height = 0;
        this.getColumns().forEach(column => {
            height = Math.max(column.calculateHeight(), height);
        });
        return height;
    }

    getNextColumnColor_() {
        const color =
            this.getProperty("nextColumnColor") || kDefaultColumnColors[0];
        const index = kDefaultColumnColors.indexOf(color);
        const nextColor =
            index === kDefaultColumnColors.length - 1
                ? kDefaultColumnColors[0]
                : kDefaultColumnColors[index + 1];
        this.setProperty("nextColumnColor", nextColor);
        return color;
    }
}

export class ColumnEntity extends quip.elements.Record {
    static getProperties() {
        return {
            color: "string",
            cards: quip.elements.RecordList.Type(CardEntity),
        };
    }

    static getDefaultProperties() {
        return { cards: [] };
    }

    initialize() {
        const listener = quip.elements
            .getRootEntity()
            .notifyListeners.bind(quip.elements.getRootEntity());
        this.listen(listener);
        this.get("cards").listen(listener);
    }

    getColor() {
        return this.getProperty("color");
    }

    setColor(color) {
        quip.elements.recordQuipMetric("set_color");
        this.setProperty("color", color);
    }

    getCards() {
        return this.get("cards").getRecords();
    }

    getHeader() {
        const cards = this.getCards();
        return cards.length > 0 ? cards[0] : null;
    }

    getFirstCard() {
        const cards = this.getCards();
        return cards.length ? cards[0] : null;
    }

    getLastCard() {
        const cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    }

    addCard(isHeader, defaultText, index) {
        let defaultPlaceholderText = isHeader ? "New Title" : "New Card";
        quip.elements.recordQuipMetric("add_card");
        return this.get("cards").add(
            {
                isHeader,
                RichText_defaultText:
                    isHeader && defaultText ? defaultText : null,
                RichText_placeholderText: !defaultText
                    ? defaultPlaceholderText
                    : null,
            },
            index,
        );
    }

    insertCard(cardEntity, index) {
        const prevColumnName = cardEntity
            .getColumn()
            .getHeader()
            .getTextContent()
            .trim();
        this.get("cards").move(cardEntity, index);
        const nextColumnName = cardEntity
            .getColumn()
            .getHeader()
            .getTextContent()
            .trim();
        //quip.elements.sendMessage(
        //    ACTIVITY_LOG_MESSAGES.MOVE_CARD(prevColumnName, nextColumnName),
        //);
        quip.elements.recordQuipMetric("move_card");
    }

    moveCard(cardEntity, index) {
        this.get("cards").move(cardEntity, index);
    }

    calculateHeight() {
        let height = 0;
        this.getCards().forEach(card => {
            height += card.getHeight();
        });
        return height;
    }

    deleteColumn() {
        /*quip.elements.sendMessage(
            ACTIVITY_LOG_MESSAGES.REMOVE_COLUMN(
                this.getHeader()
                    .getTextContent()
                    .trim(),
            ),
        );*/
        super.delete();
        quip.elements.recordQuipMetric("delete_column");
    }

    getNextColumn() {
        return this.getNextSibling();
    }

    getPreviousColumn() {
        return this.getPreviousSibling();
    }
}
ColumnEntity.CONSTRUCTOR_KEY = "kanban-column";

export class CardEntity extends quip.elements.RichTextEntity {
    static getProperties() {
        return {
            isHeader: "boolean",
            color: "string",
        };
    }

    initialize() {
        this.height = 0;
        this.domNode = undefined;
        this.listenToComments(() => this.notifyListeners());
    }

    getDom() {
        return this.domNode;
    }

    supportsComments() {
        return !this.isHeader();
    }

    isHeader() {
        return this.getProperty("isHeader");
    }

    getColor() {
        return this.isHeader()
            ? undefined
            : this.getIntrinsicColor() || this.getParentRecord().getColor();
    }

    getIntrinsicColor() {
        return this.getProperty("color");
    }

    setColor(color) {
        if (!this.isHeader()) {
            this.setProperty("color", color);
        }
    }

    clearColor() {
        this.setColor(undefined);
    }

    getColumn() {
        return this.getParentRecord();
    }

    getHeight() {
        if (this.isHeader()) {
            // All headers should match the height of the tallest header.
            const headers = quip.elements
                .getRootEntity()
                .getColumns()
                .map(column => column.getHeader());
            return headers
                .map(header => (header ? header.height : 0))
                .reduce((height1, height2) => Math.max(height1, height2));
        } else {
            return this.height;
        }
    }

    setHeight(height) {
        this.height = height;
    }

    deleteCard() {
        /*quip.elements.sendMessage(
            ACTIVITY_LOG_MESSAGES.REMOVE_CARD(this.getTextContent().trim()),
        );*/
        super.delete();
        quip.elements.recordQuipMetric("delete_card");
    }

    getPreviousSibling() {
        let prev = super.getPreviousSibling();
        if (!prev) {
            const previousColumn = this.getColumn().getPreviousSibling();
            if (previousColumn) {
                prev = previousColumn.getLastCard();
            }
            if (!prev) {
                const cols = this.getColumn()
                    .getContainingList()
                    .getRecords();
                prev = cols[cols.length - 1].getLastCard();
            }
        }
        while (prev && prev.isHeader()) {
            prev = prev.getPreviousSibling();
        }
        return prev;
    }

    getNextSibling() {
        let next = super.getNextSibling();
        if (!next) {
            const nextColumn = this.getColumn().getNextSibling();
            if (nextColumn) {
                next = nextColumn.getHeader().getNextSibling();
            }
            if (!next) {
                next = this.getColumn()
                    .getContainingList()
                    .getRecords()[0]
                    .getFirstCard();
            }
        }
        while (next && next.isHeader()) {
            next = next.getNextSibling();
        }
        return next;
    }
}
CardEntity.CONSTRUCTOR_KEY = "kanban-card";

export function entityListener(WrappedComponent) {
    return class EntityListenerComponent extends React.Component {
        static propTypes = {
            entity: React.PropTypes.instanceOf(quip.elements.Entity),
        };

        componentDidMount() {
            this.props.entity.listen(this.onEntityChange_);
        }

        componentWillUnmount() {
            this.props.entity.unlisten(this.onEntityChange_);
        }

        render() {
            return <WrappedComponent {...this.props} />;
        }

        onEntityChange_ = () => {
            this.forceUpdate();
        };
    };
}
