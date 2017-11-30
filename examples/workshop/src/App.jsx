import quip from "quip";
import React from "react";
import { connect } from "react-redux";
import classNames from "classnames";

import Styles from "./App.less";

import {
    loadGlossary,
    setChosenEntry,
    setDefinitionValue,
    setFocused,
    setPhraseValue,
    updateGlossary,
} from "./redux/actions";

import Term from "./components/Term.jsx";
import { ChosenEntryRecord } from "./model";
import { updateAppToolbar } from "./menus";

class App extends React.Component {
    static propTypes = {
        chosenEntry: React.PropTypes.instanceOf(ChosenEntryRecord),
        definitionValue: React.PropTypes.string.isRequired,
        loadGlossary: React.PropTypes.func.isRequired,
        loggedIn: React.PropTypes.bool.isRequired,
        phraseValue: React.PropTypes.string.isRequired,
        setChosenEntry: React.PropTypes.func.isRequired,
        setDefinitionValue: React.PropTypes.func.isRequired,
        setFocused: React.PropTypes.func.isRequired,
        setPhraseValue: React.PropTypes.func.isRequired,
        updateGlossary: React.PropTypes.func.isRequired,
    };

    componentDidMount() {
        quip.apps.addEventListener(quip.apps.EventType.FOCUS, this.onFocus);
        quip.apps.addEventListener(quip.apps.EventType.BLUR, this.onBlur);
    }

    componentDidUpdate() {
        this.updateToolbar_();
    }

    updateToolbar_() {
        const {
            chosenEntry,
            definitionValue,
            loadGlossary,
            phraseValue,
            setChosenEntry,
            setDefinitionValue,
            setPhraseValue,
            updateGlossary,
        } = this.props;
        const saveHandler = () => {
            const payload = {
                phrase: phraseValue,
                definition: definitionValue,
            };
            setChosenEntry(payload);
            updateGlossary(payload);
            this.updateToolbar_();
        };
        const saveEnabled =
            phraseValue &&
            definitionValue &&
            (!chosenEntry ||
                (chosenEntry.phrase != phraseValue ||
                    chosenEntry.definition != definitionValue));
        const refreshHandler = () => {
            loadGlossary();
        };
        const refreshEnabled = chosenEntry && !saveEnabled;
        const discardHandler = () => {
            setPhraseValue(chosenEntry.phrase);
            setDefinitionValue(chosenEntry.definition);
            this.updateToolbar_();
        };
        const discardEnabled = saveEnabled;
        console.warn(
            "Updating app toolbar",
            refreshEnabled,
            saveEnabled,
            discardEnabled,
        );
        updateAppToolbar(
            refreshEnabled ? refreshHandler : null,
            saveEnabled ? saveHandler : null,
            discardEnabled ? discardHandler : null,
        );
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
        definitionValue: state.definitionValue,
        phraseValue: state.phraseValue,
        loggedIn: state.loggedIn,
        chosenEntry: state.chosenEntry,
    };
};

export default connect(mapStateToProps, {
    setChosenEntry,
    setFocused,
    updateGlossary,
    loadGlossary,
    setPhraseValue,
    setDefinitionValue,
})(App);
