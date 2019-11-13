// Copyright 2017 Quip

import React from "react";

export default class RowContainer extends React.Component {
    static propTypes = {
        rows: React.PropTypes.array.isRequired,
        renderRow: React.PropTypes.func.isRequired,
        containerClassName: React.PropTypes.string,
        isActive: React.PropTypes.bool,
        onSubmitSelectedRow: React.PropTypes.func,
        onSelectionChange: React.PropTypes.func,
        onScroll: React.PropTypes.func,
        selectOnHover: React.PropTypes.bool,
        defaultSelectedRowIndex: React.PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedRowIndex: Number.isFinite(props.defaultSelectedRowIndex)
                ? props.defaultSelectedRowIndex
                : null,
        };
        // This is used for when mouse is in the row container and when the user
        // presses arrow up/down to chose a row: when scroll happens the
        // scrolled row under the mouse will receive the mouseEnter event, but
        // we don't wanna handle this because we want the keyboard selection to
        // take precedence.
        this.enabledMouseHover_ = true;
    }

    componentDidMount() {
        if (this.props.isActive) {
            document.addEventListener("keydown", this.keyHandler_, false);
            this.addedKeydownListener_ = true;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.onSelectionChange &&
            this.state.selectedRowIndex !== prevState.selectedRowIndex) {
            const row = this.props.rows[this.state.selectedRowIndex];
            this.props.onSelectionChange(
                null,
                row,
                this.state.selectedRowIndex);
        }
    }

    componentWillUnmount() {
        if (this.addedKeydownListener_) {
            document.removeEventListener("keydown", this.keyHandler_, false);
        }
    }

    keyHandler_ = e => {
        let newIndex;
        if (e.key === "ArrowDown") {
            if (this.state.selectedRowIndex === null) {
                newIndex = 0;
            } else {
                newIndex = this.state.selectedRowIndex + 1;
            }
        } else if (e.key === "ArrowUp") {
            if (this.state.selectedRowIndex === null) {
                newIndex = this.props.rows.length - 1;
            } else {
                newIndex = this.state.selectedRowIndex - 1;
            }
        } else if (e.key === "Enter") {
            if (this.props.onSubmitSelectedRow) {
                const row = this.props.rows[this.state.selectedRowIndex];
                this.props.onSubmitSelectedRow(
                    e,
                    row,
                    this.state.selectedRowIndex);
                e.preventDefault();
            }
        }
        if (Number.isFinite(newIndex) &&
            newIndex >= 0 &&
            newIndex < this.props.rows.length) {
            this.setState({selectedRowIndex: newIndex});
            const containerNode = this.containerNode_;
            if (containerNode) {
                containerNode.children[newIndex].scrollIntoViewIfNeeded(false);
            }
            e.preventDefault();
        }
        this.enabledMouseHover_ = false;
    };

    onRowMouseEnter_ = (e, index) => {
        if (this.enabledMouseHover_) {
            this.setState({selectedRowIndex: index});
        }
    };

    onRowMouseLeave_ = (e, index) => {
        if (this.enabledMouseHover_) {
            this.setState({selectedRowIndex: null});
        }
    };

    onRowClick_ = (e, index) => {
        this.setState({selectedRowIndex: index});
    };

    onRowDoubleClick_ = (e, index) => {
        const row = this.props.rows[this.state.selectedRowIndex];
        if (this.props.onSubmitSelectedRow) {
            this.props.onSubmitSelectedRow(e, row, this.state.selectedRowIndex);
        }
    };

    onMouseMove_ = e => {
        this.enabledMouseHover_ = true;
    };

    onWheel_ = e => {
        const results = e.currentTarget;
        if (results != null) {
            const height = results.clientHeight;
            const scrollHeight = results.scrollHeight;
            const deltaY = -e.deltaY;
            const scrollTop = Math.round(results.scrollTop);
            if ((scrollTop === scrollHeight - height && deltaY < 0) ||
                (scrollTop === 0 && deltaY > 0)) {
                e.preventDefault();
            }
        }
    };

    render() {
        return <div
            className={this.props.containerClassName}
            onWheel={this.onWheel_}
            onScroll={this.props.onScroll}
            onMouseMove={this.onMouseMove_}
            ref={node => (this.domNode = node)}>
            {this.props.rows.map((row, index) => {
                const isHighlighted = index === this.state.selectedRowIndex;
                return <div
                    key={index}
                    onClick={e => this.onRowClick_(e, index)}
                    onDoubleClick={e => this.onRowDoubleClick_(e, index)}
                    onMouseEnter={
                        this.props.selectOnHover
                            ? e => this.onRowMouseEnter_(e, index)
                            : null
                    }
                    onMouseLeave={
                        this.props.selectOnHover
                            ? e => this.onRowMouseLeave_(e, index)
                            : null
                    }>
                    {this.props.renderRow(row, isHighlighted, index)}
                </div>;
            })}
        </div>;
    }
}
