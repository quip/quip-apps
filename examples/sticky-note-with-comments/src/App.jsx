import quip from "quip";
import Styles from "./App.less";

export default class App extends React.Component {
    static propTypes = {
        richTextRecord: React.PropTypes.instanceOf(quip.apps.RichTextRecord)
            .isRequired,
    };

    onClickClear = () => {
        this.props.richTextRecord.replaceContent("");
    };

    render() {
        const { richTextRecord } = this.props;
        const style = {
            backgroundColor: `${quip.apps.ui.ColorMap.YELLOW.VALUE_LIGHT}`,
            border: `1px solid ${quip.apps.ui.ColorMap.YELLOW.VALUE}`,
            boxShadow: "0 2px 5px 5px rgba(0, 0, 0, 0.1)",
            padding: 10,
        };
        return (
            <div className={Styles.App} style={style}>
                <quip.apps.ui.RichTextBox
                    record={richTextRecord}
                    width={280}
                    minHeight={280}
                    maxHeight={280}
                />
                <div style={{
                    bottom: 10,
                    color: "#aaa",
                    cursor: "pointer",
                    fontSize: 12,
                    position: "absolute",
                    right: 10,
                }} onClick={this.onClickClear}>clear</div>
                <div
                    ref={el => {
                        richTextRecord.getDom = () => el;
                    }}>
                    <quip.apps.ui.CommentsTrigger
                        record={richTextRecord}
                        showEmpty={true}
                    />
                </div>
            </div>
        );
    }
}
