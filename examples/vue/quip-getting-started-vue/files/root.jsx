import quip from "quip";

import Vue from 'vue/dist/vue';

import App from './App.vue';
Vue.component('App', App);

quip.apps.initialize({
    initializationCallback: function (rootNode, params) {
        const container = document.createElement('div');
        rootNode.appendChild(container);
        new Vue({
            el: container,
            render: function (h) {
                return h(App, { props: params });
            }
        });
    },
});
