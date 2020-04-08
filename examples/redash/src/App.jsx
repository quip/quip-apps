import PropTypes from "prop-types";
import React from "react";
import Dialog from "../../shared/dialog/dialog.jsx";
import {setAppContext, updateToolbar} from "./menus";

const defaultHeight = 550;
const defaultIframeUrl = "";

export const getIframeUrl = () => {
    const recordIframeUrl = quip.apps.getRootRecord().get("iframeUrl");
    const siteIframeUrl = quip.apps.getSitePreferences().getForKey("iframeUrl");
    return recordIframeUrl || siteIframeUrl || defaultIframeUrl;
};

const getHeight = () => {
    const height = quip.apps.getRootRecord().get("height");
    return height || defaultHeight;
};

export default class App extends React.Component {
    static propTypes = {
        iframeUrl: PropTypes.string,
    };

    constructor(props) {
        super();
        setAppContext(this);
        this.state = {isUrlDialogOpen: false};
    }

    componentWillUnmount() {
        quip.apps.clearEmbeddedIframe();
    }

    openUrlDialog = () => {
        this.setState({
            isUrlDialogOpen: true,
        });
    };

    closeUrlDialog = () => {
        this.setState({
            isUrlDialogOpen: false,
        });
    };

    render() {
        const iframeUrl = getIframeUrl();
        const height = getHeight();
        const {isUrlDialogOpen} = this.state;
        return (
            <div style={{minHeight: height, width: "100%"}}>
                {iframeUrl && (
                    <iframe
                        ref={el => {
                            quip.apps.clearEmbeddedIframe();
                            quip.apps.registerEmbeddedIframe(el);
                        }}
                        height={height}
                        width={800}
                        src={iframeUrl}
                        frameborder="0"
                        style={{border: 0}}
                    />
                )}
                {isUrlDialogOpen && <UrlDialog close={this.closeUrlDialog} />}
            </div>
        );
    }
}

class UrlDialog extends React.Component {
    static propTypes = {
        close: PropTypes.func,
    };

    constructor(props) {
        super();
        const url = getIframeUrl();
        const height = getHeight();
        this.state = {
            url,
            height,
            isDefaultChecked: false,
        };
    }

    onChange = e => {
        this.setState({url: e.currentTarget.value});
    };

    onChangeHeight = e => {
        this.setState({height: e.currentTarget.value});
    };

    onChangeChecked = e => {
        this.setState({isDefaultChecked: !!e.currentTarget.checked});
    };

    onSubmit = e => {
        const {isDefaultChecked, height, url} = this.state;
        if (isDefaultChecked) {
            quip.apps.getSitePreferences().save({iframeUrl: url});
        }
        quip.apps.getRootRecord().set("iframeUrl", url);
        quip.apps.getRootRecord().set("height", height);

        this.props.close();
    };

    render() {
        const {close} = this.props;
        const {isDefaultChecked, height, url} = this.state;
        return (
            <div>
                <Dialog onDismiss={close} ref={el => (this.dialog = el)}>
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 7,
                            boxShadow: "0 3px 7px rgba(0, 0, 0, 0.3)",
                            minWidth: 350,
                            minHeight: 350,
                            padding: 20,
                            textAlign: "center",
                        }}>
                        <h3 style={{marginBottom: 30}}>Change URL</h3>
                        <div style={{marginBottom: 10}}>
                            <label
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    textAlign: "left",
                                }}>
                                <span style={{fontWeight: "bold"}}>URL</span>
                                <textarea
                                    value={url}
                                    onChange={this.onChange}
                                    style={{width: "100%", minHeight: 130}}
                                />
                            </label>
                        </div>
                        <div style={{marginBottom: 20}}>
                            <label
                                style={{display: "flex", alignItems: "center"}}>
                                <span
                                    style={{
                                        fontWeight: "bold",
                                        marginRight: 5,
                                    }}>
                                    Use as default
                                </span>
                                <input
                                    type="checkbox"
                                    checked={isDefaultChecked}
                                    onChange={this.onChangeChecked}
                                />
                            </label>
                        </div>
                        <div style={{marginBottom: 20}}>
                            <label
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    textAlign: "left",
                                }}>
                                <span style={{fontWeight: "bold"}}>Height</span>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={this.onChangeHeight}
                                    style={{width: 100}}
                                />
                            </label>
                        </div>
                        <div style={{textAlign: "left"}}>
                            <button
                                className="quip-button-primary"
                                onClick={this.onSubmit}>
                                Submit
                            </button>
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}
