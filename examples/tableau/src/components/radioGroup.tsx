import React from "react";

interface RadioOption {
    label: string;
    value: string | number;
}

interface RadioGroupProps {
    options: RadioOption[];
    value: string | number;
    onChange: (value: string | number) => void;
}

const RadioGroup = ({options, value, onChange}: RadioGroupProps) => {
    const opts = options.map((option, idx) => (
        <div
            key={idx}
            onClick={() => onChange(option.value)}
            className={value === option.value ? "radio-selected" : undefined}>
            {option.label}
        </div>
    ));

    return <div className="radio-group">{opts}</div>;
};

export default RadioGroup;
