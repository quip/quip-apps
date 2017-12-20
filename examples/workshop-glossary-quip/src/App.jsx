import React, { Component } from "react";

import { API, Storage } from "./model";
import { Menu } from "./menus";

import "./App.less";

class App extends Component {
  constructor() {
    super();
    this.state = {
      phrase: Storage.get("phrase") || "",
      definition: Storage.get("definition") || "",
      focused: false,
      glossary: null,
      loading: false,
      phrases: [],
    };
  }

  componentDidMount() {
    this.loadGlossary();
  }

  loadGlossary = () => {
    this.setState({ loading: true });
    API.fetchAll()
      .then(response => response.json())
      .then(json => {
        const glossary = json.results;
        const phrase = this.state.phrase;
        let definition = this.state.definition;
        const term = glossary.find(term => term.phrase === phrase);
        if (phrase) {
          definition = term ? term.definition : "(none)";
        }
        this.setState({
          glossary,
          loading: false,
          phrases: glossary.map(term => term.phrase).sort(),
          definition,
        });
      })
      .catch(err => {
        console.error("API fetchAll err", err);
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

  onFocus = () => {
    this.setState({ focused: true });
  };

  onBlur = () => {
    this.setState({ focused: false });
  };

  render() {
    const { definition, focused, loading, phrase, phrases } = this.state;
    const appClassName = focused ? "app focused" : "app";
    console.log("appClassName", appClassName, focused);
    return (
      <div className={appClassName}>
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
            onFocus={this.onFocus}
            onBlur={this.onBlur}
          />
          <datalist id="phrases">
            {phrases.map(phrase => <option key={phrase} value={phrase} />)}
          </datalist>
        </div>
        <textarea
          className="definition"
          value={definition}
          onChange={this.onDefinitionChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        />
      </div>
    );
  }
}

export default App;
