// Copyright 2017 Quip

import Dialog from "../../shared/dialog/dialog.jsx";
import Styles from "./instructions-dialog.less";

export default class Root extends React.Component {
    static propTypes = {
        onDismiss: React.PropTypes.func,
    };

    openLink_ = () => {
        quip.apps.openLink("https://quip.com/dev/liveapps/salesforce/config");
    };

    render() {
        return <Dialog onDismiss={this.props.onDismiss}>
            <div className={Styles.dialog}>
                <div className={Styles.header}>
                    {quiptext("Set Up Connected App")}
                </div>
                <div className={Styles.instructions}>
                    {quiptext(
                        "To use Salesforce Record, please ask an " +
                            "administrator to %(set_up_the_connected_app_link)s on " +
                            "your Salesforce instance.",
                        {
                            "set_up_the_connected_app_link": <span
                                className={Styles.link}
                                onClick={this.openLink_}>
                                {quiptext(
                                    "set up the connected app [in a link]")}
                            </span>,
                        })}
                </div>
                <div className={Styles.line}/>
                <div className={Styles.actions}>
                    <quip.apps.ui.Button
                        primary={true}
                        text={quiptext("Cancel")}
                        onClick={this.props.onDismiss}/>
                </div>
            </div>
        </Dialog>;
    }
}
