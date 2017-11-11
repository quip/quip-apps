import React from "react";
import { connect } from "react-redux";

import Styles from "./App.less";

import Glossary from "./components/Glossary.jsx";

class App extends React.Component {
    static propTypes = {
        loggedIn: React.PropTypes.bool.isRequired,
    };

    render() {
        const { loggedIn } = this.props;
        return <div>{loggedIn ? <Glossary /> : <div>Login!</div>}</div>;
    }
}

const mapStateToProps = state => {
    return {
        loggedIn: state.loggedIn,
    };
};

export default connect(mapStateToProps)(App);
