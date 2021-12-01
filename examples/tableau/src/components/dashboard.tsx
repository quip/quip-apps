import quip from "quip-apps-api";
import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import {TABLEAU_BASE_URL, TABLEAU_JS_LIB} from "../config";
import {AppData, RootEntity} from "../model/root";
import Dialog from "./dialog";
import FilterManager from "./filters/filterManager";

interface DashboardProps {
    rootRecord: RootEntity;
}

const Dashboard = ({rootRecord}: DashboardProps) => {
    const [data, setData] = useState<AppData>(rootRecord.getData());

    const refreshData_ = () => {
        console.log("Data update");
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
            quip.apps.clearEmbeddedIframe();
        };
    }, []);

    useEffect(() => {
        // on mount
        const script = document.createElement("script");
        script.src = TABLEAU_JS_LIB;
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

    const vizContainer = useRef<HTMLDivElement | null>(null);

    const filterChangedHandler_ = async (e) => {
        const worksheet = e.detail.worksheet;
        const fieldName = e.detail.fieldName;
        console.log("Filter changed", e);
        const filters = await worksheet.getFiltersAsync();
        const filter = filters.find((f) => f.fieldName === fieldName);
        if (filter) {
            // rootRecord.setFilter(
            //     filter.fieldId,
            //     filter.fieldName,
            //     filter.appliedValues.map((v) => v.value).join(",")
            // );
        }
    };

    const initVizHandler_ = () => {
        vizContainer.current?.addEventListener(
            "filterchanged",
            filterChangedHandler_
        );

        // const parameters = (
        //     await Promise.all(
        //         element.workbook.activeSheet.worksheets.map((ws) =>
        //             ws._worksheetImpl.getParametersAsync()
        //         )
        //     )
        // ).reduce((arr, params) => [...arr, ...params], []);

        // window.vizParams = parameters;
        // console.log(parameters);
    };

    const setContainer = (element: HTMLDivElement) => {
        quip.apps.clearEmbeddedIframe();
        if (vizContainer.current) {
            vizContainer.current.removeEventListener(
                "firstinteractive",
                initVizHandler_
            );
            vizContainer.current.removeEventListener(
                "filterchanged",
                filterChangedHandler_
            );
        }

        if (element) {
            vizContainer.current = element;
            window.viz = vizContainer.current;
            quip.apps.registerEmbeddedIframe(element);
            element.addEventListener("firstinteractive", initVizHandler_);
        }
    };

    const isNewUrlValid =
        data.newDashboardUrl.length > 0 &&
        data.newDashboardUrl.startsWith(TABLEAU_BASE_URL);

    const isConfigured = !!data.viewUrl && !!data.token;

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

    if (isConfigured) {
        console.log("Found filters", data.filters);
        const filters = data.filters.map((filter) => (
            <viz-filter
                key={filter.id}
                field={filter.name}
                value={filter.value}></viz-filter>
        ));

        dashboard = (
            <div>
                <tableau-viz
                    src={data.viewUrl}
                    width={data.width}
                    id="dashboard"
                    token={data.token}
                    ref={(el) => setContainer(el)}>
                    {filters}
                </tableau-viz>
                <FilterManager rootRecord={rootRecord} />
            </div>
        );
    }

    let dashboardSelector = null;
    if (data.selectOpen) {
        dashboardSelector = (
            <Dialog
                title="Select a Tableau Dashboard"
                onDismiss={closeSelectDashboard}>
                <div className="body">
                    <div className="margin-m input-box">
                        <label htmlFor="dash-url">Tableau Dashboard URL</label>
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
