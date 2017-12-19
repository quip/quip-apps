import React, { Component } from "react";

import { SERVER, Storage } from "./model";
import { Menu } from "./menus";

import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      phrase: Storage.get("phrase") || "",
      definition: Storage.get("definition") || "",
      loading: false,
      phrases: [],
    };
  }

  componentDidMount() {
    this.loadGlossary();
  }

  loadGlossary = () => {
    this.setState({ loading: true });
    fetch(`${SERVER}/all`)
      .then(response => response.json())
      .then(json => {
        const glossary = json.results;
        console.log("loadGlossary got", glossary);
        const phrase = this.state.phrase;
        const term = glossary.find(term => term.phrase === phrase);
        let definition = this.state.definition;
        if (phrase) {
          definition = term.definition;
        }
        this.setState({
          loading: false,
          phrases: glossary.map(term => term.phrase),
          definition,
        });
      })
      .catch(err => {
        console.error("loadGlossary err", err);
        this.setState({
          glossary: null,
          loading: false,
        });
      });
  };

  discardChanges = () => {
    this.setState({
      definition: Storage.get("definition"),
      phrase: Storage.get("phrase"),
    });
  };

  onPhraseChange = e => {
    const phrase = e.target.value;
    this.setState({
      phrase,
    });
    const { glossary } = this.state;
    console.log("phrase change", phrase, glossary);
    if (glossary) {
      let definition;
      const term = glossary.find(term => term.phrase === phrase);
      definition = term ? term.definition : "(none)";
      this.setState({ definition });
    }
  };

  onDefinitionChange = e => {
    const definition = e.target.value;
    this.setState({ definition });
  };

  render() {
    const { definition, loading, phrase, phrases } = this.state;
    return (
      <div className="app">
        {loading ? <div className="loading">Loading ...</div> : null}
        <div className="buttons">
          <Menu
            phrase={phrase}
            definition={definition}
            discardChanges={this.discardChanges}
            loadGlossary={this.loadGlossary}
          />
        </div>
        <div>
          <input
            type="text"
            className="phrase"
            list="phrases"
            value={phrase}
            onChange={this.onPhraseChange}
          />
          <datalist id="phrases">
            {phrases.map(phrase => <option key={phrase} value={phrase} />)}
          </datalist>
        </div>
        <textarea
          className="definition"
          value={definition}
          onChange={this.onDefinitionChange}
        />
      </div>
    );
  }
}

export default App;
