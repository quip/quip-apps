// Copyright 2017 Quip

import React from "react";

export default (rootRecord, WrappedComponent) => {
    class RecordComponent extends React.Component {
        constructor(props) {
            super();
            this.state = Object.assign({}, rootRecord.getData());
        }

        componentDidMount() {
            this._recordListener = rootRecord.listen(() => {
                this.setState(rootRecord.getData());
            });
        }

        componentWillUnmount() {
            if (this._recordListener) {
                rootRecord.unlisten(this._recordListener);
            }
        }

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    {...this.state}
                    {...{ rootRecord }}
                />
            );
        }
    }

    return RecordComponent;
};
