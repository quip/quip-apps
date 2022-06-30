// Copyright 2017 Quip
/* @flow */

import PropTypes from "prop-types";
import quip from "quip";
import React from "react";
import cx from "classnames";
import Styles from "./App.less";
import Step from "./Step.jsx";
import manifest from "../../app/manifest.json";

export default class App extends React.Component {
    static propTypes = {
        rootRecord: PropTypes.instanceOf(quip.apps.RootRecord).isRequired,
        steps: PropTypes.instanceOf(quip.apps.RecordList).isRequired,
        color: PropTypes.string.isRequired,
        selected: PropTypes.string,
    };

    setSelected = record => {
        this.props.rootRecord.set("selected", record.getId());
    };

    deleteStep = record => {
        const {steps, selected} = this.props;
        const next = record.getPreviousSibling() || record.getNextSibling();
        const isSelected = record.getId() === selected;

        steps.remove(record);

        if (isSelected && next) {
            this.setSelected(next);
        }

        quip.apps.recordQuipMetric("delete_step");
    };

    componentDidCatch(error, info) {
        const params = {
            "message": error.message,
            "version_number": manifest.version_number + "",
            "version_name": manifest.version_name + "",
        };
        if (error.stack) {
            params["stack"] = error.stack;
        }
        if (info && info.componentStack) {
            params["component_stack"] = info.componentStack;
        }
        quip.apps.recordQuipMetric("process_bar_error", params);
    }

    componentDidMount() {
        quip.apps.addEventListener(
            quip.apps.EventType.CONTAINER_SIZE_UPDATE,
            this.onContainerResize_);
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(
            quip.apps.EventType.CONTAINER_SIZE_UPDATE,
            this.onContainerResize_);
    }

    getSelectedStepIndex() {
        const {steps, selected} = this.props;

        const stepRecords = steps.getRecords();
        for (let i = 0; i < stepRecords.length; i++) {
            const step = stepRecords[i];
            if (selected === step.getId()) {
                return i;
            }
        }
        return 0;
    }

    render() {
        const {steps, selected, color} = this.props;
        const inGridLayout = quip.apps.inGridLayout && quip.apps.inGridLayout();
        let stepWidth;
        if (inGridLayout) {
            stepWidth = quip.apps.getContainerWidth() / steps.count();
        }
        const completedIndex = this.getSelectedStepIndex();
        const stepRecords = steps.getRecords();

        return <ul
            className={cx(Styles.container, {
                [Styles.fixedWidth]: !inGridLayout,
            })}
            onKeyDown={e => {
                if (e.key === "Escape") {
                    if (quip.apps.isApiVersionAtLeast("0.1.052")) {
                        quip.apps.exitApp();
                    }
                }
            }}>
            {stepRecords.map((step, i) => <Step
                color={color}
                selected={selected === step.getId()}
                completed={i < completedIndex}
                key={step.getId()}
                record={step}
                width={stepWidth}
                onSelected={this.setSelected}
                onDelete={this.deleteStep}/>)}
        </ul>;
    }

    onContainerResize_ = () => {
        this.forceUpdate();
    };
}
