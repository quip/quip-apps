// Copyright 2019 Quip

import React, {Component, KeyboardEvent as ReactKeyboardEvent} from "react";
import PropTypes, {InferProps} from "prop-types";
import quip from "quip-apps-api";
import Icon from "./icon";
import Input, {supportedTypes} from "./input";
import classNames from "classnames";
import {
    SalesforceListCellSchema,
    SalesforceListCellData,
} from "../model/salesforce-list";
import {ColumnInfo} from "../lib/salesforce-responses";
import {SalesforceRecord} from "../lib/salesforce-types";

interface EditDialogProps extends InferProps<typeof EditDialog.propTypes> {
    value?: string;
    onDismiss: (event?: Event) => void;
    onResetValue: () => void;
    onChangeValue: (value: string) => void;
    column: ColumnInfo;
    data: SalesforceListCellData;
    schema: SalesforceListCellSchema;
}

interface EditDialogState {
    value?: string;
}

export const isEditable = (schema: SalesforceListCellSchema) => {
    return !!schema && supportedTypes.has(schema.dataType);
};

export default class EditDialog extends Component<
    EditDialogProps,
    EditDialogState
> {
    static propTypes = {
        value: PropTypes.string,
        data: PropTypes.object.isRequired,
        schema: PropTypes.object.isRequired,
        column: PropTypes.object.isRequired,
        onDismiss: PropTypes.func.isRequired,
        onResetValue: PropTypes.func.isRequired,
        onChangeValue: PropTypes.func.isRequired,
    };

    private node_: Element;

    constructor(props: EditDialogProps) {
        super(props);
        this.state = {value: props.value};
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.handleMouseDown_, false);
        document.addEventListener("focus", this.handleFocus_, true);
    }

    private unlisten_() {
        document.removeEventListener("mousedown", this.handleMouseDown_, false);
        document.removeEventListener("focus", this.handleFocus_, true);
    }

    componentWillUnmount() {
        this.unlisten_();
    }

    handleMouseDown_ = (event: MouseEvent) => {
        const {onDismiss, onChangeValue} = this.props;
        const {value} = this.state;
        if (this.node_ && this.node_.contains(event.target as Element)) {
            return;
        }
        onDismiss(event);
        onChangeValue(value);
        event.preventDefault();
        this.unlisten_();
    };

    handleFocus_ = (event: KeyboardEvent) => {
        const {onDismiss, onChangeValue} = this.props;
        const {value} = this.state;
        if (this.node_ && this.node_.contains(event.target as Element)) {
            return;
        }
        onDismiss();
        onChangeValue(value);
        event.stopPropagation();
        this.unlisten_();
    };

    onInputChange_ = (value: string) => {
        this.setState({value});
    };

    onKeydown_ = (evt: ReactKeyboardEvent<HTMLDivElement>) => {
        const {schema, onDismiss, onChangeValue} = this.props;
        const {value} = this.state;
        switch (evt.keyCode) {
            case 13:
                // Enter
                if (schema.dataType !== "TextArea" ||
                    evt.getModifierState("Meta") ||
                    evt.getModifierState("Control")) {
                    // Only submit textareas on enter if also pressing ctrl/meta
                    this.unlisten_();
                    onDismiss(evt.nativeEvent);
                    onChangeValue(value);
                }
                break;
            case 27:
                // Esc
                this.unlisten_();
                onDismiss(evt.nativeEvent);
                break;
        }
    };

    onResetValue_ = () => {
        const {onDismiss, onResetValue} = this.props;
        this.unlisten_();
        onDismiss();
        onResetValue();
    };

    renderInput_() {
        const {schema, data} = this.props;
        const {value} = this.state;
        const isDraft = value !== data.value;
        if (supportedTypes.has(schema.dataType)) {
            return <div className="slds-form-element__control slds-grow slds-grid">
                <Input
                    value={value}
                    options={schema.values}
                    type={schema.dataType || "String"}
                    onInputChange={this.onInputChange_}/>
                <button
                    onClick={this.onResetValue_}
                    className={classNames("listview-restore", {
                        "is-draft": isDraft,
                    })}
                    tabIndex={-1}
                    disabled={!isDraft}>
                    <Icon
                        object="refresh"
                        type="action"
                        size="x-small"
                        editable={true}/>
                </button>
            </div>;
        }
    }

    setNode_ = (node: Element) => {
        if (this.node_) {
            quip.apps.removeDetachedNode(this.node_);
        }
        this.node_ = node;
        if (node) {
            quip.apps.addDetachedNode(node);
        }
    };

    render() {
        const {column} = this.props;
        return <div>
            <section
                className="listview-edit slds-popover"
                role="dialog"
                ref={this.setNode_}>
                <div className="slds-popover__body" onKeyDown={this.onKeydown_}>
                    <div className="slds-form-element slds-grid slds-wrap">
                        <label className="slds-form-element__label slds-form-element__label_edit slds-no-flex">
                            <span className="slds-assistive-text">
                                {column.label}
                            </span>
                        </label>
                        {this.renderInput_()}
                    </div>
                </div>
            </section>
        </div>;
    }
}
