import React from "react";

import {Button, Card} from "@salesforce/design-system-react";

import ListView from "./ListView.jsx";

import {DEFAULT_API_VERSION, getAuth} from "./connectRecord";
import {setAppContext} from "./menus";

import Styles from "./App.less";

const LOAD_LISTVIEWDATA_TIMEOUT = 5000;

export default class App extends React.Component {
    constructor(props) {
        super();
        setAppContext(this);
        this.loadListViewDataTimeout = null;
    }

    componentDidMount() {
        if (this.props.isLoggedIn) {
            this.loadListViewData();
        }
    }

    componentWillUnmount() {
        if (this.loadListViewDataTimeout) {
            window.clearTimeout(this.loadListViewDataTimeout);
        }
    }

    componentDidUpdate(prevProps) {
        const becameLoggedIn = this.props.isLoggedIn && !prevProps.isLoggedIn;
        if (becameLoggedIn) {
            this.loadListViewData();
        }
    }

    login = () => {
        console.debug("App.login");
        this.props.login();
    };

    logout = () => {
        console.debug("App.logout");
        this.props.logout();
    };

    loadListViewData = (retry = true) => {
        const recordId = this.props.recordId;
        const instanceUrl = getAuth().getTokenResponse().instance_url;
        const url = `${instanceUrl}/services/data/v${DEFAULT_API_VERSION}/ui-api/list-ui/${recordId}`;
        console.debug("Loading list view data", url);

        return getAuth()
            .request({url})
            .then(response => {
                if (!response.ok && response.status === 401) {
                    if (retry) {
                        console.debug("RETRY AUTH refreshToken()");
                        getAuth()
                            .refreshToken()
                            .then(resp => {
                                console.debug("refreshToken() worked!", {resp});
                                this.loadListViewData(false);
                            })
                            .catch(err => {
                                console.debug({err});
                                this.props.logout();
                            });
                    } else {
                        this.props.logout();
                    }
                    return;
                }
                const listViewData = response.json();
                this.setListViewData(listViewData);
                if (this.loadListViewDataTimeout) {
                    window.clearTimeout(this.loadListViewDataTimeout);
                }
                this.loadListViewDataTimeout = window.setTimeout(
                    this.loadListViewData,
                    LOAD_LISTVIEWDATA_TIMEOUT
                );
            })
            .catch(err => {
                console.error("REQUEST ERROR", err);
            });
    };

    setListViewData = listViewData => {
        console.debug(
            "Got listViewData",
            listViewData,
            "vs",
            this.props.listViewData
        );

        if (
            this.props.listViewData &&
            listViewData.eTag === this.props.listViewData.eTag
        ) {
            console.debug("no listViewData updates needed");
            return;
        }
        const rootRecord = quip.apps.getRootRecord();
        const recordList = rootRecord.get("myRecords");

        let idMap = {};
        recordList.getRecords().forEach(record => {
            idMap[record.get("id")] = 1;
        });
        listViewData.records.records.forEach(record => {
            const id = record.id;
            if (!idMap[id]) {
                console.debug("adding record", record);
                recordList.add({id});
            }
        });
        // (over)write with the latest/greatest
        rootRecord.set("listViewData", listViewData);
    };

    render() {
        const {isLoggedIn, listViewData, selection} = this.props;

        let el;
        if (isLoggedIn && listViewData) {
            el = <ListView data={listViewData} selection={selection} />;
        } else {
            el = (
                <Card heading={quiptext("Salesforce List UI")}>
                    <div style={{padding: "10px 20px"}}>
                        <Button onClick={this.login}>Sign In</Button>
                    </div>
                </Card>
            );
        }
        return <div className={Styles.App}>{el}</div>;
    }
}
