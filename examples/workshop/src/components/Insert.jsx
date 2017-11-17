import React from "react";
import { connect } from "react-redux";

import Styles from "./Insert.less";

import { loadGlossary, setChosenEntry, setInputValue } from "../redux/actions";

class Insert extends React.Component {
    static propTypes = {
        chosenEntry: React.PropTypes.string,
        chosenEntryDefinition: React.PropTypes.string,
        terms: React.PropTypes.array.isRequired,
        glossary: React.PropTypes.array.isRequired,
        inputValue: React.PropTypes.string.isRequired,
        loadGlossary: React.PropTypes.func.isRequired,
        setChosenEntry: React.PropTypes.func.isRequired,
        setInputValue: React.PropTypes.func.isRequired,
    };

    componentDidMount() {
        if (!this.props.glossary.length) {
            this.props.loadGlossary();
        }
    }

    handleChange = e => {
        const { glossary, setChosenEntry, setInputValue, terms } = this.props;
        const phrase = e.currentTarget.value;
        setInputValue(phrase);
        console.NOCOMMIT("handleChange", phrase, terms.indexOf(phrase));
        if (terms.indexOf(phrase) !== -1) {
            console.NOCOMMIT("SET CHOSEN");
            const definition = glossary.find(row => row.phrase === phrase)
                .definition;
            setChosenEntry({ phrase, definition });
        }
    };

    render() {
        const { chosenEntry, inputValue, terms } = this.props;
        return (
            <div>
                <input
                    list="terms"
                    onChange={this.handleChange}
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
                    {chosenEntry && chosenEntry.definition}
                </p>
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
        chosenEntry: state.chosenEntry,
        glossary,
        inputValue: state.inputValue,
        terms,
    };
};

export default connect(mapStateToProps, {
    loadGlossary,
    setChosenEntry,
    setInputValue,
})(Insert);
