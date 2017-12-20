const SERVER = "https://quipworkshop.herokuapp.com";

export const Storage = {
  get(key) {
    if (typeof localStorage !== "object") {
      console.error("no localStorage :(");
      return "";
    }
    return localStorage.getItem(key);
  },

  set(key, value) {
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
