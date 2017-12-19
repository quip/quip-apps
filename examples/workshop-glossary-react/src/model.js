export const SERVER = "https://quipworkshop.herokuapp.com";

export const Storage = {
  get(key) {
    return localStorage.getItem(key);
  },

  set(key, value) {
    localStorage.setItem(key, value);
  },
};
