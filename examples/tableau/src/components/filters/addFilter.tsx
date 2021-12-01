import quip from "quip-apps-api";
import React, {useState} from "react";
import {FilterType, RootEntity} from "../../model/root";
import Dialog from "../dialog";
import RadioGroup from "../radioGroup";
import {v4 as uuid} from "uuid";
import Toggle from "../toggle";

interface AddFilterProps {
    rootRecord: RootEntity;
    onClose: () => void;
}

const AddFilter = ({rootRecord, onClose}: AddFilterProps) => {
    const filterTypes = [
        {label: "Simple", value: FilterType.Simple},
        {label: "Range", value: FilterType.Range},
        {label: "Relative Date", value: FilterType.RelativeDate},
    ];

    const [filterName, setFilterName] = useState("");
    const [filterType, setFilterType] = useState(FilterType.Simple);

    // simple
    const [filterValue, setFilterValue] = useState("");

    // range
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");
    const [showNull, setShowNull] = useState(false);

    const isValid = () => {
        if (!filterName || filterName.trim().length === 0) return false;

        if (filterType === FilterType.Simple) {
            if (!filterValue || filterValue.trim().length === 0) return false;
        }

        return true;
    };

    const addFilter = () => {
        const newId = uuid();
        let payload: {[key: string]: any} = {};
        if (filterType === FilterType.Simple) {
            payload = {
                value: filterValue,
            };
        }
        rootRecord.setFilter(newId, filterType, filterName, payload);
        onClose();
    };

    let filterTypeFields;
    if (filterType === FilterType.Simple) {
        filterTypeFields = (
            <>
                <div className="margin-s input-box">
                    <label htmlFor="filter-field-value">Value</label>
                    <input
                        id="filter-field-value"
                        type="text"
                        placeholder="Enter Value"
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.currentTarget.value)}
                    />
                </div>
            </>
        );
    } else if (filterType === FilterType.Range) {
        filterTypeFields = (
            <>
                <div className="margin-s input-box">
                    <label htmlFor="filter-field-start">Start / Minimum</label>
                    <input
                        id="filter-field-start"
                        type="text"
                        placeholder="Enter Value"
                        value={rangeStart}
                        onChange={(e) => setRangeStart(e.currentTarget.value)}
                    />
                </div>
                <div className="margin-s input-box">
                    <label htmlFor="filter-field-end">End / Maximum</label>
                    <input
                        id="filter-field-end"
                        type="text"
                        placeholder="Enter Value"
                        value={rangeEnd}
                        onChange={(e) => setRangeEnd(e.currentTarget.value)}
                    />
                </div>
                <div className="margin-s input-box">
                    <label htmlFor="filter-field-range-show-null">
                        Show null values
                    </label>
                    <Toggle
                        on={showNull}
                        onChange={(val) => setShowNull(val)}
                    />
                </div>
            </>
        );
    }

    return (
        <Dialog title="Add Filter" onDismiss={onClose} noBackdrop>
            <div className="body">
                <div className="margin-s input-box">
                    <label htmlFor="filter-field-name">Filter Field Name</label>
                    <input
                        id="filter-field-name"
                        type="text"
                        placeholder="Filter Field Name"
                        value={filterName}
                        onChange={(e) => setFilterName(e.currentTarget.value)}
                    />
                </div>
                <div className="margin-s input-box">
                    <label htmlFor="filter-type">Filter Type</label>
                    <RadioGroup
                        options={filterTypes}
                        value={filterType}
                        onChange={(newValue) =>
                            setFilterType(newValue as FilterType)
                        }
                    />
                </div>
                {filterTypeFields}
            </div>
            <div className="footer">
                <quip.apps.ui.Button text="Cancel" onClick={onClose} />
                <quip.apps.ui.Button
                    text="Done"
                    primary
                    onClick={addFilter}
                    disabled={!isValid()}
                />
            </div>
        </Dialog>
    );
};

export default AddFilter;
