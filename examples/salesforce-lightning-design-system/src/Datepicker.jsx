import React from "react";
import {Datepicker} from "@salesforce/design-system-react";

export default class Example extends React.Component {
    render() {
        return (
            <Datepicker
                onChange={(event, data) => {
                    if (this.props.action) {
                        const dataAsArray = Object.keys(data).map(
                            key => data[key]
                        );
                        this.props.action("onChange")(
                            event,
                            data,
                            ...dataAsArray
                        );
                    } else if (console) {
                        console.log("onChange", event, data);
                    }
                }}
                onCalendarFocus={(event, data) => {
                    if (this.props.action) {
                        const dataAsArray = Object.keys(data).map(
                            key => data[key]
                        );
                        this.props.action("onCalendarFocus")(
                            event,
                            data,
                            ...dataAsArray
                        );
                    } else if (console) {
                        console.log("onCalendarFocus", event, data);
                    }
                }}
            />
        );
    }
}
