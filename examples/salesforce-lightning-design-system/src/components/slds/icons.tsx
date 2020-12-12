import React, {FunctionComponent} from "react";
import IconSettings from "@salesforce/design-system-react/components/icon-settings";
import ActionSprite from "@salesforce-ux/design-system/assets/icons/action-sprite/svg/symbols.svg";
import StandardSprite from "@salesforce-ux/design-system/assets/icons/standard-sprite/svg/symbols.svg";
import UtilitySprite from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";
import DoctypeSprite from "@salesforce-ux/design-system/assets/icons/doctype-sprite/svg/symbols.svg";
import CustomSprite from "@salesforce-ux/design-system/assets/icons/custom-sprite/svg/symbols.svg";
import Icon from "@salesforce/design-system-react/components/icon";

export const Icons: FunctionComponent = () => <IconSettings
    onRequestIconPath={({name}: {category: string; name: string}) =>
        `#${name}`
    }>
    <div>
        <StandardSprite/>
        <ActionSprite/>
        <UtilitySprite/>
        <DoctypeSprite/>
        <CustomSprite/>
        <div className="slds-grid slds-grid_pull-padded slds-grid_vertical-align-center">
            <div className="slds-col_padded">
                <Icon
                    assistiveText={{label: "Account"}}
                    category="standard"
                    name="account"
                    size="small"/>
            </div>
            <div className="slds-col_padded">
                <Icon
                    assistiveText={{label: "Announcement"}}
                    category="utility"
                    name="announcement"
                    size="small"/>
            </div>
            <div className="slds-col_padded">
                <Icon
                    assistiveText={{label: "Description"}}
                    category="action"
                    name="description"
                    size="small"/>
            </div>
            <div className="slds-col_padded">
                <Icon
                    assistiveText={{label: "XML"}}
                    category="doctype"
                    name="xml"
                    size="small"/>
            </div>
            <div className="slds-col_padded">
                <Icon
                    assistiveText={{label: "custom5"}}
                    category="custom"
                    name="custom5"
                    size="small"/>
            </div>
        </div>
    </div>
</IconSettings>;
