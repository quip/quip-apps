import React from "react";
import { connect } from "react-redux";

import Styles from "./App.less";

class App extends React.Component {
    static propTypes = {
        loggedIn: React.PropTypes.bool.isRequired,
    };

    render() {
        const { loggedIn } = this.props;
        return <div>HI loggedIn? {loggedIn ? "YES" : "NO"}</div>;
    }
}

const mapStateToProps = state => {
    return {
        loggedIn: state.loggedIn,
    };
};

export default connect(mapStateToProps)(App);
