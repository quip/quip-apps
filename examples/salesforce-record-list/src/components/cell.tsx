// Copyright 2019 Quip

import React from "react";
import PropTypes, {InferProps} from "prop-types";
import quip from "quip-apps-api";
import {Datepicker, SLDSCheckbox} from "@salesforce/design-system-react";
import classNames from "classnames";
import _ from "quiptext";
import EditDialog, {isEditable} from "./edit-dialog";
import Styles from "./cell.less";
import CellComment from "../model/cell-comment";
import {htmlUnescape} from "../lib/util";
import {parsers, formatters} from "../lib/format";
import {DateTime} from "luxon";
import {ColumnInfo} from "../lib/salesforce-responses";
import {
    SalesforceListCellData,
    SalesforceListCellSchema,
} from "../model/salesforce-list";
import CellTextInput from "./cell-text-input";

const specialTypes = new Set(["__UNKNOWN", "__REFERENCE", "Date", "Boolean"]);
const hasWarned = new Set();

interface CellProps extends InferProps<typeof Cell.propTypes> {
    onChangeValue: (value: any) => void;
    onResetValue: () => void;
    onCreateComment: (domNode: Node) => CellComment;
    onClickReference: (relativeUrl: string) => void;
    column: ColumnInfo;
    data: SalesforceListCellData;
    schema: SalesforceListCellSchema;
}

interface CellState {
    showDialog: boolean;
    hasComments: boolean;
}

export default class Cell extends React.Component<CellProps, CellState> {
    static propTypes = {
        onChangeValue: PropTypes.func.isRequired,
        onResetValue: PropTypes.func.isRequired,
        onCreateComment: PropTypes.func.isRequired,
        onClickReference: PropTypes.func.isRequired,
        isReadOnly: PropTypes.bool,
        truncateContent: PropTypes.bool,
        column: PropTypes.object.isRequired,
        data: PropTypes.object.isRequired,
        isDirty: PropTypes.bool.isRequired,
        comment: PropTypes.instanceOf(CellComment),
        schema: PropTypes.object,
        width: PropTypes.number,
    };

    static contextTypes = {
        addingComment: PropTypes.bool,
        toggleAddingComment: PropTypes.func,
    };

    private currentComment_: CellComment;
    private datePickerNode_: Node;
    private commentNode_: Node;

    constructor(props: CellProps) {
        super(props);
        this.state = {
            showDialog: false,
            hasComments: this.hasComments_(),
        };
    }

    hideDialog_ = () => {
        this.setState({showDialog: false});
    };

    showDialog_ = () => {
        this.setState({showDialog: true});
    };

    updateComments_ = () => {
        this.setState({hasComments: this.hasComments_()});
    };
    updateCommentListeners_(props: CellProps) {
        const {comment} = props;
        if (comment && comment !== this.currentComment_) {
            if (this.currentComment_) {
                this.currentComment_.unlistenToComments(this.updateComments_);
            }
            this.currentComment_ = comment;
            comment.listenToComments(this.updateComments_);
        }
    }

    componentDidReceiveProps(props: CellProps) {
        this.updateCommentListeners_(props);
    }

    componentDidMount() {
        this.updateCommentListeners_(this.props);
    }

    componentWillUnmount() {
        if (this.datePickerNode_) {
            quip.apps.removeDetachedNode(this.datePickerNode_);
        }
    }

    componentDidUpdate(prevProps: CellProps, prevState: CellState) {
        const {comment} = this.props;
        if (this.commentNode_ && comment) {
            comment.setDom(this.commentNode_);
        }
    }

    onComment_ = () => {
        const {onCreateComment} = this.props;
        const {addingComment, toggleAddingComment} = this.context;
        let comment = this.props.comment;
        if (!comment) {
            comment = onCreateComment(this.commentNode_);
        }
        // NOTE (jd): Without this setTimeout, the object has an unknown ID and
        // showing the comment fails. We have to wait until the tick completes
        // before the IDs are properly remapped. This should probably happen
        // behind the scenes instead of in client code.
        setTimeout(() => {
            quip.apps.showComments(comment.id());
        });
        if (addingComment) {
            toggleAddingComment();
        }
    };

    hasComments_() {
        const {comment} = this.props;
        if (!comment || !quip.apps.viewerCanSeeComments()) {
            return false;
        }
        const isHighlightHidden = comment.isHighlightHidden();
        const messageCount = comment.getCommentCount();
        return !isHighlightHidden && messageCount > 0;
    }

    render() {
        const {
            data,
            column,
            onChangeValue,
            onResetValue,
            onClickReference,
            isDirty,
            schema,
            width,
            isReadOnly: isReadOnlyProp,
            truncateContent,
        } = this.props;
        const {showDialog, hasComments} = this.state;
        const {addingComment} = this.context;
        const {value: originalValue, dirtyValue, displayValue, locked} = data;
        let value: string = "";
        if (isDirty && schema && formatters.has(schema.dataType)) {
            // Some types (e.g. Date and Currency) need special formatting
            value = formatters.get(schema.dataType)(dirtyValue);
        } else if (isDirty) {
            value = dirtyValue;
        } else if (displayValue) {
            value = displayValue;
        } else if (originalValue) {
            value = String(originalValue);
        }
        value = value ? htmlUnescape(value + "") : "";
        const isType = (type: string) => schema && schema.dataType === type;
        const isHtml = schema && schema.isHtml;
        const isReadOnly = isReadOnlyProp || isType("__REFERENCE") || isHtml;
        const canEdit = !isReadOnly && !locked && isEditable(schema);
        // This will show up in the frontend to help developers
        // differentiate between locked and unsupported types.
        if (schema &&
            !isEditable(schema) &&
            !specialTypes.has(schema.dataType) &&
            !hasWarned.has(schema.dataType)) {
            console.warn(
                `Unsupported type ${schema.dataType} found. This field will not be editable until support is added.`);
            hasWarned.add(schema.dataType);
        }
        const renderInputValue = () => {
            let content = null;
            // Some types will render custom edit dialogs from SLDS, so must be
            // triggered from here rather than inside edit-dialog, which should
            // not trigger additional modals.
            if (isType("Date")) {
                 
                // replicating this entire component on our side. For any
                // unfortunate souls who have to edit this, the child is cloned
                // with merged props, so we can't do this inline.
                // See
                // https://github.com/salesforce/design-system-react/blob/master/components/date-picker/date-picker.jsx#L589
                // Should also be noted that the documentation for this
                // component is wrong (it specifies an `input` prop which
                // appears to have been replaced by a child):
                // https://react.lightningdesignsystem.com/components/date-pickers/#prop-input
                let date = parsers.get("Date")(value);
                return <Datepicker
                    className={Styles.datePicker}
                    value={date ? date.toJSDate() : ""}
                    formatter={formatters.get("Date")}
                    onChange={(formattedDate: string, {date}: {date: Date}) => {
                        onChangeValue(date);
                    }}
                    onOpen={() => {
                        this.datePickerNode_ = document.getElementsByClassName(
                            Styles.datePicker)[0];
                        if (this.datePickerNode_) {
                            quip.apps.addDetachedNode(this.datePickerNode_);
                        }
                    }}
                    onClose={() => {
                        if (this.datePickerNode_) {
                            quip.apps.removeDetachedNode(this.datePickerNode_);
                        }
                    }}>
                    <CellTextInput
                        columnLabel={column.label}
                        value={value}
                        canEdit={!isReadOnly && !locked}
                        isLocked={!isReadOnly && locked}
                        onComment={this.onComment_}
                        hasComments={hasComments}/>
                </Datepicker>;
            } else if (isType("__REFERENCE") && data.relativeUrl) {
                content = <div
                    onClick={() => onClickReference(data.relativeUrl)}
                    onKeyDown={e => {
                        if (e.keyCode === 13 || e.keyCode === 32) {
                            onClickReference(data.relativeUrl);
                        }
                    }}
                    className={classNames(Styles.referenceLink, {
                        "slds-truncate": truncateContent,
                    })}
                    tabIndex={0}>
                    {value}
                </div>;
            }
            return <CellTextInput
                columnLabel={column.label}
                isHtml={isHtml}
                value={value}
                canEdit={canEdit}
                isLocked={!isReadOnly && locked}
                onTriggerEdit={this.showDialog_}
                onComment={this.onComment_}
                truncateContent={truncateContent}
                hasComments={hasComments}>
                {isType("Boolean") ? (
                    <SLDSCheckbox
                        readOnly={!canEdit}
                        checked={parsers.get("Boolean")(value)}
                        onChange={(
                            event: Event,
                            {checked}: {checked: boolean}
                        ) => onChangeValue(checked)}/>
                ) : null}
                {content ? content : null}
            </CellTextInput>;
        };

        return <td
            aria-selected="true"
            className={classNames(Styles.cell, "slds-cell-edit", {
                "slds-is-edited": isDirty,
                [Styles.lockedCell]: locked,
                [Styles.hasComments]: hasComments,
            })}
            style={{width: width}}
            role="gridcell"
            ref={node => (this.commentNode_ = node)}>
            {renderInputValue()}
            {addingComment ? (
                <div
                    className={Styles.addCommentOverlay}
                    onClick={this.onComment_}/>
            ) : null}
            {showDialog ? (
                <EditDialog
                    value={dirtyValue || value}
                    data={data}
                    schema={schema}
                    column={column}
                    onDismiss={this.hideDialog_}
                    onChangeValue={onChangeValue}
                    onResetValue={onResetValue}/>
            ) : null}
        </td>;
    }
}
