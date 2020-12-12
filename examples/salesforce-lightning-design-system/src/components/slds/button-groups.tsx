import React, {FunctionComponent} from "react";

import ButtonGroup from "@salesforce/design-system-react/components/button-group";
import Button from "@salesforce/design-system-react/components/button";
import Dropdown from "@salesforce/design-system-react/components/menu-dropdown";
import IconSettings from "@salesforce/design-system-react/components/icon-settings";
import UtilitySprite from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";

export const ButtonGroups: FunctionComponent = () => <IconSettings
    onRequestIconPath={({name}: {category: string; name: string}) =>
        `#${name}`
    }>
    <UtilitySprite/>
    <ButtonGroup id="button-group-more-icon">
        <Button label="Refresh"/>
        <Button label="Edit"/>
        <Button label="Save"/>
        <Dropdown
            id="ButtonGroupExampleDropdown"
            assistiveText={{icon: "More Options"}}
            buttonVariant="icon"
            iconCategory="utility"
            iconName="down"
            iconVariant="border-filled"
            onSelect={(item: {label: string}) => {
                console.log(item.label, "selected");
            }}
            openOn="click"
            options={[
                {label: "undo", value: "A0"},
                {label: "redo", value: "B0"},
                {label: "activate", value: "C0"},
            ]}/>
    </ButtonGroup>
</IconSettings>;
