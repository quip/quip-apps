// Copyright 2019 Quip

import React, {Component, ReactNode} from "react";
import {CanvasRecordCommentAnchorRecord} from "./canvas-record";
import Record from "./record";
import User from "./user";
import RichTextRecord from "./rich-text-record";

// TODO: handle children in this file correctly (if they differ from current
// handling) so that trees will be snapshottable

export class Button extends Component<{
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    primary?: boolean;
    text: ReactNode;
    type?: string;
    disabled?: boolean;
}> {
    render() {
        return React.createElement("div", undefined, "ui.Button");
    }
}

export class CalendarPicker extends Component<{
    initialSelectedDateMs: number;
    onChangeSelectedDateMs: (dateMs: number) => void;
}> {
    render() {
        return React.createElement("div", undefined, "ui.CalendarPicker");
    }
}

export class Canvas extends Component<{
    record: CanvasRecordCommentAnchorRecord;
    isCurrentlyAdding: boolean;
    isValid?: boolean;
    width: number;
    height: number;
}> {
    render() {
        return React.createElement("div", undefined, "ui.Canvas");
    }
}

type FocusSnapshot = {restore(): void};
type FocusLayer = {
    takeSnapshot(): FocusSnapshot;
};
class CoreFocusStack {
    push(focusLayer?: FocusLayer): FocusLayer {
        return focusLayer || this.newDefaultFocusLayer();
    }

    pop(focusLayer: FocusLayer) {}

    replaceRootLayer(layer: FocusLayer): FocusLayer {
        return layer;
    }

    popRootLayer(oldRootLayer: FocusLayer) {}

    newDefaultFocusLayer(): FocusLayer {
        return {
            takeSnapshot() {
                    return {
                        restore() {
                        },
                    };
            },
        };
    }
}
export const FocusStack = new CoreFocusStack();

export const Color = {
    TEXT: "#5c6470",
    SECONDARY_TEXT: "#8d95a1",
    ACTION: "#3d87f5",
    RED: "#ff3633",
    ORANGE: "#f26c0d",
    YELLOW: "#ffae00",
    GREEN: "#2cab21",
    BLUE: "#3d87f5",
    VIOLET: "#8d3df5",
    SELECTION: "#cadefc",
    WHITE: "#ffffff",
};

export const ColorMap = {
    RED: {
        KEY: "RED",
        LABEL: "Red",
        VALUE: Color.RED,
        VALUE_LIGHT: Color.RED,
        VALUE_STROKE: Color.RED,
    },
    ORANGE: {
        KEY: "ORANGE",
        LABEL: "Orange",
        VALUE: Color.ORANGE,
        VALUE_LIGHT: Color.ORANGE,
        VALUE_STROKE: Color.ORANGE,
    },
    YELLOW: {
        KEY: "YELLOW",
        LABEL: "Yellow",
        VALUE: Color.YELLOW,
        VALUE_LIGHT: Color.YELLOW,
        VALUE_STROKE: Color.YELLOW,
    },
    GREEN: {
        KEY: "GREEN",
        LABEL: "Green",
        VALUE: Color.GREEN,
        VALUE_LIGHT: Color.GREEN,
        VALUE_STROKE: Color.GREEN,
    },
    BLUE: {
        KEY: "BLUE",
        LABEL: "Blue",
        VALUE: Color.BLUE,
        VALUE_LIGHT: Color.BLUE,
        VALUE_STROKE: Color.BLUE,
    },
    VIOLET: {
        KEY: "VIOLET",
        LABEL: "Violet",
        VALUE: Color.VIOLET,
        VALUE_LIGHT: Color.VIOLET,
        VALUE_STROKE: Color.VIOLET,
    },
    WHITE: {
        KEY: "WHITE",
        LABEL: "White",
        VALUE: Color.WHITE,
        VALUE_LIGHT: Color.WHITE,
        VALUE_STROKE: Color.WHITE,
    },
};

export class CommentsTrigger extends Component<{
    /* One of `entity` or `record` must be provided */
    entity?: Record;
    /* One of `entity` or `record` must be provided */
    record?: Record;
    color?: keyof typeof ColorMap;
    invertColor?: boolean;
    showEmpty?: boolean;
    className?: string;
}> {
    render() {
        return React.createElement("div", undefined, "ui.CommentsTrigger");
    }
}

export class ProfilePicture extends Component<{
    user: User;
    size: number;
    round: boolean;
    fallbackToInitials: boolean;
}> {
    render() {
        return React.createElement("div", undefined, "ui.ProfilePicture");
    }
}

export enum Style {
    TEXT_PLAIN_STYLE = 0,
    TEXT_H1_STYLE = 1,
    TEXT_H2_STYLE = 2,
    TEXT_H3_STYLE = 3,
    TEXT_CODE_STYLE = 4,
    LIST_BULLET_STYLE = 5,
    LIST_NUMBERED_STYLE = 6,
    LIST_CHECKLIST_STYLE = 7,
    TABLE_BODY_STYLE = 8,
    TABLE_SPREADSHEET_STYLE = 13,
    TABLE_ROW_STYLE = 9,
    TABLE_COL_STYLE = 10,
    IMAGE_STYLE = 11,
    FORMULA_STYLE = 12,
    DEPRECATED_CHART_STYLE = 14,
    TEXT_BLOCKQUOTE_STYLE = 16,
    TEXT_PULL_QUOTE_STYLE = 17,
    HORIZONTAL_RULE_STYLE = 18,
    ELEMENT_BODY_STYLE = 19,
    ELEMENT_CHILD_STYLE = 20,
    ELEMENT_BODY_STUB_STYLE = 25,
    LAYOUT_FLEXBOX_STYLE = 21,
    LAYOUT_GRID_STYLE = 23,
    SLIDE_STYLE = 22,
    PRESENTATION_STYLE = 24,
    LAYOUT_READER_NOTES_STYLE = 26,
    CHART_STYLE = 27,
    SHAPE_STYLE = 29,
    FEEDBACK_STICKER_STYLE = 30,
    LIVE_CHART_STYLE = 31,
    TASK_STYLE = 32,
    VIDEO_STYLE = 33,
    DASHBOARD_CHART_STYLE = 34,
    LAYOUT_REFERENCED_STYLE = 35,
}

export class RichTextBox extends Component<{
    /* One of `entity` or `record` must be provided */
    entity?: RichTextRecord;
    /* One of `entity` or `record` must be provided */
    record?: RichTextRecord;
    scrollable?: boolean;
    width?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
    disableAutocomplete?: boolean;
    disableInlineMenus?: boolean;
    disableLinkification?: boolean;
    onComponentHeightChanged?: (height: number) => void;
    useDocumentTheme?: boolean;
    // More friendly way of controlling the allowed styles
    allowImages?: boolean;
    allowLists?: boolean;
    allowHeadings?: boolean;
    allowSpecialTextStyles?: boolean;
    allowHorizontalRules?: boolean;
    /* Supersedes any of the allow* props */
    allowedStyles?: Style[];
    allowedInlineStyles?: keyof typeof RichTextBox.InlineStyle[];
    maxListIndentationLevel?: number;
    readOnly?: boolean;
    disableSelection?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    handleKeyEvent?: (e: React.KeyboardEvent<any>) => void;
    color?: keyof typeof ColorMap;
}> {
    render() {
        return React.createElement("div", undefined, "ui.RichTextBox");
    }

    static InlineStyle: {[style: string]: string} = {
        BOLD: "editingStyle.BOLD",
        ITALIC: "editingStyle.ITALIC",
        UNDERLINE: "editingStyle.UNDERLINE",
        STRIKETHROUGH: "editingStyle.STRIKETHROUGH",
        CODE: "editingStyle.CODE",
    };
}

export class Spinner extends Component<{
    /** default: 40 */
    size?: number;
    padding?: number;
    /** default: #666 */
    color?: string;
    backgroundColor?: string;
    /** default: 1 */
    time?: number;
    width?: number;
    length?: number;
    /** default: 12 */
    numSpokes?: number;
    className?: string;
}> {
    render() {
        return React.createElement("div", undefined, "ui.Spinner");
    }
}
