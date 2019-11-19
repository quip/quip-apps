// Copyright 2019 Quip

import React, {MouseEvent} from "react";
import PropTypes, {InferProps} from "prop-types";
import classNames from "classnames";
import _ from "quiptext";
import Icon from "./icon";
import Styles from "./cell.less";

interface CellTextInputProps
    extends InferProps<typeof CellTextInput.propTypes> {
    onComment: () => void;
    onTriggerEdit?: () => void;
}

export default class CellTextInput extends React.Component<CellTextInputProps> {
    static propTypes = {
        children: PropTypes.node,
        columnLabel: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        isHtml: PropTypes.bool,
        canEdit: PropTypes.bool.isRequired,
        isLocked: PropTypes.bool.isRequired,
        hasComments: PropTypes.bool.isRequired,
        onComment: PropTypes.func.isRequired,
        onTriggerEdit: PropTypes.func,
        truncateContent: PropTypes.bool,
        // SLDS clones and injects props rather than following standard react
        // patterns. So these props may magically show up sometimes
        iconRight: PropTypes.node,
        inputRef: PropTypes.func,
        id: PropTypes.string,
        onChange: PropTypes.func,
        onClick: PropTypes.func,
        onKeyDown: PropTypes.func,
    };

    onClick_ = (e: MouseEvent<HTMLButtonElement>) => {
        // Don't bubble this event to the container if we're opening a dialog
        e.stopPropagation();
        const {onTriggerEdit, onClick} = this.props;
        (onClick || onTriggerEdit)();
    };

    render() {
        // Quip-specific props (note that value is provided by both)
        const {
            columnLabel,
            value,
            isHtml,
            canEdit,
            isLocked,
            onComment,
            hasComments,
            children,
            truncateContent,
        } = this.props;
        // Injected via SLDS
        const {inputRef} = this.props;
        const title = `Edit ${columnLabel} of ${value}`;
        let hasChildren = (React.Children.toArray(children) || []).some(
            c => !!c);
        let htmlProps: {dangerouslySetInnerHTML?: {__html: string}} = {};
        if (isHtml) {
            htmlProps.dangerouslySetInnerHTML = {__html: value};
        }
        return <span
            className="slds-grid slds-grid_align-spread"
            onClick={hasComments ? onComment : null}
            ref={inputRef}>
            {hasChildren ? (
                children
            ) : (
                <span
                    className={classNames(Styles.content, {
                        "slds-truncate": truncateContent,
                    })}
                    title={value}
                    {...htmlProps}>
                    {isHtml ? null : value}
                </span>
            )}
            <div
                className={Styles.cellIcon}
                title={
                    isLocked
                        ? (_(
                              "You can edit this field only in Salesforce.") as string)
                        : null
                }>
                {canEdit ? (
                    <button
                        onClick={this.onClick_}
                        className="slds-button slds-button_icon slds-cell-edit__button slds-m-left_x-small"
                        title={title}>
                        <Icon
                            object="edit"
                            type="utility"
                            size="x-small"
                            editable={true}/>
                        <span className="slds-assistive-text">{title}</span>
                    </button>
                ) : null}
                {isLocked ? (
                    <Icon object="lock" type="utility" size="x-small"/>
                ) : null}
            </div>
        </span>;
    }
}
