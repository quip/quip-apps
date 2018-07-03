// Copyright 2017 Quip

import React, {Component} from "react";
import move from "lodash-move";

export default class VirtualMove extends Component {
    static propTypes = {
        items: React.PropTypes.array.isRequired,
        children: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            items: props.items,
            isActiveDrag: false,
        };
    }

    toggleActiveDrag = isDrag => {
        this.setState({isActiveDrag: isDrag});
    };

    componentWillReceiveProps(nextProps) {
        if (this.state.isActiveDrag) {
            // If we are currently dragging a row or column, we want to wait
            // until the dragging operation is finished before updating the
            // state since the state update may conflict with the drag in
            // progress.
            return;
        }
        this.setState({items: nextProps.items});
    }

    moveItem = (id, index) => {
        this.setState(({items}) => {
            const currentIndex = items.findIndex(item => item.id === id);
            return {items: move(items, currentIndex, index)};
        });
    };

    render() {
        return <div>
            {this.props.children({
                items: this.state.items,
                moveItem: this.moveItem,
                toggleActiveDrag: this.toggleActiveDrag,
            })}
        </div>;
    }
}
