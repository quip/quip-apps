import ReactModal from "react-modal";
import React, {Component} from "react";
import relativePositioning from "../positioningRelativeToRoot";

class Modal extends Component {
    static propTypes = {
        topOffset: React.PropTypes.number,
        style: React.PropTypes.object,
        children: React.PropTypes.node,
        onRequestClose: React.PropTypes.func.isRequired,
        onBlur: React.PropTypes.func,
        wrapperRef: React.PropTypes.object.isRequired,
        shouldFocusAfterRender: React.PropTypes.bool,
    };

    static defaultProps = {
        topOffset: 0,
        style: {},
        shouldFocusAfterRender: true,
    };

    constructor(props) {
        super(props);

        this._contentInterval = null;
        this._content = null;

        this.state = {
            location: {
                top: 0,
                left: 0,
            },
        };
    }

    componentDidMount() {
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_FOCUS,
            this.setElementFocus);
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.setElementFocus);
        this.setLocation(this.props);
        window.requestAnimationFrame(() => this.createContentInterval());
    }

    componentWillReceiveProps(nextProps) {
        this.setLocation(nextProps);
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(
            quip.apps.EventType.ELEMENT_FOCUS,
            this.setElementFocus);
        quip.apps.removeEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.setElementFocus);
        this.removeContentNode();
    }

    setLocation = props => {
        const {wrapperRef} = this.props;
        const root = quip.apps.getRootRecord();
        const rootDom = root.getDom && root.getDom();
        if (rootDom && wrapperRef) {
            this.setState({
                location: relativePositioning(rootDom, wrapperRef),
            });
        }
    };

    setElementFocus = () => {
        const {onBlur} = this.props;
        if (!quip.apps.isElementFocused() && onBlur) onBlur();
    };

    createContentInterval() {
        if (!this._content) {
            this._contentInterval = setInterval(() => {
                this._content = document.querySelector(".ReactModal__Content");
                if (this._content) {
                    quip.apps.addDetachedNode(this._content);
                    this.clearContentInterval();
                }
            }, 1);
        }
    }

    clearContentInterval() {
        if (this._contentInterval) {
            clearInterval(this._contentInterval);
            this._contentInterval = null;
        }
    }

    removeContentNode() {
        if (this._content) {
            quip.apps.removeDetachedNode(this._content);
            this._content = null;
        }
    }

    render() {
        const body = document.getElementById("quip-element-root");
        const {top, left, width, height} = body.style;
        const BorderImage =
            "url('data:image/png;base64,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')";

        const {location} = this.state;

        const {style, topOffset, children, onRequestClose} = this.props;

        const overlayStyle = Object.assign(
            {
                top,
                left,
                width,
                height,
                zIndex: 100,
                backgroundColor: "transparent",
            },
            style.overlay);

        const contentStyle = Object.assign(
            {
                top: location.top + topOffset,
                left: location.left,
                right: "",
                bottom: "",
                padding: "0 0 5px 0",
                borderColor: "transparent",
                borderWidth: "22px 22px 22px 22px",
                borderImageSlice: "38 38 fill",
                borderImageSource: BorderImage,
                borderStyle: "solid",
                borderImageRepeat: "repeat",
                overflow: "visible",
                backgroundColor: "transparent",
            },
            style.content);

        const wrapperStyle = Object.assign(
            {
                margin: "-18px -13px -13px -13px",
                backgroundColor: "#fff",
                overflow: "auto",
                borderRadius: "6px",
            },
            style.wrapper);

        return <ReactModal
            style={{overlay: overlayStyle, content: contentStyle}}
            parentSelector={() => document.getElementById("quip-element-root")}
            isOpen={quip.apps.isElementFocused()}
            shouldCloseOnOverlayClick={true}
            onRequestClose={onRequestClose}
            shouldFocusAfterRender={this.props.shouldFocusAfterRender}>
            <div style={wrapperStyle}>{children}</div>
        </ReactModal>;
        return null;
    }
}

export default Modal;
