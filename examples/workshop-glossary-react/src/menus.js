//import quip from "quip"
import React, { Component } from "react";

import { SERVER, Storage } from "./model";

export class Menu extends Component {
  props: {
    definition: string,
    discardChanges: Function,
    loadGlossary: Function,
    phrase: string,
  };

  onClickSave = () => {
    const { definition, loadGlossary, phrase } = this.props;
    Storage.set("phrase", phrase);
    Storage.set("definition", definition);
    fetch(`${SERVER}/row/add?phrase=${phrase}&definition=${definition}`).then(
      response => {
        console.log("Save response", response);
        loadGlossary(); // Load in the term we just saved
      },
    );
  };

  render() {
    const { definition, discardChanges, loadGlossary, phrase } = this.props;
    const storedPhrase = Storage.get("phrase");
    const storedDefinition = Storage.get("definition");
    const saveEnabled =
      phrase &&
      definition &&
      (!storedPhrase ||
        (storedPhrase !== phrase || storedDefinition !== definition));
    const refreshEnabled = storedPhrase && !saveEnabled;

    return (
      <div>
        <button
          className="save"
          onClick={this.onClickSave}
          disabled={!saveEnabled}
        >
          Save
        </button>
        <button className="discard" onClick={discardChanges}>
          Discard
        </button>
        <button
          className="refresh"
          onClick={loadGlossary}
          disabled={!refreshEnabled}
        >
          Reload Glossary
        </button>
      </div>
    );
  }
}

export const updateMenu = () => {
  /*
    const saveEnabled = $phrase.val() && $definition.val() && (!storage.get("phrase") || (storage.get("phrase") != $phrase.val() || storage.get("definition") != $definition.val()));
    const refreshEnabled = storage.get("phrase") && !saveEnabled;
    console.warn("Updating app buttons");
    let commands = [];
    if (refreshEnabled) {
        commands.push("refresh");
    }
    if (saveEnabled) {
        commands.push("save");
        commands.push("discard");
    }
    quip.apps.updateToolbar({
        toolbarCommandIds: commands,
        menuCommands: [
            {
                id: "save",
                label: "Save",
                handler: saveHandler,
            },
            {
                id: "refresh",
                label: "Refresh",
                handler: refreshHandler,
            },
            {
                id: "discard",
                label: "Discard",
                handler: discardHandler,
            },
        ],
    });
    */
};
