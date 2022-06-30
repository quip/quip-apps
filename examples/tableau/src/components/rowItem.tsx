import React from "react";
import Toggle from "./toggle";

interface RowItemProps {
    title: string;
    subtitle: string;
    active: boolean;
    onToggle: () => void;
    onAction: () => void;
}

const RowItem = ({
    title,
    subtitle,
    active,
    onToggle,
    onAction,
}: RowItemProps) => {
    return (
        <div className="filter-row-item">
            <div className="left">
                <h2 className="title">{title}</h2>
                <div className="subtitle">{subtitle}</div>
            </div>
            <div className="right">
                <Toggle on={active} onChange={onToggle} />
                <div onClick={onAction} className="action">
                    <img src="assets/dots.svg" alt="Action" />
                </div>
            </div>
        </div>
    );
};

export default RowItem;
