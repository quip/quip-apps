import React from "react";
import Styles from "./App.less";

export default class App extends React.Component {
    constructor(props) {
        super();
        this.rootRecord = quip.apps.getRootRecord();
        this.state = {
            height: window.parseInt(this.rootRecord.get("height"), 10) || 200,
            isFullScreen: quip.apps.isAppFocused(),
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
        this.setState({isFullScreen: false});
        quip.apps.enableResizing();
        quip.apps.dismissBackdrop();
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

    toggleFullScreen = e => {
        const isFullScreen = !this.state.isFullScreen;

        if (isFullScreen) {
            quip.apps.disableResizing();
            quip.apps.showBackdrop();
        } else {
            quip.apps.enableResizing();
            quip.apps.dismissBackdrop();
        }
        this.setState({isFullScreen});
    };

    render() {
        // You could of course store height in the rootRecord to persist it.
        let {height, isFullScreen, resizing} = this.state;
        let top, left, width, zIndex;
        let position = "static";
        if (isFullScreen) {
            position = "absolute";
            const dim = quip.apps.getViewportDimensions();
            const rect = quip.apps.getBoundingClientRect();
            top = -rect.top;
            left = -rect.left;
            width = dim.width;
            height = dim.height;
            zIndex = 302;
        }
        console.debug({top, left, width, height, position});
        return (
            <div
                className={Styles.App}
                style={{top, left, width, height, position, zIndex}}>
                <div>
                    {isFullScreen ? (
                        <quip.apps.ui.Button
                            onClick={() => console.log("CLICK")}
                            text="Test click me"
                        />
                    ) : (
                        "Resize Me!"
                    )}
                </div>
                <div className={Styles.goFullScreen}>
                    <quip.apps.ui.Button
                        onClick={this.toggleFullScreen}
                        text={isFullScreen ? "Minimize" : "Maximize"}
                    />
                </div>
                {!isFullScreen && (
                    <div
                        ref={el => (this.verticalHandle = el)}
                        className={Styles.verticalHandle}
                        onMouseDown={this.onMouseDown}
                    />
                )}
            </div>
        );
    }
}
