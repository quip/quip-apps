// Copyright 2017 Quip

import React from "react";
import PageIndicator from "./page-indicator.jsx";

import {RecordEntity} from "./model/record.js";

const PAGE_SIZE = 15;

export function paginatedRecordList(WrappedComponent) {
    return class extends React.Component {
        static propTypes = {
            childRef: React.PropTypes.func.isRequired,
            entities: React.PropTypes.arrayOf(
                React.PropTypes.instanceOf(RecordEntity)).isRequired,
        };

        constructor(props) {
            super(props);
            this.state = {page: 0};
        }

        onPage_ = forward => {
            const newPage = forward ? this.state.page + 1 : this.state.page - 1;
            this.setState({page: newPage});
        };

        getStartingIndex_ = () => {
            return this.state.page * PAGE_SIZE;
        };

        getEndingIndex_ = () => {
            return Math.min(
                (this.state.page + 1) * PAGE_SIZE,
                this.props.entities.length);
        };

        getEntities_ = () => {
            return this.props.entities.slice(
                this.getStartingIndex_(),
                this.getEndingIndex_());
        };

        render() {
            const hasPages = this.props.entities.length > PAGE_SIZE;
            return <div>
                <WrappedComponent
                    {...this.props}
                    entities={this.getEntities_()}
                    ref={this.props.childRef}
                    bottomSpacing={hasPages ? 0 : undefined}
                    tableLoading={false}/>
                {hasPages && <PageIndicator
                    style={{marginTop: hasPages ? 10 : 0}}
                    onPage={this.onPage_}
                    page={this.state.page}
                    size={PAGE_SIZE}
                    total={this.props.entities.length}/>}
            </div>;
        }
    };
}
