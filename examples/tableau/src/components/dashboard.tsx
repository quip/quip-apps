import quip from "quip-apps-api";
import React, {ChangeEvent, useEffect, useMemo, useState} from "react";
import {TABLEAU_BASE_URL} from "../config";
import {AppData, RootEntity} from "../model/root";
import Dialog from "./dialog";
// import {TableauViz} from "../tableau.embedding.3.0";

interface DashboardProps {
    rootRecord: RootEntity;
}

const Dashboard = ({rootRecord}: DashboardProps) => {
    const [data, setData] = useState<AppData>(rootRecord.getData());

    const refreshData_ = () => {
        const data = rootRecord.getData();
        setData(data);
    };

    useEffect(() => {
        // on mount

        rootRecord.listen(refreshData_);
        refreshData_();

        return () => {
            // on unmount
            rootRecord.unlisten(refreshData_);
        };
    }, []);

    useEffect(() => {
        // on mount
        const script = document.createElement("script");
        script.src =
            "https://embedding.tableauusercontent.com/dist-embedding/tableau.embedding.3.0.latest.js";
        document.body.appendChild(script);

        return () => {
            // on unmount
            document.body.removeChild(script);
        };
    }, []);

    const openSelectDashboard = () => {
        rootRecord.openSelectDashboard();
    };

    const closeSelectDashboard = () => {
        rootRecord.closeSelectDashboard();
    };

    const selectDashboard = () => {
        rootRecord.setNewDashboard();
    };

    const updateNewDashboardUrl = (event: ChangeEvent<HTMLInputElement>) => {
        rootRecord.setNewDashboardUrl(event.currentTarget.value.trim());
    };

    const isNewUrlValid =
        data.newDashboardUrl.length > 0 &&
        data.newDashboardUrl.startsWith(TABLEAU_BASE_URL);

    const isConfigured = !!data.viewUrl;

    let dashboard = (
        <div className="container config">
            <img
                src="assets/logo.png"
                alt="Tableau Logo"
                className="logo margin-m"
            />
            <quip.apps.ui.Button
                text="Select Dashboard…"
                className="margin-m"
                primary
                onClick={openSelectDashboard}
            />
        </div>
    );

    const memoViz = useMemo(() => {
        // @ts-ignore
        const viz = <tableau-viz src={data.viewUrl}></tableau-viz>;
        // const viz = new TableauViz();
        // if (data.viewUrl) {
        //     viz.src = data.viewUrl;
        // }
        // return viz;
        return viz;
    }, [data.viewUrl]);

    if (isConfigured) {
        dashboard = <div>{memoViz}</div>;
    }

    let dashboardSelector = null;
    if (data.selectOpen) {
        dashboardSelector = (
            <Dialog onDismiss={closeSelectDashboard}>
                <div className="modal">
                    <div className="header">Select a Tableau Dashboard</div>
                    <div className="body">
                        <div className="margin-m input-box">
                            <label htmlFor="dash-url">
                                Tableau Dashboard URL
                            </label>
                            <input
                                id="dash-url"
                                type="url"
                                value={data.newDashboardUrl}
                                onChange={updateNewDashboardUrl}
                                placeholder="Enter Tableau Dashboard URL"
                            />
                        </div>
                    </div>
                    <div className="footer">
                        <quip.apps.ui.Button
                            text="Cancel"
                            onClick={closeSelectDashboard}
                        />
                        <quip.apps.ui.Button
                            text="Select Dashboard"
                            primary
                            disabled={!isNewUrlValid}
                            onClick={selectDashboard}
                        />
                    </div>
                </div>
            </Dialog>
        );
    }

    return (
        <>
            {dashboard}
            {dashboardSelector}
        </>
    );
};

export default Dashboard;
