// Copyright 2017 Quip

import quip from "quip-apps-api";
import React from "react";
import {Provider} from "react-redux";
import {createStore} from "redux";
import appReducer from "./reducer";

import Calendar from "./components/Calendar";

import {setMenuDisplayMonth} from "./menus";
import {RootRecord} from "./model";
import {getIsSmallScreen} from "./util";
import manifest from "../manifest.json";

type Props = {
    rootNode: Element;
    rootRecord: RootRecord;
};

export default class App extends React.Component<Props, null> {
    store: any;

    constructor(props: Props) {
        super(props);
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
    }

    componentDidCatch(error, info) {
        const params = {
            "message": error.message,
            "version_number": manifest.version_number + "",
            "version_name": manifest.version_name + "",
        };
        if (error.stack) {
            params["stack"] = error.stack;
        }
        if (info && info.componentStack) {
            params["component_stack"] = info.componentStack;
        }
        quip.apps.recordQuipMetric("calendar_error", params);
    }

    render() {
        return <Provider store={this.store}>
            <Calendar/>
        </Provider>;
    }
}
