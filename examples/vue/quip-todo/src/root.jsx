import quip from "quip";

import Vue from 'vue/dist/vue';

import { TodoListRecord } from "./todo/models";
export class RootRecord extends quip.apps.RootRecord {
    static getProperties = () => ({
        todo: TodoListRecord
    });

    static getDefaultProperties = () => ({
        todo: {
            items: []
        }
    });
}
quip.apps.registerClass(RootRecord, "root-record");

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