// Copyright 2017 Quip

import React from "react";
import ReactDOM from "react-dom";
import quip from "quip";

import Option from "./Option.jsx";

export default class App extends React.Component {
    static propTypes = {
        color: React.PropTypes.string.isRequired,
        // TODO(elsigh): type for RecordList?
        options: React.PropTypes.any.isRequired,
        rootRecord: React.PropTypes.instanceOf(quip.apps.RootRecord)
            .isRequired,
    };

    componentDidMount() {
        const itemId = this.props.rootRecord.get("allowMultiple")
            ? "allowMultiple"
            : "allowSingle";
        const color = this.props.rootRecord.get("color");
        quip.apps.updateToolbarCommandsState([], [color, itemId]);
    }

    deleteOption = ({ option }) => {
        option.delete();
    };

    selectOption = ({ option, selected }) => {
        option.vote(selected);
    };

    render() {
        const { options, color, rootRecord } = this.props;
        const totalVotes = rootRecord.getTotalVotes();

        return (
            <div
                style={{
                    // TODO(elsigh): fixes being above custom scroller
                    marginBottom: 20,
                }}
            >
                {options
                    .getRecords()
                    .map((option, i, records) => (
                        <Option
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
                            multiple={rootRecord.get("allowMultiple")}
                        />
                    ))}
            </div>
        );
    }
}
