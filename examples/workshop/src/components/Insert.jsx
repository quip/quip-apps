import React from "react";
import { connect } from "react-redux";

import Styles from "./Insert.less";

import { loadGlossary, setChosenPhrase, setInputValue } from "../redux/actions";

class Insert extends React.Component {
    static propTypes = {
        chosenPhrase: React.PropTypes.string,
        chosenPhraseDefinition: React.PropTypes.string,
        terms: React.PropTypes.array.isRequired,
        inputValue: React.PropTypes.string.isRequired,
        loadGlossary: React.PropTypes.func.isRequired,
        setChosenPhrase: React.PropTypes.func.isRequired,
        setInputValue: React.PropTypes.func.isRequired,
    };

    componentDidMount() {
        if (!this.props.glossary) {
            this.props.loadGlossary();
        }
    }

    handleChange = e => {
        const { setChosenPhrase, setInputValue, terms } = this.props;
        const value = e.currentTarget.value;
        setInputValue(e.currentTarget.value);
        console.NOCOMMIT("handleChange", value, terms.indexOf(value));
        if (terms.indexOf(value) !== -1) {
            console.NOCOMMIT("SET CHOSEN");
            setChosenPhrase(value);
        }
    };

    render() {
        const { chosenPhraseDefinition, inputValue, terms } = this.props;
        return (
            <div>
                <input
                    list="terms"
                    onInput={this.handleChange}
                    value={inputValue}
                    style={{
                        fontSize: "1.5em",
                        fontWeight: 600,
                        margin: 0,
                        padding: 0,
                        border: 0,
                        borderBottom: "1px solid #ccc",
                        outline: "none",
                    }}
                />
                <datalist id="terms">
                    {terms.map(term => <option key={term} value={term} />)}
                </datalist>
                <p
                    style={{
                        fontSize: "2em",
                        fontStyle: "italic",
                        margin: 0,
                        marginTop: 5,
                    }}
                >
                    {chosenPhraseDefinition}
                </p>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const terms = state.glossary
        .sort((a, b) => {
            if (a.phrase < b.phrase) {
                return -1;
            } else if (b.phrase < a.phrase) {
                return 1;
            }
            return 0;
        })
        .map(data => data.phrase);
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
        inputValue: state.inputValue,
        terms,
    };
};

export default connect(mapStateToProps, {
    loadGlossary,
    setChosenPhrase,
    setInputValue,
})(Insert);
