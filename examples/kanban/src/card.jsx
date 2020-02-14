// Copyright 2017 Quip

/* eslint react/no-find-dom-node:0 */

import PropTypes from "prop-types";
import {Motion} from "react-motion";
import cx from "classnames";
import handleRichTextBoxKeyEventNavigation from "quip-apps-handle-richtextbox-key-event-navigation";
import {CardRecord, entityListener} from "./model.jsx";
import {
    animateTo,
    getCardToFocus,
    listenForCardFocus,
    unlistenForCardFocus,
} from "./root.jsx";

import Chevron from "quip-apps-chevron";

import Grabber from "./icons/Grabber.js";

import styles from "./card.less";

export const kHorizontalMargin = 4; // 4 * 2 = 8
const kPaddingBetweenCards = 12; // 8

class Card extends React.Component {
    static propTypes = {
        cardDraggableAreaHeight: PropTypes.number.isRequired,
        columnDragging: PropTypes.bool.isRequired,
        dragging: PropTypes.bool.isRequired,
        entity: PropTypes.instanceOf(CardRecord).isRequired,
        focused: PropTypes.bool.isRequired,
        left: PropTypes.number.isRequired,
        onContextMenu: PropTypes.func.isRequired,
        onHeightChanged: PropTypes.func.isRequired,
        onMouseDown: PropTypes.func.isRequired,
        selected: PropTypes.bool.isRequired,
        setFocusedCard: PropTypes.func.isRequired,
        top: PropTypes.number.isRequired,
        columnWidth: PropTypes.number.isRequired,
        isDraggingSomething: PropTypes.bool.isRequired,
        onCardRest: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            editing: false,
            commentHover: false,
        };
        // Each card calculates its height only after its remote editor has
        // first been rendered. Until then, it won"t be able to know its correct
        // y position in its column. When the card first renders in its
        // correct y position, this boolean is used to make sure it appears
        // at that position immediately, rather than animating to it.
        this.renderedWithHeight_ = false;
    }

    componentDidMount() {
        this.onCardFocus_();
        listenForCardFocus(this.onCardFocus_);
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.stopEditing_);
        if (this.props.dragging) {
            quip.apps.addDetachedNode(ReactDOM.findDOMNode(this));
        }
        if (!this.props.entity.isHeader())
            this.props.entity.supportsComments = () => true;
    }

    componentWillUnmount() {
        unlistenForCardFocus(this.onCardFocus_);
        quip.apps.removeEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.stopEditing_);
        if (this.props.dragging) {
            quip.apps.removeDetachedNode(ReactDOM.findDOMNode(this));
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.dragging != nextProps.dragging) {
            if (this.props.dragging) {
                quip.apps.removeDetachedNode(ReactDOM.findDOMNode(this));
            }
            if (nextProps.dragging) {
                quip.apps.addDetachedNode(ReactDOM.findDOMNode(this));
            }
        }
    }

    render() {
        const {
            columnDragging,
            entity,
            dragging,
            left,
            focused,
            selected,
            top,
            columnWidth,
            isDraggingSomething,
        } = this.props;

        const isMobile = quip.apps.isMobile();

        const isHeader = entity.isHeader();
        const showComments =
            (this.state.commentHover && !dragging) ||
            entity.getCommentCount() > 0 ||
            isMobile;

        // toUpperCase for backwards compat with kanban < 9-19-2017
        let entityColor = entity.getColor() && entity.getColor().toUpperCase();
        let richTextBoxColor = null;
        if (entityColor) {
            if (entityColor === "PURPLE") {
                entityColor = quip.apps.ui.ColorMap.VIOLET.KEY;
            }
            richTextBoxColor = selected
                ? quip.apps.ui.ColorMap.WHITE.KEY
                : quip.apps.ui.ColorMap[entityColor].KEY;
        }

        const style = {
            translateX: isDraggingSomething ? animateTo(left) : left,
            translateY:
                this.renderedWithHeight_ && isDraggingSomething
                    ? animateTo(top)
                    : top,
            zIndex: animateTo(2),
            scale: animateTo(1),
            draggingBoxShadowOpacity: animateTo(0),
        };
        let readOnly = false;
        if (dragging || columnDragging) {
            style.translateX = left;
            style.translateY = top;
            style.zIndex = 99;
            if (dragging) {
                style.draggingBoxShadowOpacity = animateTo(0.75);
            }
            readOnly = true;
        }
        if (entity.height > 0) {
            this.renderedWithHeight_ = true;
        }

        return <Motion
            style={style}
            onRest={() => {
                this.props.onCardRest(entity.id());
            }}>
            {({
                translateX,
                translateY,
                scale,
                draggingBoxShadowOpacity,
                zIndex,
            }) => {
                let style = {
                    width: columnWidth - kHorizontalMargin * 2,
                    // Yosemite fix
                    WebkitTransform: `translate3d(${translateX}px,
                            ${translateY}px, 0) scale(${scale})`,
                    transform: `translate3d(${translateX}px,
                        ${translateY}px, 0) scale(${scale})`,
                    boxShadow: `0px 5px 20px -10px rgba(0,0,0,${draggingBoxShadowOpacity})`,
                    zIndex: zIndex,
                };

                if (!isHeader) {
                    style.boxShadow += `, inset 0px 0px 0px 1px ${quip.elements.ui.ColorMap[entityColor].VALUE_STROKE}`;
                    style.backgroundColor = selected
                        ? quip.apps.ui.ColorMap[entityColor].VALUE
                        : quip.apps.ui.ColorMap[entityColor].VALUE_LIGHT;
                }
                var extraRichTextBoxProps = {};
                if (quip.apps.isApiVersionAtLeast("0.1.039")) {
                    extraRichTextBoxProps.allowedInlineStyles = [
                        quip.apps.RichTextRecord.InlineStyle.ITALIC,
                        quip.apps.RichTextRecord.InlineStyle.STRIKETHROUGH,
                        quip.apps.RichTextRecord.InlineStyle.UNDERLINE,
                        quip.apps.RichTextRecord.InlineStyle.CODE,
                    ];
                }

                return <div
                    ref={node => (entity.domNode = node)}
                    className={cx(styles.card, {
                        [styles.header]: isHeader,
                        [styles.selected]: selected,
                        [styles.isFocused]: focused,
                        [styles.dragging]: dragging,
                    })}
                    style={style}
                    onMouseEnter={this.onMouseEnter_}
                    onMouseLeave={this.onMouseLeave_}>
                    <div className={styles.titleRow}>
                        {isHeader && <div
                            ref={n => (this.commentWrapper = n)}
                            style={{
                                visibility: isMobile ? "hidden" : "",
                            }}
                            className={cx(
                                "quip-color-text-secondary",
                                styles.draggable,
                                styles.draggableHeader)}
                            onMouseDown={isMobile ? null : this.onMouseDown_}>
                            <Grabber/>
                        </div>}
                        <div className={styles.remoteEditor}>
                            <quip.apps.ui.RichTextBox
                                allowedStyles={[
                                    quip.apps.RichTextRecord.Style.TEXT_PLAIN,
                                ]}
                                color={richTextBoxColor}
                                scrollable={true}
                                width="100%"
                                onComponentHeightChanged={
                                    this.onEditorHeightChanged_
                                }
                                entity={entity}
                                readOnly={readOnly}
                                disableSelection={readOnly}
                                onFocus={this.onEditorFocus}
                                onBlur={this.stopEditing_}
                                useDocumentTheme={false}
                                handleKeyEvent={this.handleKeyEvent_}
                                {...extraRichTextBoxProps}/>
                        </div>
                        <div
                            className={styles.chevron}
                            onClick={this.onClickChevron_}>
                            <Chevron
                                color={
                                    richTextBoxColor &&
                                    quip.apps.ui.ColorMap[richTextBoxColor]
                                        .VALUE
                                }/>
                        </div>
                    </div>
                    {!isHeader && <div
                        ref={n => (this.commentWrapper = n)}
                        className={cx(styles.commentWrapper, {
                            [styles.draggable]: !isMobile,
                        })}
                        onMouseDown={isMobile ? null : this.onMouseDown_}>
                        <div
                            className={cx(styles.realCommentWrapper, {
                                [styles.realCommentWrapperHide]: !showComments,
                            })}>
                            <quip.apps.ui.CommentsTrigger
                                className={styles.commentsTrigger}
                                color={entityColor}
                                invertColor={selected}
                                entity={entity}
                                showEmpty={true}/>
                        </div>
                    </div>}
                </div>;
            }}
        </Motion>;
    }

    onEditorFocus = () => {
        this.props.setFocusedCard(this.props.entity);
    };

    onClickChevron_ = e => {
        this.props.onContextMenu(e, this.props.entity);
    };

    handleKeyEvent_ = e => {
        return handleRichTextBoxKeyEventNavigation(e, this.props.entity);
    };

    onMouseDown_ = e => {
        if (e.button !== 0) {
            return;
        }
        this.props.onMouseDown(e, this.props.entity);
    };

    onMouseEnter_ = () => this.setState({commentHover: true});
    onMouseLeave_ = () => this.setState({commentHover: false});

    onCardFocus_ = () => {
        const cardToFocus = getCardToFocus();
        if (cardToFocus && cardToFocus.id() === this.props.entity.id()) {
            this.startEditing_();
        }
    };

    onEditorHeightChanged_ = height => {
        this.props.entity.setHeight(
            height + kPaddingBetweenCards + this.commentWrapper.clientHeight);
        this.props.onHeightChanged();
    };

    startEditing_ = () => {
        if (!this.state.editing) {
            this.setState({editing: true}, () => this.props.entity.focus());
        }
    };

    stopEditing_ = () => {
        if (this.props.entity.isDeleted()) {
            return;
        }
        this.setState({editing: false});
    };
}
export default entityListener(Card);
