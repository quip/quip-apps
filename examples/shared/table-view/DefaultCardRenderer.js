// Copyright 2017 Quip

import {
    COLUMN_TYPE,
    COMMENT_TRIGGER_MAKEUP,
} from "../../shared/table-view/model.js";

import Deadline from "./Cards/deadline.jsx";
import File from "./Cards/file.jsx";
import Owner from "./Cards/owner.jsx";
import Status from "./Cards/status.jsx";
import {CommentToggle} from "../table-view/lib/comment-component.jsx";

import styles from "./Card.less";

const LINE_HEIGHT = 17;

export const DefaultCardRenderer = () => {
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
        onCardBlurred,
        rowDraggingInProgress,
        columnDraggingInProgress,
        metricType,
        statusTypes) => {
        const record = quip.apps.getRecordById(cell.id);
        let cardComponent;
        const showComments = quip.apps.isMobile() || cardHovered || cardFocused;
        const displayStyleFn = showCommentIcon => {
            if (record.getColumn().getType() == COLUMN_TYPE.PERSON) {
                return {
                    "display": showCommentIcon ? "block" : "none",
                };
            } else {
                return {
                    "visibility": showCommentIcon ? "visible" : "hidden",
                };
            }
        };
        const commentsTrigger = <CommentToggle
            record={record}
            showComments={showComments}
            rowHeight={rowHeight}
            isFirstColumn={isFirstColumn}
            displayStyleFn={displayStyleFn}/>;

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
                                          height)
                                : undefined
                        }
                        onFocus={onCardFocused}
                        onBlur={onCardBlurred}/>
                </div>;
                break;
            case COLUMN_TYPE.PERSON:
                cardComponent = <Owner
                    availableWidth={width}
                    rowHeight={rowHeight}
                    record={record}
                    ref={el =>
                        record.setDom(el && ReactDOM.findDOMNode(el).parentNode)
                    }
                    projectRecord={quip.apps.getRecordById(row.text.data[0].id)}
                    metricType={metricType}
                    showComments={showComments}/>;
                break;
            case COLUMN_TYPE.STATUS:
                cardComponent = <Status
                    statusTypes={statusTypes}
                    textWidth={width - COMMENT_TRIGGER_MAKEUP}
                    rowHeight={rowHeight}
                    rootHeight={rootHeight}
                    record={record}
                    ref={el =>
                        record.setDom(el && ReactDOM.findDOMNode(el).parentNode)
                    }
                    metricType={metricType}/>;
                break;
            case COLUMN_TYPE.DATE:
                cardComponent = <Deadline
                    textWidth={width - COMMENT_TRIGGER_MAKEUP}
                    rowHeight={rowHeight}
                    record={record}
                    ref={el =>
                        record.setDom(el && ReactDOM.findDOMNode(el).parentNode)
                    }
                    metricType={metricType}/>;
                break;
            case COLUMN_TYPE.FILE:
                cardComponent = <File
                    textWidth={width - COMMENT_TRIGGER_MAKEUP}
                    record={record}
                    ref={el =>
                        record.setDom(el && ReactDOM.findDOMNode(el).parentNode)
                    }
                    metricType={metricType}/>;
                break;
        }
        return [cardComponent, commentsTrigger];
    };
};
