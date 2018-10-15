import React from "react";

import "@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css";
import "./dsr-quip-mods.css";
import "./App.css";

import {Card, IconSettings} from "@salesforce/design-system-react";

import UtilitySprite from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";

import Accordions from "./Accordions.jsx";
import Alerts from "./Alerts.jsx";
import Buttons from "./Buttons.jsx";
import Cards from "./Cards.jsx";
import Datepicker from "./Datepicker.jsx";
import Modals from "./Modals.jsx";
import Sliders from "./Sliders.jsx";
import Spinners from "./Spinners.jsx";
import Tabs from "./Tabs.jsx";

const components = {
    Accordions,
    Alerts,
    Cards,
    Buttons,
    Datepicker,
    Modals,
    Sliders,
    Spinners,
    Tabs,
};

const componentNames = Object.keys(components);
console.debug("componentNames", componentNames);
export default class App extends React.Component {

    
    handleNavClick = e => {
        e.preventDefault();
        const href = e.target.getAttribute("href").replace("#", "");
        const el = document.querySelector(`#${href}`);
        el.scrollIntoView();
    };

    render() {
        return (
            <IconSettings onRequestIconPath={({category, name}) => `#${name}`}>
                <div className="App">
                    <UtilitySprite />
                    <div className="components-nav">
                        <ul>
                            {componentNames.map(name => {
                                return (
                                    <li>
                                        <a
                                            href={`#${name}`}
                                            onClick={this.handleNavClick}>
                                            {name}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div>
                        {componentNames.map(name => {
                            const Component = components[name];
                            return (
                                <Card
                                    id={`${name}`}
                                    heading={quiptext(name)}
                                    key={`${name}`}>
                                    <div className="CardContent">
                                        <Component />
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </IconSettings>
        );
    }
}
