import quip from "quip";
import Styles from "./App.less";

import Giphys from "./Giphys.jsx";

export default class App extends React.Component {
    static propTypes = {
        richTextRecord: React.PropTypes.instanceOf(quip.apps.RichTextRecord)
            .isRequired,
    };

    onClickClear = () => {
        this.props.richTextRecord.replaceContent("");
    };

    render() {
        const {richTextRecord} = this.props;
        const style = {
            backgroundColor: `${quip.apps.ui.ColorMap.YELLOW.VALUE_LIGHT}`,
            border: `1px solid ${quip.apps.ui.ColorMap.YELLOW.VALUE}`,
            boxShadow: "0 2px 5px 5px rgba(0, 0, 0, 0.1)",
            padding: 10,
        };
        return <div>
            <div className={Styles.App} style={style}>
                <div
                    style={{
                        bottom: 10,
                        color: "#aaa",
                        cursor: "pointer",
                        fontSize: 12,
                        position: "absolute",
                        right: 10,
                        zIndex: 1,
                    }}
                    onClick={this.onClickClear}>
                    clear
                </div>

                <quip.apps.ui.RichTextBox
                    record={richTextRecord}
                    width={280}
                    minHeight={280}
                    maxHeight={280}/>
                <div
                    ref={el => {
                        richTextRecord.getDom = () => el;
                    }}
                    style={{
                        position: "absolute",
                        //top: 10,
                        //right: 5,
                        width: 20,
                        height: 20,
                        zIndex: 1,
                        left: 10,
                        bottom: 5,
                    }}>
                    <quip.apps.ui.CommentsTrigger
                        record={richTextRecord}
                        showEmpty={true}/>
                </div>
            </div>
            <div style={{marginTop: 15}}>
                <Giphys record={richTextRecord}/>
            </div>
        </div>;
    }
}
