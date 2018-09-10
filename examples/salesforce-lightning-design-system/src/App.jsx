import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import "./App.css";

import {Card, IconSettings} from "@salesforce/design-system-react";

//import actionSprite from "@salesforce-ux/design-system/assets/icons/action-sprite/svg/symbols.svg";
//import customSprite from "@salesforce-ux/design-system/assets/icons/custom-sprite/svg/symbols.svg";
//import utilitySprite from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";

//import doctypeSprite from "@salesforce-ux/design-system/assets/icons/doctype-sprite/svg/symbols.svg";

import StandardSprite from "@salesforce-ux/design-system/assets/icons/standard-sprite/svg/symbols.svg";

import Buttons from "./Buttons.jsx";

export default class App extends React.Component {
    render() {
        return (
            <IconSettings
                iconPath={(id, type) => {return Sta;}}
                standardSprite={""}
                utilitySprite={""}
                actionSprite={""}
                doctypeSprite={""}
                customSprite={""}>
                <div className="App">
                    <div>
                        <Card heading={quiptext("SVG")}>
                            <div className="CardContent">
                                <StandardSprite id="SVG" />
                            </div>
                        </Card>
                    </div>
                    <Card heading={quiptext("Buttons")}>
                        <div className="CardContent">
                            <Buttons />
                        </div>
                    </Card>
                </div>
            </IconSettings>
        );
    }
}
