// Copyright 2017 Quip

import quip from "quip";
import React from "react";
import classNames from "classnames";

import humanTime from "../humanTime";

import Styles from "./App.less";
import TimeBlock from "./TimeBlock";

const DELETE_KEY = 127;
const BACKSPACE_KEY = 8;

const isDeleteAction = keyCode =>
    keyCode === DELETE_KEY || keyCode === BACKSPACE_KEY;

function formatDate(date) {
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return `${monthNames[monthIndex]} ${day}, ${year}`;
}

const INTERVAL_MS = 200;

export default class App extends React.Component {
    static propTypes = {
        rootRecord: React.PropTypes.instanceOf(quip.elements.RootRecord)
            .isRequired,
        deadline: React.PropTypes.number,
        color: React.PropTypes.string.isRequired,
        setRootInstance: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super();
        props.setRootInstance(this);
        this.state = {
            time: humanTime(props.deadline - Date.now()),
            focused: false,
            showCalendar: false,
        };
        this.interval = null;
    }

    clearUpdateInterval() {
        if (this.interval) {
            window.clearInterval(this.interval);
            this.interval = null;
        }
    }

    setUpdateInterval(deadline) {
        this.clearUpdateInterval();

        this.interval = window.setInterval(() => {
            this.setState({ time: humanTime(deadline - Date.now()) });
            if (Date.now() > deadline) {
                console.log("we hit the future, clearing interval");
                this.clearUpdateInterval();
            }
        }, INTERVAL_MS);
    }

    componentDidMount() {
        const { deadline } = this.props;

        this.setUpdateInterval(deadline);

        quip.elements.addEventListener(
            quip.elements.EventType.ELEMENT_FOCUS,
            this.setElementFocus,
        );
        quip.elements.addEventListener(
            quip.elements.EventType.ELEMENT_BLUR,
            this.setElementFocus,
        );
        window.addEventListener("keydown", this.onKeyDown);
    }

    componentWillUnmount() {
        quip.elements.removeEventListener(
            quip.elements.EventType.ELEMENT_FOCUS,
            this.setElementFocus,
        );
        quip.elements.removeEventListener(
            quip.elements.EventType.ELEMENT_BLUR,
            this.setElementFocus,
        );
        window.removeEventListener("keydown", this.onKeyDown);
        this.clearUpdateInterval();
    }

    componentWillReceiveProps(nextProps) {
        if (
            (!this.props.deadline && nextProps.deadline) ||
            !this.props.deadline !== nextProps.deadline
        ) {
            if (this.interval) clearInterval(this.interval);
            console.log(
                "updating time",
                humanTime(nextProps.deadline - Date.now()),
            );
            this.interval = setInterval(
                () =>
                    this.setState({
                        time: humanTime(nextProps.deadline - Date.now()),
                    }),
                200,
            );
        }
    }

    onKeyDown = e => {
        isDeleteAction(e.keyCode) &&
            quip.elements.isElementFocused() &&
            quip.elements.deleteElement();
    };

    setElementFocus = () => {
        if (!quip.elements.isElementFocused()) {
            this.toggleCalendar(false);
        }
        this.setState({ focused: quip.elements.isElementFocused() });
    };

    toggleCalendar = show => {
        this.setState(
            p => ({
                showCalendar: show !== undefined ? show : !p.showCalendar,
            }),
            () => {
                if (this.state.showCalendar) {
                    quip.elements.addDetachedNode(this.calendar);
                } else {
                    quip.elements.removeDetachedNode(this.calendar);
                }
            },
        );
    };

    setDeadline = ms => {
        console.log("setDeadline", ms);
        const { rootRecord } = this.props;

        rootRecord.setProperty("deadline", ms);
        this.toggleCalendar(false);
        quip.elements.recordQuipMetric("set_deadline");
        //quip.elements.sendMessage(
        //    `set the date to ${formatDate(new Date(ms))}`,
        //);
    };

    timeBlock(time, i) {
        return (
            <TimeBlock
                color={this.props.color}
                key={i}
                number={this.state.time[time]}
                unit={time}
            />
        );
    }

    handleWrapperClick(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    render() {
        const { deadline } = this.props;
        const times = Object.keys(this.state.time);
        return (
            <div
                className={classNames(Styles.App, {
                    [Styles.resting]: !quip.elements.isElementFocused(),
                })}
                onClick={() => this.toggleCalendar(false)}
            >
                <div className={Styles.timeBlocks}>
                    {this.timeBlock(times[0], 0)}
                    {this.timeBlock(times[1], 1)}
                    {this.timeBlock(times[2], 2)}
                    {this.timeBlock(times[3], 3)}
                </div>

                {this.state.showCalendar && (
                    <div
                        ref={el => (this.calendar = el)}
                        className={Styles.calendarWrapper}
                        style={{
                            borderImageSource: `url(${require("./border.png")})`,
                        }}
                        onClick={this.handleWrapperClick}
                    >
                        <quip.elements.ui.CalendarPicker
                            initialSelectedDateMs={deadline}
                            onChangeSelectedDateMs={this.setDeadline}
                        />
                    </div>
                )}
            </div>
        );
    }
}
