import React, {Component, useEffect, useState} from "react";
import {menuActions, Menu} from "../menus";
import {AppData, RootEntity} from "../model/root";
import Dashboard from "./dashboard";
import Login from "./login";

interface MainProps {
    rootRecord: RootEntity;
    menu: Menu;
    isCreation: boolean;
    creationUrl?: string;
}

const main = ({rootRecord, menu, isCreation, creationUrl}: MainProps) => {
    const [data, setData] = useState<AppData>(rootRecord.getData());

    const setupMenuActions_ = () => {
        menuActions.setViewSize = rootRecord.getActions().onSetViewSize;
    };

    const refreshData_ = () => {
        const data = rootRecord.getData();
        menu.updateToolbar(data);
        setData(data);
    };

    useEffect(() => {
        // on mount

        setupMenuActions_();
        rootRecord.listen(refreshData_);
        refreshData_();

        return () => {
            // on unmount
            rootRecord.unlisten(refreshData_);
        };
    }, []);

    let view = <Login />;
    if (data.loggedIn) {
        view = <Dashboard />;
    }

    return <div>{view}</div>;
};

export default main;

// export default class Main extends Component<MainProps, MainState> {
//     setupMenuActions_(rootRecord: RootEntity) {
//         menuActions.toggleHighlight = () =>
//             rootRecord.getActions().onToggleHighlight();
//     }

//     constructor(props: MainProps) {
//         super(props);
//         const {rootRecord} = props;
//         this.setupMenuActions_(rootRecord);
//         const data = rootRecord.getData();
//         this.state = {data};
//     }

//     componentDidMount() {
//         // Set up the listener on the rootRecord (RootEntity). The listener
//         // will propogate changes to the render() method in this component
//         // using setState
//         const {rootRecord} = this.props;
//         rootRecord.listen(this.refreshData_);
//         this.refreshData_();
//     }

//     componentWillUnmount() {
//         const {rootRecord} = this.props;
//         rootRecord.unlisten(this.refreshData_);
//     }

//     /**
//      * Update the app state using the RootEntity's AppData.
//      * This component will render based on the values of `this.state.data`.
//      * This function will set `this.state.data` using the RootEntity's AppData.
//      */
//     private refreshData_ = () => {
//         const {rootRecord, menu} = this.props;
//         const data = rootRecord.getData();
//         // Update the app menu to reflect most recent app data
//         menu.updateToolbar(data);
//         this.setState({data: rootRecord.getData()});
//     };

//     render() {
//         const {data} = this.state;
//         const {isHighlighted} = data;
//         return (
//             <div className={"root"}>
//                 <div className={isHighlighted ? "highlight" : undefined}>
//                     <h1>Hello, World!</h1>
//                     <p>App Data:</p>
//                     <pre>{JSON.stringify(data)}</pre>
//                 </div>
//             </div>
//         );
//     }
// }
