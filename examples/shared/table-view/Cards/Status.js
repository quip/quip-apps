import React, { Component } from "react";
import cx from "classnames";
import { X } from "reline";
import {
    StatusRecord,
    X_DELETE_MARGIN,
    X_SIZE,
    toJSONPropTypeShape,
} from "../model";
import StatusPicker from "./StatusPicker";
import Modal from "../lib/components/Modal";
import styles from "./Status.less";

const { getRootRecord } = quip.apps;

class Status extends Component {
    static propTypes = {
        record: React.PropTypes.instanceOf(StatusRecord).isRequired,
        rowHeight: React.PropTypes.number.isRequired,
        rootHeight: React.PropTypes.number.isRequired,
        textWidth: React.PropTypes.number,
        statusTypes: toJSONPropTypeShape("array"),
        metricType: React.PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            showPicker: false,
        };
    }

    clearStatus = e => {
        e.stopPropagation();
        this.props.record.clearStatus();
        if (this.props.metricType) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "clear_status",
            });
        }
    };

    showStatusContextMenu = e => {
        const menuCommands = this.props.statusTypes.data.map(statusType => {
            return {
                id: "status-" + statusType.id,
                label: statusType.text,
                handler: () => {
                    this.props.record.setStatus(statusType.id);
                },
            };
        });
        quip.apps.updateToolbar({menuCommands: menuCommands});
        quip.apps.showContextMenuFromButton(
            e,
            menuCommands.map(menuCommand => menuCommand.id),
            ["status-" + this.props.record.getStatus()], // highlighted
        );
    };

    showPicker = e => {
        if (quip.apps.isMobile()) {
            this.showStatusContextMenu(e.currentTarget);
        } else {
            this.setState({ showPicker: true });
        }
    };

    hidePicker = () => this.setState({ showPicker: false });

    render() {
        const {
            record,
            rowHeight,
            rootHeight,
            textWidth,
            statusTypes,
        } = this.props;
        const { showPicker } = this.state;
        const currentStatusId = record.getStatus();
        const currentStatus =
            currentStatusId && getRootRecord().getStatusById(currentStatusId);
        const { text, color } = currentStatus
            ? currentStatus.getData()
            : { text: "", color: {} };
        const modalStyle = {
            content: {
                width: 250,
            },
        };

        return (
            <div
                className={styles.wrapper}
                ref={el => (this.wrapper = el)}
                onClick={this.showPicker}
            >
                <div
                    className={cx(styles.textWrapper)}
                    style={{ color: text && color.VALUE, width: textWidth }}
                >
                    {text ? (
                        <div className={styles.statusSetWrapper}>
                            <div
                                style={{ marginRight: X_DELETE_MARGIN }}
                                className={styles.removeStatus}
                                onClick={this.clearStatus}
                            >
                                <X strokeWidth={2} size={X_SIZE} />
                            </div>
                            <div className={styles.withText}>{text}</div>
                        </div>
                    ) : (
                        <div className={styles.withoutText}>{quiptext("Set Status...")}</div>
                    )}
                </div>
                <Modal
                    style={modalStyle}
                    onRequestClose={this.hidePicker}
                    rootHeight={rootHeight}
                    topOffset={rowHeight / 2 + 20}
                    isOpen={showPicker}
                    onBlur={this.hidePicker}
                    wrapperRef={this.wrapper}
                >
                    <StatusPicker
                        statusTypes={statusTypes}
                        hidePicker={this.hidePicker}
                        record={record}
                        metricType={this.props.metricType}
                    />
                </Modal>
            </div>
        );
    }
}

export default Status;
