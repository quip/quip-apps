import quip from "quip";
import React from "react";
import { connect } from "react-redux";
import classNames from "classnames";

import Styles from "./App.less";

import { setFocused } from "./redux/actions";

import Term from "./components/Term.jsx";

class App extends React.Component {
    static propTypes = {
        loggedIn: React.PropTypes.bool.isRequired,
        setFocused: React.PropTypes.func.isRequired,
    };

    componentDidMount() {
        quip.apps.addEventListener(quip.apps.EventType.FOCUS, this.onFocus);
        quip.apps.addEventListener(quip.apps.EventType.BLUR, this.onBlur);
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(quip.apps.EventType.FOCUS, this.onFocus);
        quip.apps.removeEventListener(quip.apps.EventType.BLUR, this.onBlur);
    }

    onFocus = () => this.props.setFocused(true);

    onBlur = () => this.props.setFocused(false);

    render() {
        const { loggedIn } = this.props;
        return (
            <div className={classNames(Styles.app)}>
                {loggedIn ? <Term /> : <div>Login!</div>}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        loggedIn: state.loggedIn,
    };
};

export default connect(mapStateToProps, { setFocused })(App);
