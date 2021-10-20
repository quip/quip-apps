import React, {useEffect, useState} from "react";
import {menuActions, Menu} from "../menus";
import {AppData, RootEntity} from "../model/root";
import Dashboard from "./dashboard";
import Login from "./login";

interface MainProps {
    rootRecord: RootEntity;
    menu: Menu;
    isCreation: boolean;
    creationUrl?: string;
}

const Main = ({rootRecord, menu, isCreation, creationUrl}: MainProps) => {
    const [data, setData] = useState<AppData>(rootRecord.getData());

    const setupMenuActions_ = () => {
        menuActions.setViewSize = rootRecord.getActions().onSetViewSize;
    };

    const refreshData_ = () => {
        const data = rootRecord.getData();
        menu.updateToolbar(data);
        setData(data);
    };

    useEffect(() => {
        // on mount

        setupMenuActions_();
        rootRecord.listen(refreshData_);
        refreshData_();

        return () => {
            // on unmount
            rootRecord.unlisten(refreshData_);
        };
    }, []);

    let view = <Login />;
    if (data.loggedIn) {
        view = <Dashboard />;
    }

    return <div>{view}</div>;
};

export default Main;
