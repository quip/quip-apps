import React from "react";
import {Alert, AlertContainer, Icon} from "@salesforce/design-system-react";

export default class Example extends React.Component {
    render() {
        return (
            <div>
                <AlertContainer>
                    <Alert
                        icon={<Icon category="utility" name="user" />}
                        labels={{
                            heading:
                                "Logged in as John Smith (johnsmith@acme.com).",
                            headingLink: "Log out",
                        }}
                        onClickHeadingLink={() => {
                            console.log("Link clicked.");
                        }}
                    />
                </AlertContainer>
                <br />
                <AlertContainer>
                    <Alert
                        labels={{
                            heading:
                                "Your browser is outdated. Your Salesforce experience may be degraded.",
                            headingLink: "More Information",
                        }}
                        onClickHeadingLink={() => {
                            console.log("Link clicked.");
                        }}
                        variant="warning"
                    />
                </AlertContainer>
                <br />
                <AlertContainer>
                    <Alert
                        labels={{
                            heading: "You are in offline mode.",
                            headingLink: "More information",
                        }}
                        onClickHeadingLink={() => {
                            console.log("Link clicked.");
                        }}
                        variant="offline"
                    />
                </AlertContainer>
            </div>
        );
    }
}
