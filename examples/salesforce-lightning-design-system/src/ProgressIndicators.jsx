import React from "react";

const steps = [
    {
        id: 0,
        label: <i>tooltip label #1</i>,
        assistiveText: "This is custom text in the assistive text key",
    },
    {id: 1, label: "tooltip label #2"},
    {id: 2, label: <strong>tooltip label #3</strong>},
    {id: 3, label: "tooltip label #4"},
    {id: 4, label: "tooltip label #5"},
];

import {ProgressIndicator} from "@salesforce/design-system-react";

export default class ProgressIndicators extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            steps,
            completedSteps: [],
            disabledSteps: steps.slice(2, steps.length),
            selectedStep: steps[0],
        };
    }

    handleStepEvent = (event, data) => {
        this.setState({
            completedSteps: steps.slice(0, data.step.id),
            disabledSteps:
                data.step.id < steps.length
                    ? steps.slice(data.step.id + 2, steps.length)
                    : [],
            selectedStep: data.step,
        });
    };
    render() {
        return (
            <ProgressIndicator
                id="example-progress-indicator"
                completedSteps={this.state.completedSteps}
                disabledSteps={this.state.disabledSteps}
                onStepClick={this.handleStepEvent}
                steps={this.state.steps}
                selectedStep={this.state.selectedStep}
                // tooltipIsOpenSteps={stepsBasic.slice(0, 2)}
            />
        );
    }
}
