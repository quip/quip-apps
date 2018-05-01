// Copyright 2017 Quip

import React from "react";
import quip from "quip";
import cx from "classnames";

import handleRichTextBoxKeyEventNavigation from "quip-apps-handle-richtextbox-key-event-navigation";

import Chevron from "quip-apps-chevron";
import Styles from "./Option.less";

const {RichTextBox, CommentsTrigger} = quip.apps.ui;

const RETURN_KEY = 13;

const Checkmark = ({checked}) => <svg
    className={Styles.pollCheckmark}
    width="18"
    height="18"
    viewBox="0 0 18 18">
    <path d="M7.181,15.007a1,1,0,0,1-.793-0.391L3.222,10.5A1,1,0,1,1,4.808,9.274L7.132,12.3l6.044-8.86A1,1,0,1,1,14.83,4.569l-6.823,10a1,1,0,0,1-.8.437H7.181Z"/>
</svg>;

Checkmark.propTypes = {
    checked: React.PropTypes.bool,
};

export default class Option extends React.Component {
    static propTypes = {
        color: React.PropTypes.string.isRequired,
        isLast: React.PropTypes.bool,
        multiple: React.PropTypes.bool,
        onDelete: React.PropTypes.func.isRequired,
        onSelect: React.PropTypes.func.isRequired,
        record: React.PropTypes.instanceOf(quip.apps.Record).isRequired,
        selected: React.PropTypes.bool,
        textRecord: React.PropTypes.instanceOf(quip.apps.RichTextRecord)
            .isRequired,
        totalVotes: React.PropTypes.number,
        votesCount: React.PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            isContextMenuOpen: false,
        };
    }

    handleKeyEvent = e => {
        if (e.keyCode === RETURN_KEY) {
            return true;
        }

        return handleRichTextBoxKeyEventNavigation(e, this.props.record);
    };

    showContextMenu = e => {
        if (this.state.isContextMenuOpen) {
            return;
        }
        const context = {
            delete: this.deleteOption,
            record: this.props.record,
        };
        quip.apps.showContextMenuFromButton(
            e.currentTarget,
            ["comment", "delete"],
            [],
            [],
            () => {
                this.setState({
                    isContextMenuOpen: false,
                });
            },
            context);
        this.setState({
            isContextMenuOpen: true,
        });
    };

    selectOption = selected => {
        this.props.onSelect({option: this.props.record, selected});
    };

    deleteOption = () => {
        this.props.onDelete({option: this.props.record});
    };

    render() {
        const {
            record,
            textRecord,
            color,
            totalVotes,
            votesCount,
            selected,
            multiple,
        } = this.props;

        const user = quip.apps.getViewingUser();
        const progressPct = totalVotes ? votesCount / totalVotes * 100 : 0;
        var extraRichTextBoxProps = {};
        if (quip.apps.isApiVersionAtLeast("0.1.039")) {
            extraRichTextBoxProps.allowedInlineStyles = [
                quip.apps.RichTextRecord.InlineStyle.ITALIC,
                quip.apps.RichTextRecord.InlineStyle.STRIKETHROUGH,
                quip.apps.RichTextRecord.InlineStyle.UNDERLINE,
                quip.apps.RichTextRecord.InlineStyle.CODE,
            ];
        }
        return <div className={Styles.root} ref={node => record.setDom(node)}>
            {user &&
                multiple && <div
                    className={cx(Styles.inputCheckbox, {
                        [Styles.selected]: selected,
                    })}
                    onClick={() => this.selectOption(!selected)}
                    style={{
                        backgroundColor: selected
                            ? quip.apps.ui.ColorMap[color].VALUE
                            : "",
                    }}>
                    {selected && <Checkmark/>}
                </div>}

            {user &&
                !multiple && <div
                    className={cx(Styles.inputCircle, {
                        [Styles.selected]: selected,
                    })}
                    onClick={() => this.selectOption(!selected)}
                    style={{
                        backgroundColor: selected
                            ? quip.apps.ui.ColorMap[color].VALUE
                            : "",
                    }}/>}

            <div className={Styles.optionContainer}>
                <div
                    className={Styles.optionBorder}
                    style={{
                        borderColor: quip.apps.ui.ColorMap[color].VALUE_STROKE,
                    }}/>
                <div className={Styles.option}>
                    <div className={Styles.optionContents}>
                        <div className={Styles.label}>
                            <RichTextBox
                                color={color}
                                ref={c => (this._richTextBox = c)}
                                record={textRecord}
                                width="100%"
                                minHeight={20}
                                scrollable={false}
                                useDocumentTheme={false}
                                allowedStyles={[
                                    quip.apps.RichTextRecord.Style.TEXT_PLAIN,
                                ]}
                                handleKeyEvent={this.handleKeyEvent}
                                {...extraRichTextBoxProps}/>
                        </div>

                        <div
                            className={cx(Styles.commentsTrigger, {
                                [Styles.commented]:
                                    record.getCommentCount() > 0,
                            })}>
                            <CommentsTrigger
                                color={color}
                                record={record}
                                showEmpty/>
                        </div>

                        <div
                            className={cx(Styles.votes, {
                                [Styles.voted]: votesCount > 0,
                            })}
                            style={{
                                color: quip.apps.ui.ColorMap[color].VALUE,
                            }}>
                            {votesCount === 1
                                ? quiptext("1 vote")
                                : quiptext("%(count)s votes", {
                                      "count": votesCount,
                                  })}
                        </div>
                    </div>
                </div>

                <div className={Styles.dropdown} onClick={this.showContextMenu}>
                    <Chevron color={quip.apps.ui.ColorMap[color].VALUE}/>
                </div>

                <div
                    className={cx(Styles.progress, {
                        [Styles.progressFull]: progressPct === 100,
                        [Styles.progressEmpty]: progressPct === 0,
                    })}
                    style={{
                        backgroundColor:
                            quip.apps.ui.ColorMap[color].VALUE_LIGHT,
                        boxShadow: `-1px 0 0 ${
                            quip.apps.ui.ColorMap[color].VALUE_LIGHT
                        } inset`,
                        right: `${100 - progressPct}%`,
                        borderColor: quip.apps.ui.ColorMap[color].VALUE_STROKE,
                    }}/>
            </div>
        </div>;
    }
}
