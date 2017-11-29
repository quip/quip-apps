import quip from "quip";
import React from "react";
import { connect } from "react-redux";
import classNames from "classnames";

import Styles from "./App.less";

import { setFocused, setChosenEntry, updateGlossary } from "./redux/actions";

import Term from "./components/Term.jsx";
import { ChosenEntryRecord } from "./model";
import { updateAppToolbar } from "./menus";

class App extends React.Component {
    static propTypes = {
        chosenEntry: React.PropTypes.instanceOf(ChosenEntryRecord),
        definitionValue: React.PropTypes.string.isRequired,
        phraseValue: React.PropTypes.string.isRequired,
        loggedIn: React.PropTypes.bool.isRequired,
        setChosenEntry: React.PropTypes.func.isRequired,
        setFocused: React.PropTypes.func.isRequired,
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
            phraseValue,
            setChosenEntry,
            updateGlossary,
        } = this.props;
        const saveHandler = () => {
            const payload = { phrase: phraseValue, definition: definitionValue };
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
        console.warn("Updating app toolbar", saveEnabled);
        updateAppToolbar(saveEnabled ? saveHandler : null);
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
})(App);
