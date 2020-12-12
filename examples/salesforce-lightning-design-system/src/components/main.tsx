import React, {Component} from "react";
import {AllSLDSComponents} from "./slds/all";

interface MainProps {
    isCreation: boolean;
    creationUrl?: string;
}
export default class Main extends Component<MainProps> {
    render() {
        return <AllSLDSComponents/>;
    }
}
