import React, { Component } from "react";
import { X } from "reline";
import cx from "classnames";
import { FileRecord, X_DELETE_MARGIN, X_SIZE } from "../model";
import styles from "./File.less";

const STATES = {
    UPLOADING: "uploading",
    CHOOSE_FILE: "choosefile",
    HAS_FILE: "hasfile",
};

class File extends Component {
    static propTypes = {
        record: React.PropTypes.instanceOf(FileRecord).isRequired,
        textWidth: React.PropTypes.number,
        metricType: React.PropTypes.string,
    }

    constructor(props) {
        super(props);
        this.state = {
            uploading: false,
            blobId: null,
        };
    }

    componentWillMount() {
        const { record } = this.props;
        this.setState({ blobId: record.getBlob() });
    }

    onClick = () => {
        const { blobId } = this.state;
        if (blobId) {
            return quip.apps.getBlobById(blobId).openInLightbox();
        }
        return quip.apps.showFilePicker(
            () => this.setState({ uploading: true }),
            this.saveBlobId
        );
    }

    saveBlobId = (blobArr) => {
        const { record } = this.props;
        const blobId = blobArr[0].blob.id();
        record.setBlob(blobId);
        this.setState({ uploading: false, blobId });
        if (this.props.metricType) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "add_file",
            });
        }
    }

    removeFile = (e) => {
        e.stopPropagation();
        this.props.record.removeBlob();
        this.setState({ blobId: null });
        if (this.props.metricType) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "remove_file",
            });
        }
    }

    getCurrentState = () => {
        const { uploading, blobId } = this.state;
        if (uploading) return STATES.UPLOADING;
        if (!uploading && !blobId) return STATES.CHOOSE_FILE;
        if (!uploading && blobId) {
            const blob = quip.apps.getBlobById(blobId);
            return blob ? STATES.HAS_FILE : STATES.UPLOADING;
        }
    }

    getBody = () => {
        switch (this.getCurrentState()) {
        case STATES.UPLOADING:
            return quiptext("Uploading...");
        case STATES.CHOOSE_FILE:
            return quiptext("Choose File...");
        case STATES.HAS_FILE:
            return quip.apps.getBlobById(this.state.blobId).filename();
        default: return "";
        }
    }

    render() {
        const { textWidth } = this.props;
        const currentState = this.getCurrentState();
        const fileClasses = cx(styles.file, {
            [styles.fileSetWrapper]: currentState === STATES.HAS_FILE,
        });
        
        return (
            <div style={{ width: textWidth }} className={styles.wrapper}>
                {currentState === STATES.HAS_FILE &&
                    <div style={{ marginRight: X_DELETE_MARGIN }} className={styles.removeFile} onClick={this.removeFile}>
                        <X strokeWidth={2} size={X_SIZE} />
                    </div>
                }
                <div onClick={this.onClick} className={fileClasses}>
                    {this.getBody()}
                </div>
            </div>
        );
    }
}

export default File;
