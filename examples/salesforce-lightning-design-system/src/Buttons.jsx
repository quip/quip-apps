import React from "react";

import {Button, ButtonGroup, Dropdown} from "@salesforce/design-system-react";

export default class Buttons extends React.Component {
    render() {
        return (
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
        );
    }
}
