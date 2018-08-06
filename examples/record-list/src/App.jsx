import react from "react";
import quip from "quip";
import Styles from "./App.less";

export default class App extends React.Component {
    constructor(props) {
        super();
        const rootRecord = quip.apps.getRootRecord();
        this.state = {
            sections: rootRecord.get("sections").getRecords(),
        };
    }

    componentDidMount() {
        const rootRecord = quip.apps.getRootRecord();
        /*this._rootListener = rootRecord.listen(() => {
            this.setState({
                sections: rootRecord.get("sections").getRecords(),
            });
        });*/
        this._recordListener = rootRecord.get("sections").listen(sections => {
            this.setState({
                sections: sections.getRecords(),
            });
        });
    }

    componentWillUnmount() {
        const rootRecord = quip.apps.getRootRecord();
        if (this._recordListener) {
            rootRecord.get("sections").unlisten(this._recordListener);
        }
        if (this._rootListener) {
            rootRecord.unlisten(this._rootListener);
        }
    }

    onClickAdd = e => {
        const rootRecord = quip.apps.getRootRecord();
        rootRecord.add();
    };

    render() {
        const {sections} = this.state;
        console.debug("render", {sections});
        return (
            <div className={Styles.App}>
                <div>
                    <button onClick={this.onClickAdd}>Add</button>
                </div>
                <div>
                    {sections.map((record, i) => (
                        <Section key={i} record={record} />
                    ))}
                </div>
            </div>
        );
    }
}

class Section extends React.Component {
    render() {
        const {record} = this.props;
        return (
            <div className={Styles.Section}>
                <div className={Styles.SectionCreatedAt}>
                    {record.get("createdAt")}
                </div>
                <div
                    className={Styles.SectionDelete}
                    onClick={() => {
                        record.delete();
                    }}>
                    x
                </div>
            </div>
        );
    }
}
