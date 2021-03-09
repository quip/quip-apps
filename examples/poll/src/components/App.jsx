// Copyright 2017 Quip

import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import quip from "quip";
import Option from "./Option.jsx";
import manifest from "../../app/manifest.json";

export default class App extends React.Component {
    static propTypes = {
        color: PropTypes.string.isRequired,
        options: PropTypes.any.isRequired,
        rootRecord: PropTypes.instanceOf(quip.apps.RootRecord).isRequired,
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
        quip.apps.recordQuipMetric("poll_error", params);
    }

    componentDidMount() {
        const itemId = this.props.rootRecord.get("allowMultiple")
            ? "allowMultiple"
            : "allowSingle";
        const color = this.props.rootRecord.get("color");
        quip.apps.updateToolbarCommandsState([], [color, itemId]);
    }

    deleteOption = ({option}) => {
        option.delete();
    };

    selectOption = ({option, selected}) => {
        option.vote(selected);
    };

    render() {
        const {options, color, rootRecord} = this.props;
        const totalVotes = rootRecord.getTotalVotes();
        const allowMultiple = rootRecord.get("allowMultiple");
        const optionEls = options
            .getRecords()
            .map((option, i, records) => <Option
                key={option.getId()}
                record={option}
                textRecord={option.getRichTextRecord()}
                color={color}
                totalVotes={totalVotes}
                votesCount={option.getVotesCount()}
                selected={option.isVoted()}
                onSelect={this.selectOption}
                onDelete={this.deleteOption}
                isLast={i === records.length - 1}
                multiple={allowMultiple}/>);

        return allowMultiple ? (
            <ul
                role="listbox"
                aria-multiselectable="true"
                aria-label={quiptext("multiple-vote poll")}
                style={{
                    paddingInlineStart: 0,
                    marginBottom: 20,
                }}>
                {optionEls}
            </ul>
        ) : (
            <div
                role="radiogroup"
                aria-label={quiptext("single-vote poll")}
                style={{
                    marginBottom: 20,
                }}>
                {optionEls}
            </div>
        );
    }
}
