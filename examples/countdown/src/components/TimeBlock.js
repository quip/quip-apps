// Copyright 2017 Quip

import quip from "quip";
import React, { Component } from "react";
import cx from "classnames";

import Styles from "./TimeBlock.less";

class TimeBlock extends Component {
    static propTypes = {
        number: React.PropTypes.number,
        unit: React.PropTypes.string,
        color: React.PropTypes.string.isRequired,
    };

    render() {
        const { number, unit, color } = this.props;
        const showFocusedState = quip.elements.isElementFocused() &&
            !quip.elements.isMobile();
        const makeNumberStyles = () => {
            const backgroundColor = showFocusedState
                ? quip.elements.ui.ColorMap[color].VALUE
                : quip.elements.ui.ColorMap[color].VALUE_LIGHT;
            const numberColor = showFocusedState
                ? "#fff"
                : quip.elements.ui.ColorMap[color].VALUE;

            return {
                color: numberColor,
                backgroundColor: backgroundColor,
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: quip.elements.ui.ColorMap[color].VALUE_STROKE,
            };
        };

        return (
            <div
                className={Styles.wrapper}
                style={{ color: quip.elements.ui.ColorMap[color].VALUE }}
            >
                <div
                    style={makeNumberStyles()}
                    className={cx(Styles.numberWrapper, "quip-text-h1")}
                >
                    {number}
                </div>

                <div className={Styles.unitText}>{unit}</div>
            </div>
        );
    }
}

export default TimeBlock;
