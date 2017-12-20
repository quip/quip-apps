import React from "react";
import { connect } from "react-redux";

import Styles from "./Term.less";

import {
    loadGlossary,
    setChosenEntry,
    setDefinitionValue,
    setPhraseValue,
} from "../redux/actions";

class Term extends React.Component {
    static propTypes = {
        definitionValue: React.PropTypes.string,
        glossary: React.PropTypes.array.isRequired,
        isFocused: React.PropTypes.bool.isRequired,
        phraseValue: React.PropTypes.string.isRequired,
        loadGlossary: React.PropTypes.func.isRequired,
        setChosenEntry: React.PropTypes.func.isRequired,
        setDefinitionValue: React.PropTypes.func.isRequired,
        setPhraseValue: React.PropTypes.func.isRequired,
        terms: React.PropTypes.array.isRequired,
    };

    componentDidMount() {
        if (!this.props.glossary.length) {
            this.props.loadGlossary();
        }
    }

    handlePhraseChange = e => {
        const {
            glossary,
            setPhraseValue,
            setDefinitionValue,
            terms,
        } = this.props;
        const phrase = e.currentTarget.value;
        setPhraseValue(phrase);
        console.warn("handlePhraseChange", phrase, terms.indexOf(phrase));
        if (terms.indexOf(phrase) !== -1) {
            const definition = glossary.find(row => row.phrase === phrase)
                .definition;
            setDefinitionValue(definition);
        } else {
            setDefinitionValue("(none)");
        }
    };

    handleDefinitionChange = e => {
        const { setDefinitionValue } = this.props;
        const definition = e.currentTarget.value;
        setDefinitionValue(definition);
        console.warn("handleDefinitionChange", definition);
    };

    render() {
        const { isFocused, phraseValue, definitionValue, terms } = this.props;
        return (
            <div className={Styles.term}>
                <input
                    className={Styles.phrase}
                    list="terms"
                    onChange={this.handlePhraseChange}
                    onInput={this.handlePhraseChange}
                    readOnly={!isFocused}
                    value={phraseValue}
                />
                <datalist id="terms">
                    {terms.map(term => <option key={term} value={term} />)}
                </datalist>
                <textarea
                    className={Styles.definition}
                    onChange={this.handleDefinitionChange}
                    readOnly={!isFocused}
                    value={definitionValue}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const glossary = state.glossary;
    const terms = glossary
        .sort((a, b) => {
            if (a.phrase < b.phrase) {
                return -1;
            } else if (b.phrase < a.phrase) {
                return 1;
            }
            return 0;
        })
        .map(data => data.phrase);
    return {
        definitionValue: state.definitionValue,
        glossary,
        isFocused: state.isFocused,
        phraseValue: state.phraseValue,
        terms,
    };
};

export default connect(mapStateToProps, {
    loadGlossary,
    setChosenEntry,
    setDefinitionValue,
    setPhraseValue,
})(Term);
