import quip from "quip-apps-api";
import React, {useEffect, useState} from "react";
import {menuActions} from "../../menus";
import {RootEntity} from "../../model/root";
import Dialog from "../dialog";
import AddFilter from "./addFilter";

interface FilterManagerProps {
    rootRecord: RootEntity;
}

const FilterManager = ({rootRecord}: FilterManagerProps) => {
    const [open, setOpen] = useState(false);
    const [newFilter, setNewFilter] = useState(false);

    const setupMenuActions_ = () => {
        menuActions.openFilters = () => {
            setOpen(true);
        };
    };

    const closeFilters = () => {
        setOpen(false);
    };

    const addNewFilter = () => {
        setNewFilter(true);
    };

    const closeNewFilter = () => {
        setNewFilter(false);
    };

    useEffect(() => {
        setupMenuActions_();
    }, []);

    let manager;
    if (open) {
        let addFilter;
        if (newFilter) {
            addFilter = (
                <AddFilter rootRecord={rootRecord} onClose={closeNewFilter} />
            );
        }

        manager = (
            <Dialog title="Manage Filters" onDismiss={closeFilters}>
                <div className="body">
                    <div className="margin-m input-box"></div>
                </div>
                <div
                    className="footer"
                    style={{justifyContent: "space-between"}}>
                    <quip.apps.ui.Button
                        text="Add Filter"
                        onClick={addNewFilter}
                    />
                    <quip.apps.ui.Button
                        text="Done"
                        primary
                        onClick={closeFilters}
                    />
                </div>
                {addFilter}
            </Dialog>
        );
    }

    return <>{manager}</>;
};

export default FilterManager;
