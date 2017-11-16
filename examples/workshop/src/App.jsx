import quip from "quip";
import React from "react";
import { connect } from "react-redux";
import classNames from "classnames";

import Styles from "./App.less";

import {
    Tabs,
    loadGlossary,
    setFocused,
    setTabSelected,
} from "./redux/actions";

import Glossary, { Term } from "./components/Glossary.jsx";
import Insert from "./components/Insert.jsx";

class App extends React.Component {
    static propTypes = {
        chosenPhrase: React.PropTypes.string,
        chosenPhraseDefinition: React.PropTypes.string,
        isFocused: React.PropTypes.bool.isRequired,
        loggedIn: React.PropTypes.bool.isRequired,
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
        const {
            chosenPhrase,
            chosenPhraseDefinition,
            isFocused,
            loggedIn,
        } = this.props;
        return (
            <div
                className={classNames(Styles.app, {
                    [Styles.isFocused]: isFocused,
                })}
            >
                {loggedIn ? (
                    isFocused || !chosenPhrase ? (
                        <TabSwitcher />
                    ) : (
                        <Term
                            definition={chosenPhraseDefinition}
                            phrase={chosenPhrase}
                        />
                    )
                ) : (
                    <div>Login!</div>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => {
    const chosenPhrase = state.chosenPhrase;
    let chosenPhraseDefinition;
    if (chosenPhrase) {
        chosenPhraseDefinition = state.glossary.find(
            row => row.phrase === chosenPhrase,
        ).definition;
    }
    return {
        chosenPhrase,
        chosenPhraseDefinition,
        isFocused: state.isFocused,
        loggedIn: state.loggedIn,
    };
};

export default connect(mapStateToProps, { setFocused })(App);

class TabSwitcher extends React.Component {
    static propTypes = {
        error: React.PropTypes.any,
        glossary: React.PropTypes.object.isRequired,
        glossaryLoading: React.PropTypes.bool.isRequired,
        loadGlossary: React.PropTypes.func.isRequired,
        setTabSelected: React.PropTypes.func.isRequired,
        tabSelected: React.PropTypes.string.isRequired,
    };

    /*
    componentDidMount() {
        if (!this.props.glossary) {
            this.props.loadGlossary();
        }
    }
    */

    handleClickChangeTab = (tabSelected, e) => {
        this.props.setTabSelected(tabSelected);
    };

    render() {
        const { error, glossary, glossaryLoading, tabSelected } = this.props;
        // if (error) {
        //     return <h1>ERROR! {error}</h1>;
        // }
        // if (glossaryLoading) {
        //     return <h1>Loading!</h1>;
        // }
        return (
            <div className={Styles.tabSwitcher}>
                <div className={Styles.tabs}>
                    <div
                        className={classNames({
                            [Styles.selected]: tabSelected === Tabs.INSERT,
                        })}
                        onClick={this.handleClickChangeTab.bind(
                            this,
                            Tabs.INSERT,
                        )}
                    >
                        Choose
                    </div>
                    <div
                        className={classNames({
                            [Styles.selected]: tabSelected === Tabs.EDITOR,
                        })}
                        onClick={this.handleClickChangeTab.bind(
                            this,
                            Tabs.EDITOR,
                        )}
                    >
                        Glossary
                    </div>
                </div>
                <div className={Styles.tabContent}>
                    {tabSelected === Tabs.INSERT ? <Insert /> : <Glossary />}
                </div>
            </div>
        );
    }
}
const mapTabsStateToProps = state => {
    return {
        error: state.error,
        glossaryLoading: state.glossaryLoading,
        tabSelected: state.tabSelected,
    };
};

TabSwitcher = connect(mapTabsStateToProps, {
    loadGlossary,
    setTabSelected,
})(TabSwitcher);
