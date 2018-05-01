import React, {Component} from "react";
import {X} from "reline";
import {DateRecord, X_DELETE_MARGIN, X_SIZE} from "../model";
import Modal from "../lib/components/Modal";
import styles from "./Deadline.less";

const {CalendarPicker} = quip.apps.ui;

class Deadline extends Component {
    static propTypes = {
        record: React.PropTypes.instanceOf(DateRecord).isRequired,
        rowHeight: React.PropTypes.number.isRequired,
        rootHeight: React.PropTypes.number.isRequired,
        textWidth: React.PropTypes.number,
        metricType: React.PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            showCalendar: false,
        };
    }

    modalOpen = () =>
        !quip.apps.isMobile() && this.setState({showCalendar: true});
    modalClose = () => this.setState({showCalendar: false});

    pickDate = e => {
        quip.apps.pickDate(dateMs => this.props.record.setDate(dateMs), {
            initialDateMs: this.props.record.getDate(),
            anchor: e.currentTarget,
            offsetY: 20,
        });
        if (this.props.metricType) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "set_date",
            });
        }
    };

    changeDate = ms => {
        this.props.record.setDate(ms);
        if (this.props.metricType) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "set_date",
            });
        }
        this.modalClose();
    };

    clearDate = e => {
        e.stopPropagation();
        this.props.record.clearDate();
        if (this.props.metricType) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "clear_date",
            });
        }
    };

    formatDate = dateMs => {
        const formattedDate = new Date(dateMs).toDateString().split(" ");
        formattedDate.shift();
        return formattedDate.join(" ");
    };

    render() {
        const {record, rowHeight, rootHeight, textWidth} = this.props;
        const {showCalendar} = this.state;
        const date = record.getDate();

        return <div
            ref={el => (this.wrapper = el)}
            onClick={quip.apps.pickDate ? this.pickDate : this.modalOpen}
            className={styles.wrapper}>
            <div
                style={{
                    fontStyle: !date && "oblique",
                    width: textWidth,
                }}
                className={styles.dateText}>
                {date ? (
                    <div
                        className={styles.dateSetWrapper}
                        style={{
                            marginRight: X_DELETE_MARGIN,
                            width: textWidth,
                        }}>
                        <div
                            className={styles.removeDate}
                            onClick={this.clearDate}>
                            <X strokeWidth={2} size={X_SIZE}/>
                        </div>
                        <div className={styles.setDate}>
                            {this.formatDate(date)}
                        </div>
                    </div>
                ) : (
                    quiptext("Set Date...")
                )}
            </div>
            <Modal
                onRequestClose={this.modalClose}
                rootHeight={rootHeight}
                topOffset={rowHeight / 2 + 20}
                isOpen={showCalendar}
                onBlur={this.modalClose}
                wrapperRef={this.wrapper}>
                <CalendarPicker
                    initialSelectedDateMs={date || Date.now()}
                    onChangeSelectedDateMs={this.changeDate}/>
            </Modal>
        </div>;
    }
}

export default Deadline;
