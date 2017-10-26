/* @flow */
// Copyright 2017 Quip

import React from "react";
import { connect } from "react-redux";
import addMonths from "date-fns/add_months";
import format from "date-fns/format";
import subMonths from "date-fns/sub_months";

import LeftChevron from "./LeftChevron.jsx";
import RightChevron from "./RightChevron.jsx";

import { setDisplayMonth } from "../actions";

import Styles from "./CalendarNavHeader.less";

type Props = {
    displayMonth: Date,
    setDisplayMonth: Function,
};

class CalendarNavHeader extends React.Component<Props, null> {
    onClickSetPreviousMonth = e => {
        this.props.setDisplayMonth(subMonths(this.props.displayMonth, 1));
    };

    onClickSetNextMonth = e => {
        this.props.setDisplayMonth(addMonths(this.props.displayMonth, 1));
    };

    render() {
        const { displayMonth } = this.props;

        return (
            <div className={Styles.container}>
                <div className={Styles.displayMonthContainer}>
                    <span className={Styles.displayMonth}>
                        {format(displayMonth, "MMMM")}
                    </span>

                    <span className={Styles.displayYear}>
                        {format(displayMonth, "YYYY")}
                    </span>
                </div>
                <div className={Styles.navButtonGroup}>
                    <button
                        className={Styles.navButton}
                        onClick={this.onClickSetPreviousMonth}
                    >
                        <LeftChevron className={Styles.chevron} />
                    </button>
                    <div className={Styles.buttonDivider} />
                    <button
                        className={Styles.navButton}
                        onClick={this.onClickSetNextMonth}
                    >
                        <RightChevron className={Styles.chevron} />
                    </button>
                </div>
            </div>
        );
    }
}

const mapHeaderStateToProps = state => ({
    displayMonth: state.displayMonth,
});
export default connect(mapHeaderStateToProps, {
    setDisplayMonth,
})(CalendarNavHeader);
