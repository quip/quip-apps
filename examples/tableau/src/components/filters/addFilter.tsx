import quip from "quip-apps-api";
import React, {useState} from "react";
import {FilterType, PeriodType, RangeType, RootEntity} from "../../model/root";
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

    // relative date
    const [timePeriod, setTimePeriod] = useState(PeriodType.Month);
    const [rangeType, setRangeType] = useState(RangeType.Current);
    const [rangeTypeN, setRangeTypeN] = useState(3);
    const [anchorDate, setAnchorDate] = useState("");

    const isValid = () => {
        if (!filterName || filterName.trim().length === 0) return false;

        if (filterType === FilterType.Simple) {
            if (filterValue.trim().length === 0) return false;
        } else if (filterType === FilterType.Range) {
            if (rangeStart.trim().length === 0 && rangeEnd.trim().length === 0)
                return false;
        } else if (filterType === FilterType.RelativeDate) {
            if (timePeriod.trim().length === 0) return false;
            if (rangeType.trim().length === 0) return false;
            if (
                (rangeType === RangeType.LastN ||
                    rangeType === RangeType.NextN) &&
                rangeTypeN <= 1
            )
                return false;
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
        } else if (filterType === FilterType.Range) {
            payload = {
                min: rangeStart,
                max: rangeEnd,
                showNull,
            };
        } else if (filterType === FilterType.RelativeDate) {
            payload = {
                periodType: timePeriod,
                rangeType,
                rangeN:
                    rangeType === RangeType.LastN ||
                    rangeType === RangeType.NextN
                        ? rangeTypeN
                        : undefined,
                anchorDate,
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
                <div className="margin-s input-box horizontal">
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
    } else if (filterType === FilterType.RelativeDate) {
        const rangeTypes = [
            {
                value: RangeType.Current,
                label:
                    timePeriod === PeriodType.Day
                        ? "Today"
                        : `This ${timePeriod}`,
            },
            {
                value: RangeType.Last,
                label:
                    timePeriod === PeriodType.Day
                        ? "Yesterday"
                        : `Last ${timePeriod}`,
            },
            {
                value: RangeType.Next,
                label:
                    timePeriod === PeriodType.Day
                        ? "Tomorrow"
                        : `Next ${timePeriod}`,
            },
            {value: RangeType.LastN, label: `Last N ${timePeriod}s`},
            {value: RangeType.NextN, label: `Next N ${timePeriod}s`},
            {
                value: RangeType.ToDate,
                label:
                    timePeriod === PeriodType.Day
                        ? "Up to today"
                        : `Up to this ${timePeriod}`,
            },
        ];

        let durationField;
        if (rangeType === RangeType.LastN || rangeType === RangeType.NextN) {
            durationField = (
                <div className="margin-s input-box">
                    <label htmlFor="filter-field-range-n">
                        Number of {timePeriod}s
                    </label>
                    <input
                        id="filter-field-range-n"
                        type="number"
                        min={0}
                        step={1}
                        placeholder="N"
                        value={rangeTypeN}
                        onChange={(e) => setRangeTypeN(+e.currentTarget.value)}
                    />
                </div>
            );
        }

        filterTypeFields = (
            <>
                <div className="margin-s input-box">
                    <label htmlFor="filter-field-time-granularity">
                        Time Granularity
                    </label>
                    <select
                        id="filter-field-time-granularity"
                        value={timePeriod}
                        onChange={(e) =>
                            setTimePeriod(e.currentTarget.value as PeriodType)
                        }>
                        <option value={PeriodType.Year}>Years</option>
                        <option value={PeriodType.Quarter}>Quarters</option>
                        <option value={PeriodType.Month}>Months</option>
                        <option value={PeriodType.Week}>Weeks</option>
                        <option value={PeriodType.Day}>Days</option>
                        <option value={PeriodType.Hour}>Hours</option>
                        <option value={PeriodType.Minute}>Minutes</option>
                        <option value={PeriodType.Second}>Seconds</option>
                    </select>
                </div>
                <div className="margin-s input-box">
                    <label htmlFor="filter-field-range-type">Time Period</label>
                    <select
                        id="filter-field-range-type"
                        value={rangeType}
                        onChange={(e) =>
                            setRangeType(e.currentTarget.value as RangeType)
                        }>
                        {rangeTypes.map((r, idx) => (
                            <option value={r.value} key={idx}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>
                {durationField}
                <div className="margin-s input-box">
                    <label htmlFor="filter-field-anchor-date">
                        Anchor Date (optional)
                    </label>
                    <input
                        id="filter-field-anchor-date"
                        type="date"
                        placeholder="Set Date"
                        value={anchorDate}
                        onChange={(e) => setAnchorDate(e.currentTarget.value)}
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
