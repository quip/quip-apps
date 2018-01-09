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
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.items.length !== nextProps.items.length) {
            return this.setState({items: nextProps.items});
        }
        const stateOrder = this.state.items.map(obj => obj.id);
        const propsOrder = nextProps.items.map(obj => obj.id);
        for (var i = 0; i < stateOrder.length; i++) {
            if (propsOrder.indexOf(stateOrder[i]) === -1) {
                return this.setState({items: nextProps.items});
            }
        }
        for (var i = 0; i < stateOrder.length; i++) {
            if (stateOrder[i] !== propsOrder[i]) {
                return;
            }
        }
        return this.setState({items: nextProps.items});
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
            })}
        </div>;
    }
}
