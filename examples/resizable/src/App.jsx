import React from "react";
import Styles from "./App.less";

export default class App extends React.Component {
    constructor(props) {
        super();
        this.rootRecord = quip.apps.getRootRecord();
        this.state = {
            height: window.parseInt(this.rootRecord.get("height"), 10) || 200,
            resizing: false,
        };
    }
    componentDidMount() {
        quip.apps.enableResizing();
        quip.apps.addEventListener(quip.apps.EventType.FOCUS, this.onFocus);
        quip.apps.addEventListener(quip.apps.EventType.BLUR, this.onBlur);
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(quip.apps.EventType.FOCUS, this.onFocus);
        quip.apps.removeEventListener(quip.apps.EventType.BLUR, this.onBlur);
    }

    onFocus = () => {
        console.debug("onFocus");
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);
    };

    onBlur = () => {
        console.debug("onBlur");
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);
    };

    onMouseDown = e => {
        console.debug("onMouseDown", e.pageY);
        this.setState({resizing: true, startDragY: e.pageY});
    };

    onMouseUp = e => {
        if (!this.state.resizing) {
            return;
        }
        console.debug("onMouseUp", e.pageY);
        this.setState({resizing: false});
    };

    onMouseMove = e => {
        if (!this.state.resizing) {
            return;
        }
        const diff = e.pageY - this.state.startDragY;
        console.debug("onMouseMove", e.pageY, diff);
        const height = this.state.height + diff;
        this.setState({height, startDragY: e.pageY});
        this.rootRecord.set("height", height);
    };

    render() {
        // You could of course store height in the rootRecord to persist it.
        const {height} = this.state;
        return (
            <div style={{height}}>
                Resize Me!
                <div
                    ref={el => (this.verticalHandle = el)}
                    className={Styles.verticalHandle}
                    onMouseDown={this.onMouseDown}
                />
            </div>
        );
    }
}
