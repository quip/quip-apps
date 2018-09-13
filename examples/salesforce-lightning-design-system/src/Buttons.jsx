import React from "react";

import {
    Button,
    ButtonGroup,
    ButtonStateful,
    Dropdown,
} from "@salesforce/design-system-react";

export default class Buttons extends React.Component {
    render() {
        return (
            <div>
                <ButtonGroup>
                    <Button label="Refresh" />
                    <Button label="Edit" />
                    <Button label="Save" />
                    <Dropdown
                        id="ButtonGroupExampleDropdown"
                        assistiveText={{icon: "More Options"}}
                        buttonVariant="icon"
                        iconCategory="utility"
                        iconName="down"
                        iconVariant="border-filled"
                        onSelect={item => {
                            console.log(item.label, "selected");
                        }}
                        openOn="click"
                        options={[
                            {label: "undo", value: "A0"},
                            {label: "redo", value: "B0"},
                            {label: "activate", value: "C0"},
                        ]}
                    />
                </ButtonGroup>
                <br />
                <br />
                <ButtonGroup>
                    <ButtonStateful
                        assistiveText={{icon: "Show Chart"}}
                        buttonVariant="icon"
                        iconName="chart"
                        iconVariant="border"
                        variant="icon"
                    />
                    <ButtonStateful
                        assistiveText={{icon: "Filter List"}}
                        iconName="filterList"
                        iconVariant="border"
                        variant="icon"
                    />
                    <Dropdown
                        assistiveText={{icon: "Settings"}}
                        checkmark
                        iconCategory="utility"
                        iconName="settings"
                        iconVariant="more"
                        id="icon-dropdown-example"
                        onSelect={item => {
                            console.log(item.label, "selected");
                        }}
                        openOn="click"
                        options={[
                            {label: "Bring left panel to front", value: "A0"},
                            {label: "Bring right panel to front", value: "B0"},
                        ]}
                        value="A0"
                        variant="icon"
                    />
                </ButtonGroup>
            </div>
        );
    }
}
