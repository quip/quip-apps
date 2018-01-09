// Copyright 2017 Quip

import {
    COLUMN_TYPE,
    COMMENT_TRIGGER_MAKEUP,
} from "../../shared/table-view/model.js";
import Deadline from "./Cards/Deadline";
import File from "./Cards/File";
import Owner from "./Cards/Owner";
import Status from "./Cards/Status";
import {
    CommentToggle,
    CommentVisibilityToggle,
    withCommentWidthToggle,
} from "../table-view/lib/comment-component.jsx";
import {Y_PADDING, Y_BORDER} from "./Card.js";

import cx from "classnames";
import styles from "./Card.less";

const CommentableDeadline = withCommentWidthToggle(Deadline);
const CommentableFile = withCommentWidthToggle(File);
const CommentableStatus = withCommentWidthToggle(Status);

const LINE_HEIGHT = 17;
const COMMENT_TRIGGER_HEIGHT = 13;

export const DefaultCardRenderer = statusTypes => {
    return (
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
        rowDraggingInProgress,
        columnDraggingInProgress,
        metricType) => {
        const record = quip.apps.getRecordById(cell.id);
        let cardComponent;
        const showComments = quip.apps.isMobile() || cardHovered || cardFocused;

        const commentsTriggerStyle = {
            alignSelf: "flex-start",
            position: "relative",
            top:
                (rowHeight -
                    (Y_BORDER + Y_PADDING) * 2 -
                    COMMENT_TRIGGER_HEIGHT) /
                2,
        };
        const commentsTrigger = <CommentVisibilityToggle
            record={record}
            showComments={showComments}>
            <span
                style={cardFocused ? commentsTriggerStyle : undefined}
                onClick={e => e.stopPropagation()}>
                <quip.apps.ui.CommentsTrigger
                    className={cx(styles.commentsTrigger, {
                        [styles.firstColumnComment]: isFirstColumn,
                    })}
                    record={record}
                    showEmpty/>
            </span>
        </CommentVisibilityToggle>;

        switch (record.getColumn().getType()) {
            case COLUMN_TYPE.TEXT:
                const isCardClamped = !cardFocused && !quip.apps.isMobile();
                cardComponent = <div
                    className={styles.richTextBoxWrapper}
                    ref={el => record.setDom(el && el.parentNode)}>
                    <quip.apps.ui.RichTextBox
                        readOnly={
                            rowDraggingInProgress || columnDraggingInProgress
                        }
                        disableSelection={
                            rowDraggingInProgress || columnDraggingInProgress
                        }
                        useDocumentTheme={false}
                        scrollable={!isCardClamped}
                        record={record.get("contents")}
                        minHeight={LINE_HEIGHT}
                        // Setting maxHeight is needed so that when the card is
                        // clamped and there are newline characters, the top
                        // lines of text are shown. Otherwise, lines in the
                        // middle could be shown.
                        maxHeight={isCardClamped ? LINE_HEIGHT * 2 : undefined}
                        onComponentHeightChanged={
                            setRowHeight &&
                            (!cardFocused || quip.apps.isMobile())
                                ? height =>
                                      setRowHeight(
                                          row.id,
                                          record.getColumn().getId(),
                                          height,
                                      )
                                : undefined
                        }
                        onFocus={() => onCardFocused(true)}
                        onBlur={() => onCardFocused(false)}/>
                </div>;
                break;
            case COLUMN_TYPE.PERSON:
                cardComponent = <CommentToggle
                    record={record}
                    ref={el =>
                        record.setDom(
                            el && ReactDOM.findDOMNode(el).parentNode)}
                    showComments={showComments}>
                    {comment => {
                        const paddingLeft = comment
                            ? COMMENT_TRIGGER_MAKEUP
                            : 0;
                        // This is equivalent to the comment trigger makeup
                        // minus the size of the comment bubble.
                        const paddingRight = comment ? 5 : 0;
                        return <Owner
                            availableWidth={width}
                            rowHeight={rowHeight}
                            rootHeight={rootHeight}
                            record={record}
                            paddingLeft={paddingLeft}
                            paddingRight={paddingRight}
                            showComments={showComments}
                            projectName={quip.apps
                                .getRecordById(row.text.data[0].id)
                                .get("contents")
                                .getTextContent()}
                            metricType={metricType}/>;
                    }}
                </CommentToggle>;
                break;
            case COLUMN_TYPE.STATUS:
                cardComponent = <CommentableStatus
                    statusTypes={statusTypes}
                    textWidth={width}
                    rowHeight={rowHeight}
                    rootHeight={rootHeight}
                    record={record}
                    ref={el =>
                        record.setDom(
                            el && ReactDOM.findDOMNode(el).parentNode)}
                    showComments={showComments}
                    metricType={metricType}/>;
                break;
            case COLUMN_TYPE.DATE:
                cardComponent = <CommentableDeadline
                    textWidth={width}
                    rowHeight={rowHeight}
                    rootHeight={rootHeight}
                    record={record}
                    ref={el =>
                        record.setDom(
                            el && ReactDOM.findDOMNode(el).parentNode)}
                    showComments={showComments}
                    metricType={metricType}/>;
                break;
            case COLUMN_TYPE.FILE:
                cardComponent = <CommentableFile
                    textWidth={width}
                    record={record}
                    ref={el =>
                        record.setDom(
                            el && ReactDOM.findDOMNode(el).parentNode)}
                    showComments={showComments}
                    metricType={metricType}/>;
                break;
        }
        return [cardComponent, commentsTrigger];
    };
};
