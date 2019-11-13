// Copyright 2017 Quip

import React from "react";
import Checkbox from "../../shared/base-field-builder/icons/checkbox.jsx";
import RowContainer from "../../shared/base-field-builder/row-container.jsx";
import Styles from "./record-list.less";

export default class ColumnPicker extends React.Component {
    static propTypes = {
        initialColumns: React.PropTypes.arrayOf(React.PropTypes.object)
            .isRequired,
        selectedColumns: React.PropTypes.arrayOf(React.PropTypes.object)
            .isRequired,
        onComplete: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedColumns: props.selectedColumns,
        };
    }

    render() {
        return <div className={Styles.dialog}>
            <div className={Styles.editColumnHeader}>
                {quiptext("Edit Columns")}
            </div>
            <RowContainer
                rows={this.props.initialColumns}
                renderRow={this.renderRow_}
                containerClassName={Styles.editColumnContents}/>
            <div className={Styles.actions}>
                <quip.elements.ui.Button
                    text={quiptext("Cancel")}
                    onClick={this.cancelDialog_}/>
                <quip.elements.ui.Button
                    primary={true}
                    onClick={this.saveColumns_}
                    text={quiptext("Save Columns")}/>
            </div>
        </div>;
    }

    cancelDialog_ = () => {
        this.props.onComplete(false, this.state.selectedColumns);
    };

    saveColumns_ = () => {
        this.props.onComplete(true, this.state.selectedColumns);
    };

    renderRow_ = (field, isHighlighted, index) => {
        const classNames = [Styles.fieldRow];
        if (this.state.selectedColumns.find(
                column => column.key === field.key)) {
            classNames.push(Styles.highlighted);
        }
        return <div
            className={classNames.join(" ")}
            onClick={() => {
                this.toggleColumn_(field);
            }}>
            <Checkbox/>
            {field.label}
        </div>;
    };

    toggleColumn_ = field => {
        const column = this.state.selectedColumns.find(
            column => column.key === field.key);
        if (column) {
            this.state.selectedColumns.splice(
                this.state.selectedColumns.indexOf(column),
                1);
            this.setState({selectedColumns: this.state.selectedColumns});
        } else {
            this.state.selectedColumns.push(field);
            this.setState({selectedColumns: this.state.selectedColumns});
        }
    };
}
