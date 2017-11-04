// Copyright 2017 Quip

import Styles from "./dialog.less";

export default class Dialog extends React.Component {
    static propTypes = {
        children: React.PropTypes.element.isRequired,
        onDismiss: React.PropTypes.func,
    };

    componentDidMount() {
        window.setTimeout(
            () => quip.apps.showBackdrop(this.props.onDismiss),
            10);
        quip.apps.addDetachedNode(ReactDOM.findDOMNode(this.dialogNode_));
    }

    componentWillUnmount() {
        quip.apps.dismissBackdrop();
        quip.apps.removeDetachedNode(ReactDOM.findDOMNode(this.dialogNode_));
    }

    render() {
        const viewportDimensions = quip.apps.getViewportDimensions();
        const boundingRect = quip.apps.getBoundingClientRect();
        const style = {
            left: viewportDimensions.width / 2 - boundingRect.left,
            top: viewportDimensions.height / 2 - boundingRect.top,
        };

        return <div
            className={Styles.dialog}
            style={style}
            ref={node => (this.dialogNode_ = node)}>
            {this.props.children}
        </div>;
    }
}
