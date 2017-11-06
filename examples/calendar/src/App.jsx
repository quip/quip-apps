/* @flow */
// Copyright 2017 Quip

// $FlowIssueQuipModule
import quip from "quip";
import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import appReducer from "./reducer";

import Calendar from "./components/Calendar.jsx";

import { setMenuDisplayMonth } from "./menus";
import { RootRecord } from "./model";
import { getIsSmallScreen } from "./util";

type Props = {
    rootNode: Element,
    rootRecord: RootRecord,
};

export default class App extends React.Component<Props, null> {
    store: any;

    constructor(props: Props) {
        super();
        const displayMonth = props.rootRecord.getDisplayMonth();
        this.store = createStore(appReducer, {
            displayMonth,
            events: props.rootRecord.getEvents(),
            isSmallScreen: getIsSmallScreen(),
            isMobileApp: quip.apps.isMobile(),
            rootNode: props.rootNode,
            rootRecord: props.rootRecord,
            selectedEvent: undefined,
        });
        setMenuDisplayMonth(displayMonth);
        //, window.__REDUX_DEVTOOLS_EXTENSION__ &&
        // window.__REDUX_DEVTOOLS_EXTENSION__()
    }

    render() {
        return (
            <Provider store={this.store}>
                <Calendar />
            </Provider>
        );
    }
}
