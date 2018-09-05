import React from "react";
import PropTypes from "prop-types";
import {
    Button,
    //IconSettings,
    //Input,
    //Modal,
} from "@salesforce/design-system-react";

import Styles from "./DashboardHeightModal.less";

export default class DashboardHeightModal extends React.Component {
    static propTypes = {
        height: PropTypes.number,
        isOpen: PropTypes.bool,
        setHeight: PropTypes.func,
        toggleOpen: PropTypes.func,
    };
    constructor(props) {
        super();
        this.state = {
            height: props.height,
        };
    }
    onChange = e => {
        const height = this.input.value;
        this.setState({height});
    };
    onClickSetHeight = () => {
        const {setHeight, toggleOpen} = this.props;
        setHeight(this.state.height);
        toggleOpen();
    };
    render() {
        const {height} = this.state;
        return <div className={Styles.DashboardHeightModal}>
            <input
                className={Styles.input}
                ref={input => (this.input = input)}
                value={height}
                onChange={this.onChange}/>
            <Button className={Styles.button} onClick={this.onClickSetHeight}>
                Submit
            </Button>
        </div>;
        /*
        return <div>
            <IconSettings iconPath="/assets/icons">
                <Modal
                    dismissible
                    isOpen={isOpen}
                    onRequestClose={toggleOpen}
                    prompt="info"
                    size="medium"
                    parentSelector={() =>
                        document.querySelector("#quip-element-root")
                    }
                    title={<span>Dashboard Height</span>}>
                    <Input
                        onChange={e => {
                            console.debug("onChange", e.target.value);
                        }}
                        label="Height"
                        type="number"
                        value={height}/>
                </Modal>
            </IconSettings>
        </div>;
        */
    }
}
