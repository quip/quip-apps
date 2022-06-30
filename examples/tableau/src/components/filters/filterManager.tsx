import quip from "quip-apps-api";
import React, {ReactNode, useEffect, useState} from "react";
import {menuActions} from "../../menus";
import {
    Filter,
    FilterType,
    PeriodType,
    RangeFilterData,
    RangeType,
    RelativeDateFilterData,
    RootEntity,
    SimpleFilterData,
} from "../../model/root";
import Dialog from "../dialog";
import AddFilter from "./addFilter";
import RowItem from "../rowItem";

interface FilterManagerProps {
    rootRecord: RootEntity;
}

const FilterManager = ({rootRecord}: FilterManagerProps) => {
    const [open, setOpen] = useState(false);
    const [newFilter, setNewFilter] = useState(false);
    const [editFilter, setEditFilter] = useState<string | undefined>();

    const setupMenuActions_ = () => {
        menuActions.openFilters = () => {
            setOpen(true);
        };
    };

    const closeFilters = () => {
        setOpen(false);
    };

    const addNewFilter = () => {
        setEditFilter(undefined);
        setNewFilter(true);
    };

    const closeNewFilter = () => {
        setNewFilter(false);
        setEditFilter(undefined);
    };

    const editExistingFilter = (id: string) => {
        setEditFilter(id);
        setNewFilter(true);
    };

    const updateFilter = (id: string, type: FilterType, newData: Filter) => {
        rootRecord.setFilter(
            id,
            type,
            newData.name,
            newData.active,
            newData.value
        );
    };

    const toggleFilter = (id: string) => {
        const filter = data.filters.find((f) => f.id === id);
        if (filter) {
            updateFilter(filter.id, filter.type, {
                ...filter,
                active: !filter.active,
            });
        }
    };

    useEffect(() => {
        setupMenuActions_();
    }, []);

    const data = rootRecord.getData();

    let manager = <div></div>;
    if (open) {
        let addFilter;
        if (newFilter) {
            addFilter = (
                <AddFilter
                    rootRecord={rootRecord}
                    onClose={closeNewFilter}
                    id={editFilter}
                />
            );
        }

        let filters: ReactNode = (
            <div className="empty-message">No filters yet. Create one now!</div>
        );
        if (data.filters.length > 0) {
            filters = data.filters.map((filter) => {
                let subtitle = "";
                if (filter.type === FilterType.Simple) {
                    subtitle = `Equals ${
                        (filter as SimpleFilterData).value.value
                    }`;
                } else if (filter.type === FilterType.Range) {
                    const value = (filter as RangeFilterData).value;
                    if (value.min !== "" && value.max === "") {
                        subtitle = `Starting from ${value.min}`;
                    } else if (value.min === "" && value.max !== "") {
                        subtitle = `Up to ${value.max}`;
                    } else {
                        subtitle = `Between ${value.min} and ${value.max}`;
                    }
                } else if (filter.type === FilterType.RelativeDate) {
                    const value = (filter as RelativeDateFilterData).value;
                    switch (value.rangeType) {
                        case RangeType.Current:
                            subtitle =
                                value.periodType === PeriodType.Day
                                    ? "Today"
                                    : `This ${value.periodType}`;
                            break;
                        case RangeType.Last:
                            subtitle =
                                value.periodType === PeriodType.Day
                                    ? "Yesterday"
                                    : `Last ${value.periodType}`;
                            break;
                        case RangeType.LastN:
                            subtitle = `Last ${value.rangeN} ${value.periodType}s`;
                            break;
                        case RangeType.Next:
                            subtitle =
                                value.periodType === PeriodType.Day
                                    ? "Tomorrow"
                                    : `Next ${value.periodType}`;
                            break;
                        case RangeType.NextN:
                            subtitle = `Next ${value.rangeN} ${value.periodType}s`;
                            break;
                        case RangeType.ToDate:
                            subtitle =
                                value.periodType === PeriodType.Day
                                    ? "Up to today"
                                    : `Up to this ${value.periodType}`;
                            break;
                        default:
                            break;
                    }
                }

                return (
                    <RowItem
                        key={filter.id}
                        title={filter.name}
                        subtitle={subtitle}
                        active={filter.active}
                        onAction={() => editExistingFilter(filter.id)}
                        onToggle={() => toggleFilter(filter.id)}
                    />
                );
            });
        }

        manager = (
            <Dialog title="Manage Filters" onDismiss={closeFilters}>
                <div className="body scroll">{filters}</div>
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

    return manager;
};

export default FilterManager;
