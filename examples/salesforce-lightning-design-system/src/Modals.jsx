import React from "react";

import {Button, Combobox, Lookup, Modal} from "@salesforce/design-system-react";

import ProgressIndicators from "./ProgressIndicators.jsx";

// SLDS Modal does not work in Quip Live Apps so we'll also show how to use
// the Quip dialog code.
import Dialog from "../../shared/dialog/dialog.jsx";

const leadSourceOptions = [
    {id: 1, label: "Third Party Program", value: "A0"},
    {id: 2, label: "Cold Call", value: "B0"},
    {id: 3, label: "LinkedIn", value: "C0"},
    {id: 4, label: "Direct Mail", value: "D0"},
    {id: 5, label: "Other", value: "E0"},
];

const opportunityTypeOptions = [
    {id: 1, label: "Add on Business", value: "A0"},
    {id: 2, label: "Courtesy", value: "B0"},
    {id: 3, label: "New Business", value: "C0"},
    {id: 4, label: "Renewal", value: "D0"},
    {id: 5, label: "Upgrade", value: "E0"},
];

export default class Example extends React.Component {
    constructor(props) {
        super();
        this.state = {
            isOpen: false,
            isQuipDialogOpen: false,
            leadSourceSelection: [leadSourceOptions[0]],
            opportunityTypeSelection: [opportunityTypeOptions[0]],
        };
    }

    componentDidMount() {
        quip.apps.addEventListener(quip.apps.EventType.BLUR, this.onBlur);
    }

    onBlur = () => {
        this.setState({isOpen: false});
    };

    toggleOpen = () => {
        this.setState({isOpen: !this.state.isOpen});
    };

    toggleQuipDialogOpen = () => {
        this.setState({isQuipDialogOpen: !this.state.isQuipDialogOpen});
    };

    render() {
        const {isQuipDialogOpen} = this.state;
        return (
            <div>
                <Button
                    label="Open SLDS Modal (testing)"
                    onClick={this.toggleOpen}
                />

                <Button
                    label="Open Quip Dialog"
                    onClick={this.toggleQuipDialogOpen}
                />

                <p style={{color: "red"}}>
                    <b>Note</b>: SLDS Modal does not currently work in Quip Live
                    Apps, see the Dialog demo.
                </p>

                {isQuipDialogOpen && (
                    <QuipDialogExample close={this.toggleQuipDialogOpen} />
                )}

                <Modal
                    ariaHideApp={false}
                    isOpen={this.state.isOpen}
                    footer={[
                        <Button label="Cancel" onClick={this.toggleOpen} />,
                        <Button
                            label="Save"
                            variant="brand"
                            onClick={this.toggleOpen}
                        />,
                    ]}
                    onRequestClose={this.toggleOpen}
                    parentSelector={() => {
                        console.debug("APP", document.querySelector(".App"));
                        return document.querySelector(".App");
                    }}
                    title="New Opportunity">
                    <section className="slds-p-around--large">
                        <div className="slds-form-element slds-m-bottom--large">
                            <label
                                className="slds-form-element__label"
                                htmlFor="opptyName">
                                Opportunity Name
                            </label>
                            <div className="slds-form-element__control">
                                <input
                                    id="opptyName"
                                    className="-input"
                                    type="text"
                                    placeholder="Enter name"
                                />
                            </div>
                        </div>
                        <div className="slds-form-element slds-m-bottom--large">
                            <label
                                className="slds-form-element__label"
                                htmlFor="description">
                                Opportunity Description
                            </label>
                            <div className="slds-form-element__control">
                                <textarea
                                    id="description"
                                    className="-textarea"
                                    placeholder="Enter description"
                                />
                            </div>
                        </div>
                        <div className="slds-form-element slds-m-bottom--large">
                            <Lookup
                                emptyMessage="No items found"
                                hasError={false}
                                label="Account"
                                onChange={newValue => {
                                    console.log("New search term: ", newValue);
                                }}
                                onSelect={item => {
                                    console.log(item, " Selected");
                                }}
                                options={[
                                    {type: "section", label: "SECTION 1"},
                                    {label: "Paddy's Pub"},
                                    {label: "Tyrell Corp"},
                                    {type: "section", label: "SECTION 2"},
                                    {label: "Paper St. Soap Company"},
                                    {label: "Nakatomi Investments"},
                                    {label: "Acme Landscaping"},
                                    {type: "section", label: "SECTION 3"},
                                    {label: "Acme Construction"},
                                ]}
                                sectionDividerRenderer={
                                    Lookup.DefaultSectionDivider
                                }
                            />
                        </div>
                        <div className="slds-m-bottom--large">
                            <Combobox
                                events={{
                                    onSelect: (event, data) => {
                                        const selection =
                                            data.selection.length === 0
                                                ? this.state.leadSourceSelection
                                                : data.selection;
                                        console.log(
                                            "selected: ",
                                            selection[0].label
                                        );
                                        this.setState({
                                            leadSourceSelection: selection,
                                        });
                                    },
                                }}
                                labels={{
                                    label: "Lead Source",
                                    placeholder: "Select Lead Source",
                                }}
                                menuPosition="relative"
                                options={leadSourceOptions}
                                selection={this.state.leadSourceSelection}
                                variant="readonly"
                            />
                        </div>
                        <div className="slds-m-bottom--large">
                            <Combobox
                                events={{
                                    onSelect: (event, data) => {
                                        const selection =
                                            data.selection.length === 0
                                                ? this.state
                                                      .opportunityTypeSelection
                                                : data.selection;
                                        console.log(
                                            "selected: ",
                                            selection[0].label
                                        );
                                        this.setState({
                                            opportunityTypeSelection: selection,
                                        });
                                    },
                                }}
                                labels={{
                                    label: "Type",
                                    placeholder: "Select Opportunity Type",
                                }}
                                menuPosition="relative"
                                options={opportunityTypeOptions}
                                selection={this.state.opportunityTypeSelection}
                                variant="readonly"
                            />
                        </div>
                        <div className="slds-form-element slds-m-bottom--large">
                            <label
                                className="slds-form-element__label"
                                htmlFor="amount">
                                Amount
                            </label>
                            <div className="slds-form-element__control">
                                <input
                                    id="amount"
                                    className="-input"
                                    type="text"
                                    placeholder="Enter Amount"
                                />
                            </div>
                        </div>
                    </section>
                </Modal>
            </div>
        );
    }
}

class QuipDialogExample extends React.Component {
    render() {
        const {close} = this.props;
        return (
            <Dialog onDismiss={close} top={"50%"} left={"50%"}>
                <section
                    className="slds-p-around--large"
                    style={{minWidth: 450}}>
                    <h3>Dialog Demo</h3>
                    <br />
                    <br />
                    <ProgressIndicators />
                </section>
            </Dialog>
        );
    }
}
