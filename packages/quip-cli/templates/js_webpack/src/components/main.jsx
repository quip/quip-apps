import React, {Component} from "react";
import {menuActions} from "../menus";
export default class Main extends Component {
    constructor(props) {
        super(props);
        /**
         * Update the app state using the RootEntity's AppData.
         * This component will render based on the values of `this.state.data`.
         * This function will set `this.state.data` using the RootEntity's AppData.
         */
        this.refreshData_ = () => {
            const {rootRecord, menu} = this.props;
            const data = rootRecord.getData();
            // Update the app menu to reflect most recent app data
            menu.updateToolbar(data);
            this.setState({data: rootRecord.getData()});
        };
        const {rootRecord} = props;
        this.setupMenuActions_(rootRecord);
        const data = rootRecord.getData();
        this.state = {data};
    }
    setupMenuActions_(rootRecord) {
        menuActions.toggleHighlight = () =>
            rootRecord.getActions().onToggleHighlight();
    }
    componentDidMount() {
        // Set up the listener on the rootRecord (RootEntity). The listener
        // will propogate changes to the render() method in this component
        // using setState
        const {rootRecord} = this.props;
        rootRecord.listen(this.refreshData_);
        this.refreshData_();
    }
    componentWillUnmount() {
        const {rootRecord} = this.props;
        rootRecord.unlisten(this.refreshData_);
    }
    render() {
        const {data} = this.state;
        const {isHighlighted} = data;
        return (
            <div className={"root"}>
                <div className={isHighlighted ? "highlight" : undefined}>
                    <h1>Hello, World!</h1>
                    <p>App Data:</p>
                    <pre>{JSON.stringify(data)}</pre>
                </div>
            </div>
        );
    }
}
