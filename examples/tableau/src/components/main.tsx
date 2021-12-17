import React, {useEffect, useState} from "react";
import {menuActions, Menu} from "../menus";
import {AppData, RootEntity, ViewWidth} from "../model/root";
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
        menuActions.setViewWidth = (size: ViewWidth) =>
            rootRecord.setViewWidth(size);
        menuActions.login = () => rootRecord.login();
        menuActions.logout = () => rootRecord.logout();
        menuActions.changeView = () => rootRecord.openSelectDashboard();
        menuActions.openInTableau = () => rootRecord.openInTableau();
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

        if (isCreation && creationUrl) {
            rootRecord.setNewDashboardUrl(creationUrl);
            rootRecord.setNewDashboard();
        }

        refreshData_();

        return () => {
            // on unmount
            rootRecord.unlisten(refreshData_);
        };
    }, []);

    let view = <Login isConfigured={!!data.viewUrl} rootRecord={rootRecord} />;
    if (data.loggedIn) {
        view = <Dashboard rootRecord={rootRecord} />;
    }

    return <div className="main">{view}</div>;
};

export default Main;
