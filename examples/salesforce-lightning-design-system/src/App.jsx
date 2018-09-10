import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import "./App.css";

import {Card, IconSettings} from "@salesforce/design-system-react";

import UtilitySprite from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";

import Buttons from "./Buttons.jsx";

export default class App extends React.Component {
    render() {
        return (
            <IconSettings
                standardSprite={""}
                utilitySprite={""}
                actionSprite={""}
                doctypeSprite={""}
                customSprite={""}>
                <div className="App">
                    <UtilitySprite />
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
