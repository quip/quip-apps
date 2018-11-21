// Copyright 2017 Quip

import React from "react";
import quip from "quip";
import cx from "classnames";

import handleRichTextBoxKeyEventNavigation from "quip-apps-handle-richtextbox-key-event-navigation";
import {setFocusedStep} from "../menus";

import Styles from "./Step.less";
import Chevron from "quip-apps-chevron";

const VERTICAL_PADDING = 12;
const INPUT_HEIGHT = 19;

export default class Step extends React.Component {
    static propTypes = {
        record: React.PropTypes.instanceOf(quip.apps.RichTextRecord).isRequired,
        color: React.PropTypes.string.isRequired,
        width: React.PropTypes.number,
        onSelected: React.PropTypes.func.isRequired,
        onDelete: React.PropTypes.func.isRequired,
        selected: React.PropTypes.bool,
    };

    constructor(props) {
        super();
        this.state = {
            isContextMenuOpen: false,
        };
    }

    setSelected = () => {
        this.props.onSelected(this.props.record);
    };

    deleteStep = () => {
        this.props.onDelete(this.props.record);
    };

    showContextMenu = e => {
        if (this.state.isContextMenuOpen) {
            return;
        }
        this.setState({
            isContextMenuOpen: true,
        });
        let menuCommandIds = quip.apps.viewerCanSeeComments()
            ? ["comment", "deleteStep"]
            : ["deleteStep"];
        if (!this.props.selected) {
            menuCommandIds = [
                "selectStepFromMenu",
                quip.apps.DocumentMenuCommands.SEPARATOR,
                ...menuCommandIds,
            ];
        }
        quip.apps.showContextMenuFromButton(
            e.currentTarget,
            menuCommandIds,
            [], // highlighted
            [], // disabled
            () => {
                this.setState({
                    isContextMenuOpen: false,
                });
            },
            // contextArg
            {
                deleteStep: this.deleteStep,
                record: this.props.record,
            });
        e.preventDefault();
        e.stopPropagation();
    };

    noText = selection => selection.anchorNode.length == null;
    cursorOnRight = selection =>
        selection.anchorOffset === selection.anchorNode.length;
    cursorOnLeft = selection => selection.anchorOffset === 0;

    handleKeyEvent = e => {
        return handleRichTextBoxKeyEventNavigation(e, this.props.record);
    };

    handleBlur = e => {
        setFocusedStep(null);
    };

    handleFocus = e => {
        setFocusedStep(this.props.record.id());
    };

    render() {
        const {record, selected, color, width} = this.props;
        var extraRichTextBoxProps = {};
        if (quip.apps.isApiVersionAtLeast("0.1.039")) {
            extraRichTextBoxProps.allowedInlineStyles = [
                quip.apps.RichTextRecord.InlineStyle.ITALIC,
                quip.apps.RichTextRecord.InlineStyle.STRIKETHROUGH,
                quip.apps.RichTextRecord.InlineStyle.UNDERLINE,
                quip.apps.RichTextRecord.InlineStyle.CODE,
            ];
        }
        const style = {
            backgroundColor: selected
                ? quip.apps.ui.ColorMap[color].VALUE
                : quip.apps.ui.ColorMap[color].VALUE_LIGHT,
            borderColor: quip.apps.ui.ColorMap[color].VALUE_STROKE,
            paddingTop: VERTICAL_PADDING,
            paddingBottom: VERTICAL_PADDING,
        };
        if (width) {
            style.width = width;
        }
        return <div
            className={cx(Styles.step, {
                [Styles.selected]: selected,
                [Styles.fixedWidth]: !width,
            })}
            ref={node => {
                this._node = node;
                record.setDom(node);
            }}
            style={style}>
            <div className={Styles.contents}>
                <div className={Styles.label}>
                    <quip.apps.ui.RichTextBox
                        allowedStyles={[
                            quip.apps.RichTextRecord.Style.TEXT_PLAIN,
                        ]}
                        color={
                            selected ? quip.apps.ui.ColorMap.WHITE.KEY : color
                        }
                        handleKeyEvent={this.handleKeyEvent}
                        minHeight={INPUT_HEIGHT}
                        onBlur={this.handleBlur}
                        onFocus={this.handleFocus}
                        record={record}
                        useDocumentTheme={false}
                        width="100%"
                        {...extraRichTextBoxProps}/>
                </div>
                <div
                    className={cx(Styles.commentsTrigger, {
                        [Styles.commented]: record.getCommentCount() > 0,
                    })}>
                    <quip.apps.ui.CommentsTrigger
                        color={color}
                        invertColor={selected}
                        record={record}
                        showEmpty/>
                </div>
                <div className={Styles.chevron} onClick={this.showContextMenu}>
                    <Chevron
                        color={
                            selected
                                ? quip.apps.ui.ColorMap.WHITE.VALUE
                                : quip.apps.ui.ColorMap[color].VALUE
                        }/>
                </div>
            </div>
        </div>;
    }
}
