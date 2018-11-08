import React from "react";
import PropTypes from "prop-types";
import {
    Button,
    Dropdown,
    DropdownTrigger,
} from "@salesforce/design-system-react";

import Dialog from "../../shared/dialog/dialog.jsx";
import Styles from "./DashboardHeight.less";

export default class DashboardHeight extends React.Component {
    static propTypes = {
        height: PropTypes.number,
        setHeight: PropTypes.func,
        close: PropTypes.func,
    };

    constructor(props) {
        super();
        this.state = {
            height: props.height,
        };
    }

    componentWillUnmount() {
        console.debug("unmount me");
    }

    onSelect = obj => {
        const {setHeight, close} = this.props;
        console.debug("onSelect", obj.value);
        setHeight(obj.value);
        close();
    };

    render() {
        const {close} = this.props;
        const {height} = this.state;
        console.debug("RENDER HEIGHT is", height);
        return <div>
            <Dialog onDismiss={close} ref={el => (this.dialog = el)}>
                <div className={Styles.DashboardHeight}>
                    <h3>Set Dashboard Height</h3>
                    <Dropdown
                        tabIndex="-1"
                        align="right"
                        onSelect={this.onSelect}
                        options={[400, 600, 800, 1000].map(v => {
                            return {"label": v + "px", "value": v};
                        })}
                        value={height}>
                        <DropdownTrigger>
                            <Button
                                iconCategory="utility"
                                iconName="down"
                                iconPosition="right"
                                label={`${height}px`}/>
                        </DropdownTrigger>
                    </Dropdown>
                </div>
            </Dialog>
        </div>;
    }
}
