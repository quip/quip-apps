// Copyright 2017 Quip
/* @flow */

import quip from "quip";
import React from "react";

export default (
    rootRecord: quip.apps.RootRecord,
    WrappedComponent: React.Component,
) => {
    class RecordComponent extends React.Component {
        constructor(props) {
            super();
            this.state = {
                ...rootRecord.getData(),
            };
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
            return <WrappedComponent {...this.state} {...{ rootRecord }} />;
        }
    }

    return RecordComponent;
};
