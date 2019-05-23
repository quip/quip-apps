import React from "react";

import ListView from "./ListView.jsx";

import { DEFAULT_API_VERSION, getAuth } from "./connectRecord";
import { setAppContext } from "./menus";


export default class App extends React.Component {
  constructor(props) {
    super();
    setAppContext(this);
    console.debug("constructor", { props });
  }

  componentDidMount() {
    if (this.props.isLoggedIn) {
      this.loadListViewData();
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

  loadListViewData = () => {
    if (false && this.props.listViewData) {
      console.debug("already got listViewData", this.props.listViewData);
      return;
    }
    const recordId = this.props.recordId;
    const tokenResponse = getAuth().getTokenResponse();
    const url = `${
      tokenResponse.instance_url
    }/services/data/v${DEFAULT_API_VERSION}/ui-api/list-ui/${recordId}`;

    return getAuth()
      .request({ url })
      .then(response => {
        const listViewData = response.ok ? response.json() : null;
        if (!response.ok) {
          console.error("REQUEST ERROR", response);
          return;
        }
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
        recordList.forEach(record => {
          idMap[record.get("id")] = 1;
        });
        listViewData.records.records.forEach(record => {
          const id = record.id;
          if (!idMap[id]) {
            console.debug("adding record", record);
            recordList.add({ id });
          }
        });
        // (over)write with the latest/greatest
        rootRecord.set("listViewData", listViewData);
      })
      .catch(err => {
        console.error("REQUEST ERROR", err);
      });
  };

  render() {
    const { isLoggedIn, listViewData, selection } = this.props;

    let el;
    if (isLoggedIn && listViewData) {
      el = <ListView data={listViewData} selection={selection} />;
    } else {
      el = <button onClick={this.login}>login</button>;
    }
    return <div>{el}</div>;
  }
}
