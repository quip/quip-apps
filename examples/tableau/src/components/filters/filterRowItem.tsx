import React from "react";
import Toggle from "../toggle";

interface FilterRowItemProps {
    title: string;
    subtitle: string;
    active: boolean;
    onToggle: () => void;
    onAction: () => void;
}

const FilterRowItem = ({
    title,
    subtitle,
    active,
    onToggle,
    onAction,
}: FilterRowItemProps) => {
    return (
        <div className="filter-row-item">
            <div className="left">
                <h2 className="title">{title}</h2>
                <div className="subtitle">{subtitle}</div>
            </div>
            <div className="right">
                <Toggle on={active} onChange={onToggle} />
                <div onClick={onAction}>Action</div>
            </div>
        </div>
    );
};

export default FilterRowItem;
