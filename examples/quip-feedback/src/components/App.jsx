// Copyright 2017 Quip

import React from "react";
import ReactDOM from "react-dom";
import quip from "quip";

import Row, {HeaderRow} from "./Row.jsx";
import Styles from "./App.less";

import {setSelectedRowIds} from "../root.jsx";
import {auth} from "../model";

export default class App extends React.Component {
    static propTypes = {
        rows: React.PropTypes.any.isRequired,
        rootRecord: React.PropTypes.instanceOf(quip.apps.RootRecord).isRequired,
    };

    constructor(props) {
        super();
        this.state = {
            isLoggedIn: auth().isLoggedIn(),
            documentMembers: quip.apps.getDocumentMembers(),
            selectedRowIds: [],
        };
    }

    componentDidMount() {
        quip.apps.addEventListener(
            quip.apps.EventType.DOCUMENT_MEMBERS_LOADED,
            () => {
                this.setState({
                    documentMembers: quip.apps.getDocumentMembers(),
                });
            }
        );

        quip.apps.addEventListener(
            quip.apps.EventType.USER_PREFERENCE_UPDATE,
            () => {
                this.setState({
                    isLoggedIn: auth().isLoggedIn(),
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
        const {documentMembers, isLoggedIn} = this.state;

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
                                documentMembers={documentMembers}
                                isLoggedIn={isLoggedIn}
                                record={row}
                                selected={this.isSelectedRow(row.getId())}
                                setRowSelected={this.setRowSelected}
                            />
                        ))}
                </div>
                <div
                    style={{
                        color: "#999",
                        fontSize: "75%",
                        marginTop: 5,
                    }}>
                    Feedback docs will be shared with{" "}
                    {documentMembers.map((p, i, arr) => (
                        <span>
                            {p.getName()}
                            {i < arr.length - 1 ? " and " : null}
                        </span>
                    ))}
                </div>
            </div>
        );
    }
}
