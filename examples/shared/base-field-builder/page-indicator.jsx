// Copyright 2017 Quip

import React from "react";
import Chevron from "./icons/draft-chevron.jsx";
import Styles from "./page-indicator.less";

export default class PageIndicator extends React.Component {
    static propTypes = {
        onPage: React.PropTypes.func.isRequired,
        page: React.PropTypes.number.isRequired,
        size: React.PropTypes.number.isRequired,
        total: React.PropTypes.number.isRequired,
        style: React.PropTypes.object,
    };

    render() {
        const start = this.props.page * this.props.size + 1;
        const end = Math.min(
            (this.props.page + 1) * this.props.size,
            this.props.total);

        const leftClassNames = [Styles.pageIndicatorIconLeft];
        let leftClick;
        if (start <= this.props.size) {
            leftClassNames.push(Styles.pageIndicatorIconDisabled);
        } else {
            leftClick = () => this.props.onPage(false);
        }
        const rightClassNames = [Styles.pageIndicatorIconRight];
        let rightClick;
        if (end === this.props.total) {
            rightClassNames.push(Styles.pageIndicatorIconDisabled);
        } else {
            rightClick = () => this.props.onPage(true);
        }

        return <div className={Styles.pageIndicator} style={this.props.style}>
            <div className={leftClassNames.join(" ")} onClick={leftClick}>
                <Chevron/>
            </div>
            <div className={rightClassNames.join(" ")} onClick={rightClick}>
                <Chevron/>
            </div>
            {quiptext("%(start)s-%(end)s of %(count)s", {
                "start": start,
                "end": end,
                "count": this.props.total,
            })}
        </div>;
    }
}
