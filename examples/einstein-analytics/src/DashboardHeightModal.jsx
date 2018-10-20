import React from "react";
import PropTypes from "prop-types";
import {Button} from "@salesforce/design-system-react";

import Styles from "./DashboardHeightModal.less";

export default class DashboardHeightModal extends React.Component {
    static propTypes = {
        height: PropTypes.number,
        setHeight: PropTypes.func,
        toggleOpen: PropTypes.func,
    };
    constructor(props) {
        super();
        this.state = {
            height: props.height,
        };
    }
    componentDidMount() {
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.props.toggleOpen);
    }
    componentWillUnmount() {
        quip.apps.removeEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.props.toggleOpen);
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
    onClickBackdrop = e => {
        const {toggleOpen} = this.props;
        toggleOpen();
    };
    render() {
        const {height} = this.state;
        return <div>
            <div
                className={Styles.DashboardHeightModalBackdrop}
                onClick={this.onClickBackdrop}/>
            <div className={Styles.DashboardHeightModal}>
                <input
                    className={Styles.input}
                    ref={input => (this.input = input)}
                    value={height}
                    onChange={this.onChange}/>
                <Button
                    className={Styles.button}
                    onClick={this.onClickSetHeight}>
                    Submit
                </Button>
            </div>
        </div>;
    }
}
