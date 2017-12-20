import React, { Component } from "react";

import { API, Storage } from "./model";

export class Menu extends Component {
  props: {
    definition: string,
    discardChanges: Function,
    loadGlossary: Function,
    phrase: string,
  };

  onClickSave = () => {
    const { definition, loadGlossary, phrase } = this.props;
    API.save(phrase, definition)
      .then(response => {
        console.log("API save response", response);
        loadGlossary();
      })
      .catch(err => {
        console.error("API save err", err);
      });
  };

  getButtonsEnabled() {
    const { definition, phrase } = this.props;
    const storedPhrase = Storage.get("phrase");
    const storedDefinition = Storage.get("definition");
    const saveEnabled =
      phrase &&
      definition &&
      (!storedPhrase ||
        (storedPhrase !== phrase || storedDefinition !== definition));
    const refreshEnabled = storedPhrase && !saveEnabled;
    return { refreshEnabled, saveEnabled };
  }

  updateQuipMenu() {
    const { discardChanges, loadGlossary } = this.props;
    const { refreshEnabled, saveEnabled } = this.getButtonsEnabled();
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
          handler: this.onClickSave,
        },
        {
          id: "refresh",
          label: "Refresh",
          handler: loadGlossary,
        },
        {
          id: "discard",
          label: "Discard",
          handler: discardChanges,
        },
      ],
    });
    return null;
  }

  updateDOMMenu() {
    const { definition, discardChanges, loadGlossary, phrase } = this.props;
    const { refreshEnabled, saveEnabled } = this.getButtonsEnabled();

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

  render() {
    return typeof quip !== "undefined"
      ? this.updateQuipMenu()
      : this.updateDOMMenu();
  }
}
