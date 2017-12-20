import quip from "quip";
import React from "react";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
//import { composeWithDevTools } from "redux-devtools-extension";

import reducer, { getInitialState } from "./redux/reducer";

import App from "./App.jsx";

quip.apps.initialize({
    initializationCallback: function(rootNode, { isCreation }) {
        const rootRecord = quip.apps.getRootRecord();
        const store = createStore(
            reducer,
            getInitialState(rootRecord),
            applyMiddleware(thunk),
            // TODO: causes script warnings / redux devtools to break
            //composeWithDevTools(applyMiddleware(thunk)),
        );
        ReactDOM.render(
            <Provider store={store}>
                <App />
            </Provider>,
            rootNode,
        );
    },
});
