import React, { Component } from "react";
import cx from "classnames";
import omit from "lodash.omit";
import { StatusRecord, toJSONPropTypeShape } from "../model";

import { X } from "reline";

const { getRootRecord } = quip.apps;
const colors = quip.apps.ui.ColorMap;

import styles from "./StatusPicker.less";
const DEFAULT_COLOR = colors.BLUE;

class StatusPicker extends Component {
    static propTypes = {
        record: React.PropTypes.instanceOf(StatusRecord).isRequired,
        hidePicker: React.PropTypes.func.isRequired,
        statusTypes: toJSONPropTypeShape("array"),
        metricType: React.PropTypes.string,
    }

    constructor(props) {
        super(props);
        this.state = {
            colorPicker: "",
            editingStatus: { id: undefined, text: undefined },
        };
    }

    componentWillUnmount() {
        if (this.focusInt) clearInterval(this.focusInt);
    }

    newStatusSubmit = (e) => {
        const newStatus = e.target.value;
        const id = getRootRecord().addStatusType(newStatus, DEFAULT_COLOR).getId();
        this.focusNewlyCreatedStatus(id, newStatus);
        this.newStatusInput.blur();
        this.editStatus(e, id);
    }

    focusNewlyCreatedStatus = (id, newStatus) => {
        if (this.focusInt) clearInterval(this.focusInt);
        this.focusInt = setInterval(() => {
            if (this[id]) {
                this[id].selectionStart = newStatus.length;
                this[id].focus();
                clearInterval(this.focusInt);
            }
        }, 1);
    }

    removeStatus = (id) => {
        getRootRecord().removeStatusType(id);
    }

    setStatus = (e) => {
        this.props.hidePicker();
        this.props.record.setStatus(e.target.value);
        if (this.props.metricType) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "set_status",
            });
        }
    }

    changeColor = (id, color) => {
        getRootRecord().changeStatusColor(id, color);
        this.setState({ colorPicker: "" });
    }

    editStatus = (e, id) => {
        this.setState({ editingStatus: { id, text: e.target.value } }, () => {
            this.saveStatus();
        });
    }

    saveStatus = (e) => {
        const { text, id } = this.state.editingStatus;
        getRootRecord().changeStatusText(id, text);
    }

    makeColorPicker = (id) => {
        const { statusTypes } = this.props;
        const status = statusTypes.data.find((status) => status.id === id);
        const currentColorName = status ? status.color.KEY : DEFAULT_COLOR.KEY;
        return Object.keys(omit(colors, "WHITE")).map((color) => (
            <div
                key={color}
                onClick={() => this.changeColor(id, colors[color])}
                style={{ background: colors[color].VALUE }}
                className={cx(styles.colorSwatch, {
                    [styles.selected]: color === currentColorName,
                })}
            />
        ));
    }

    makeSwatch = (id, bgColor) => (
        <div
            onClick={() => this.setState({ colorPicker: this.state.colorPicker.length ? "" : id })}
            style={{ background: bgColor }}
            className={styles.colorSwatch}
        />
    )

    render() {
        const { record, statusTypes } = this.props;
        const { editingStatus } = this.state;
        const currentStatusId = record.getStatus();
        const statuses = statusTypes.data;

        return (
            <div className={styles.wrapper}>
                {statuses.map((status) => {
                    const id = status.id;
                    const color = status.color.VALUE;
                    const text = status.text;
                    return (
                        <div key={id} className={styles.optionWrapper}>
                            <input
                                className={styles.setStatus}
                                value={id}
                                onChange={this.setStatus}
                                checked={currentStatusId === id}
                                type="radio"
                            />
                            <div className={styles.nameColorWrapper}>
                                <input
                                    ref={el => this[id] = el}
                                    onChange={(e) => this.editStatus(e, id)}
                                    onKeyDown={this.saveStatus}
                                    style={{ color }}
                                    className={styles.nameInput}
                                    type="text"
                                    value={editingStatus.id === id ? editingStatus.text : text}
                                />
                                {this.makeSwatch(id, color)}
                                {this.state.colorPicker === id &&
                                    <div className={styles.colorPicker}>
                                        {this.makeColorPicker(id)}
                                    </div>
                                }
                            </div>
                            <div className={styles.deleteStatus} onClick={() => this.removeStatus(id)}>
                                <X strokeWidth={2} size={8} />
                            </div>
                        </div>
                    );
                })}
                <div className={cx(styles.nameColorWrapper, styles.newStatusWrapper)}>
                    <input
                        ref={el => this.newStatusInput = el}
                        value=""
                        onChange={this.newStatusSubmit}
                        className={styles.newStatusInput}
                        style={{ color: DEFAULT_COLOR.VALUE }}
                        type="text"
                        placeholder="New Status..."
                    />

                </div>
            </div>
        );
    }
}

export default StatusPicker;
