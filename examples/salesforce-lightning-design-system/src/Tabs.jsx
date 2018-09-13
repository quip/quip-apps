import React from "react";
import {Tabs, TabsPanel} from "@salesforce/design-system-react";

export default class Example extends React.Component {
    render() {
        return (
            <Tabs variant="scoped" id="tabs-example-scoped">
                <TabsPanel label="Item One">Item One Content</TabsPanel>
                <TabsPanel label="Item Two">Item Two Content</TabsPanel>
                <TabsPanel label="Item Three">Item Three Content</TabsPanel>
                <TabsPanel disabled label="Disabled">
                    Disabled Content
                </TabsPanel>
            </Tabs>
        );
    }
}
