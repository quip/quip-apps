// Copyright 2019 Quip

import React, {Component, KeyboardEvent, ReactElement} from "react";
import PropTypes, {InferProps} from "prop-types";
import _ from "quiptext";
import {DateTime} from "luxon";
import {
    SLDSInput,
    SLDSTextarea,
    SLDSTimepicker,
} from "@salesforce/design-system-react";
import {validators, parsers, formatters} from "../lib/format";

export const supportedTypes = new Set([
    "Currency",
    "Double",
    "Email",
    "Int",
    "Percent",
    "Phone",
    "Picklist",
    "String",
    "TextArea",
    "Url",
]);

interface InputProps extends InferProps<typeof Input.propTypes> {
    options?: {value: string; label: string}[];
    onInputChange: (value: string) => void;
}

export default class Input extends Component<InputProps> {
    static propTypes = {
        value: PropTypes.string,
        options: PropTypes.array,
        type: PropTypes.oneOf(Array.from(supportedTypes)).isRequired,
        onInputChange: PropTypes.func.isRequired,
    };

    onChange_ = (value: string) => {
        const {type, onInputChange} = this.props;
        onInputChange(parsers.get(type)(value));
    };

    inputRef_ = (
        ref:
            | HTMLElement
            | typeof SLDSInput
            | typeof SLDSTextarea
            | typeof SLDSTimepicker
            | null) => {
        if (ref && ref.focus) {
            ref.focus();
        }
    };

    renderSelect() {
        const {options, value} = this.props;
        return <div className="slds-select_container slds-grow">
            <select
                ref={this.inputRef_}
                className="slds-select"
                value={value}
                onChange={e => this.onChange_(e.target.value)}>
                <option key="none" value=""/>
                {options.map((option, idx) => <option
                    key={String(idx)}
                    value={option.value}>
                    {option.label}
                </option>)}
            </select>
        </div>;
    }

    renderString(errorText: string) {
        const {type, value} = this.props;
        let inputType = "text";
        switch (type) {
            case "Phone":
                inputType = "tel";
                break;
            case "Int":
            case "Double":
            case "Currency":
            case "Percent":
                inputType = "number";
                break;
            case "Email":
                inputType = "email";
                break;
            case "Url":
                inputType = "url";
                break;
        }
        return <SLDSInput
            inputRef={this.inputRef_}
            errorText={errorText}
            type={inputType}
            value={value || ""}
            onChange={(e: KeyboardEvent<HTMLInputElement>) =>
                this.onChange_(e.currentTarget.value)
            }/>;
    }

    renderTextArea(errorText: string) {
        const {value} = this.props;
        return <div>
            <SLDSTextarea
                ref={this.inputRef_}
                errorText={errorText}
                defaultValue={value || ""}
                onChange={(e: KeyboardEvent<HTMLInputElement>) =>
                    this.onChange_(e.currentTarget.value)
                }/>
        </div>;
    }

    renderTime() {
        const {value} = this.props;
        const parseTime = parsers.get("Time");
        const date = parseTime(value) || DateTime.local();
        return <SLDSTimepicker
            ref={this.inputRef_}
            parser={parseTime}
            format={formatters.get("Time")}
            value={date.toJSDate()}
            onDateChange={(dateValue: Date, stringValue: string) =>
                this.onChange_(stringValue)
            }/>;
    }

    render() {
        const {type, value, options} = this.props;
        const errorText = validators.get(type)(
            value,
            options ? new Set(options) : null)
            ? null
            : (_("Invalid %(type)s", {type}) as string);
        let content = null;
        switch (type) {
            case "Currency":
            case "Double":
            case "Email":
            case "Int":
            case "Percent":
            case "Phone":
            case "String":
            case "Url":
                content = this.renderString(errorText);
                break;
            case "Picklist":
                content = this.renderSelect();
                break;
            case "TextArea":
                content = this.renderTextArea(errorText);
                break;
        }

        if (!content) {
            console.error(
                `Unknown type ${type} passed to Input. Supported types are: ${Array.from(
                    supportedTypes).join(", ")}.`);
        }

        return <div
            className={"slds-form-element__control slds-grow slds-grid1"}>
            {content}
        </div>;
    }
}
