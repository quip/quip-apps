// Copyright 2017 Quip

import React from "react";
import ReactDOM from "react-dom";
import quip from "quip";

import Row, {HeaderRow} from "./Row.jsx";
import Styles from "./App.less";

import {setSelectedRowIds} from "../root.jsx";

export default class App extends React.Component {
    static propTypes = {
        rows: React.PropTypes.any.isRequired,
        rootRecord: React.PropTypes.instanceOf(quip.apps.RootRecord).isRequired,
    };

    constructor(props) {
        super();
        this.state = {
            isLoggedIn: !!quip.apps.getUserPreferences().getForKey("token"),
            selectedRowIds: [],
        };
    }

    componentDidMount() {
        quip.apps.addEventListener(
            quip.apps.EventType.USER_PREFERENCE_UPDATE,
            () => {
                this.setState({
                    isLoggedIn: !!quip.apps
                        .getUserPreferences()
                        .getForKey("token"),
                });
            }
        );
    }

    deleteRow = ({row}) => {
        row.delete();
    };

    isSelectedRow = rowId => {
        return this.state.selectedRowIds.indexOf(rowId) !== -1;
    };

    setRowSelected = rowId => {
        const {selectedRowIds} = this.state;
        const i = selectedRowIds.indexOf(rowId);
        if (i === -1) {
            selectedRowIds.push(rowId);
        } else {
            selectedRowIds.splice(i, 1);
        }
        this.setState({selectedRowIds});
        setSelectedRowIds(selectedRowIds);
    };

    render() {
        const {rows, rootRecord} = this.props;
        const {isLoggedIn} = this.state;

        return (
            <div className={Styles.app}>
                <h2>Feedback</h2>
                <div className={Styles.table}>
                    <HeaderRow />
                    {rows
                        .getRecords()
                        .map((row, i, records) => (
                            <Row
                                key={row.getId()}
                                isLoggedIn={isLoggedIn}
                                record={row}
                                selected={this.isSelectedRow(row.getId())}
                                setRowSelected={this.setRowSelected}
                            />
                        ))}
                </div>
            </div>
        );
    }
}
