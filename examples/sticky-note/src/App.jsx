import quip from "quip";
import Styles from "./App.less";

export default class App extends React.Component {
    static propTypes = {
        richTextRecord: React.PropTypes.instanceOf(quip.apps.RichTextRecord)
            .isRequired,
    };

    render() {
        var style = {
            backgroundColor: `${quip.apps.ui.ColorMap.YELLOW.VALUE_LIGHT}`,
            border: `1px solid ${quip.apps.ui.ColorMap.YELLOW.VALUE}`,
            boxShadow: "0 2px 5px 5px rgba(0, 0, 0, 0.1)",
            padding: 10,
        };
        return <div className={Styles.hello} style={style}>
            <quip.apps.ui.RichTextBox
                record={this.props.richTextRecord}
                width={280}
                minHeight={280}
                maxHeight={280}/>
        </div>;
    }
}
