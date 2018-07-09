// Copyright 2017 Quip

import Styles from "./Dialog.less";

export default class Dialog extends React.Component {
    static propTypes = {
        children: React.PropTypes.element.isRequired,
        onDismiss: React.PropTypes.func,
        showBackdrop: React.PropTypes.bool,
        left: React.PropTypes.number,
        top: React.PropTypes.number,
    };

    static defaultProps = {
        showBackdrop: true,
    };

    componentDidMount() {
        if (this.props.showBackdrop) {
            quip.apps.showBackdrop(this.props.onDismiss);
        }
        quip.apps.addDetachedNode(ReactDOM.findDOMNode(this.dialogNode_));
    }

    componentWillUnmount() {
        if (this.props.showBackdrop) {
            quip.apps.dismissBackdrop();
        } else if (this.props.onDismiss) {
            this.props.onDismiss();
        }
        quip.apps.removeDetachedNode(ReactDOM.findDOMNode(this.dialogNode_));
    }

    render() {
        let {left, top} = this.props;
        if (!left && !top) {
            // If no position is provided, the dialog will be centered.
            const viewportDimensions = quip.apps.getViewportDimensions();
            const boundingRect = quip.apps.getBoundingClientRect();
            left = viewportDimensions.width / 2 - boundingRect.left;
            top = viewportDimensions.height / 2 - boundingRect.top;
        }
        return <div
            className={Styles.dialog}
            style={{left, top}}
            ref={node => (this.dialogNode_ = node)}>
            {this.props.children}
        </div>;
    }
}
