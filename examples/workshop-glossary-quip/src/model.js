const SERVER = "https://quipworkshop.herokuapp.com";

class RootRecord extends quip.apps.RootRecord {
  static getProperties = () => ({
    phrase: "string",
    definition: "string",
  });
}
quip.apps.registerClass(RootRecord, "Root");

export const Storage = {
  get(key) {
    if (typeof quip !== "undefined") {
      const record = quip.apps.getRootRecord();
      return record.get(key);
    }
    if (typeof localStorage !== "object") {
      console.error("no localStorage :(");
      return "";
    }
    return localStorage.getItem(key);
  },

  set(key, value) {
    if (typeof quip !== "undefined") {
      const record = quip.apps.getRootRecord();
      record.set(key, value);
      return;
    }
    if (typeof localStorage !== "object") {
      console.error("no localStorage :(");
      return;
    }
    localStorage.setItem(key, value);
  },
};

export const API = {
  fetchAll() {
    return fetch(`${SERVER}/all`);
  },

  save(phrase, definition) {
    Storage.set("phrase", phrase);
    Storage.set("definition", definition);
    return fetch(`${SERVER}/row/add?phrase=${phrase}&definition=${definition}`);
  },
};
