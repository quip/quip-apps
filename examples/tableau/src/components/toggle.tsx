import React from "react";

interface ToggleProps {
    on: boolean;
    onChange: (value: boolean) => void;
}

const Toggle = ({on, onChange}: ToggleProps) => (
    <div
        className={["toggle-box", on ? "toggle-on" : null].join(" ")}
        onClick={() => onChange(!on)}>
        <div
            className={["toggle-command", on ? "toggle-on" : null].join(
                " "
            )}></div>
    </div>
);

export default Toggle;
