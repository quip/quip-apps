// Copyright 2018 Quip

import EquationDisplay from "./EquationDisplay.jsx";
import EquationInput from "./EquationInput.jsx";
import RootRecord from "./RootRecord.js";
import Styles from "./App.less";
import menu from "./menu.js";

export default class App extends React.PureComponent {
    static propTypes = {
        rootRecord: React.PropTypes.instanceOf(RootRecord).isRequired,
        equationRecord: React.PropTypes.instanceOf(
            quip.apps.RichTextRecord).isRequired,
    }

    render() {
        const {rootRecord, equationRecord} = this.props;
        const appFocused = quip.apps.isAppFocused();
        const classNames = [Styles.app];
        if (appFocused) {
            classNames.push(Styles.appFocused);
        }

        return <div className={classNames.join(" ")}>
            <EquationDisplay
                equation={equationRecord.getTextContent()}
                appFocused={appFocused}
                size={rootRecord.get("size")}
                align={rootRecord.get("align")}
                onEdit={() => this.input_.focus()}/>
            <EquationInput
                ref={input => this.input_ = input}
                equationRecord={equationRecord}
                appFocused={appFocused}/>
        </div>;
    }

    componentDidMount() {
        this.updateToolbar_();
        this.props.rootRecord.listen(this.handleRootRecordChange_);
        this.props.equationRecord.listenToContent(this.updateDisplay_);
        quip.apps.addEventListener(
            quip.apps.EventType.BLUR, this.handleAppFocusChange_);
        quip.apps.addEventListener(
            quip.apps.EventType.FOCUS, this.handleAppFocusChange_);
        this.inputNode_ = ReactDOM.findDOMNode(this.input_);
        quip.apps.addDetachedNode(this.inputNode_);
    }

    componentWillUnmount() {
        this.props.rootRecord.unlisten(this.handleRootRecordChange_);
        this.props.equationRecord.unlistenToContent(this.updateDisplay_);
        quip.apps.removeEventListener(
            quip.apps.EventType.BLUR, this.handleAppFocusChange_);
        quip.apps.removeEventListener(
            quip.apps.EventType.FOCUS, this.handleAppFocusChange_);
        quip.apps.removeDetachedNode(this.inputNode_);
    }

    updateToolbar_ = () => {
        const {rootRecord} = this.props;
        const highlightedCommandIds = menu.getHighlightedCommandIds(rootRecord);
        quip.apps.updateToolbarCommandsState([], highlightedCommandIds);
    }

    handleRootRecordChange_ = () => {
        this.updateToolbar_();
        this.forceUpdate();
    }

    updateDisplay_ = () => {
        this.forceUpdate();
    }

    handleAppFocusChange_ = () => {
        this.forceUpdate(quip.apps.forceUpdateDimensions);
    }
}
