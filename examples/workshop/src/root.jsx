import quip from "quip";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import reducer, { getInitialState } from "./redux/reducer";

import App from "./App.jsx";

quip.apps.initialize({
    initializationCallback: function(rootNode, { isCreation }) {
        const rootRecord = quip.apps.getRootRecord();
        const store = createStore(
            reducer,
            // TODO: causes script warnings / redux devtools to break
            /* getInitialState(rootRecord), */
            composeWithDevTools(applyMiddleware(thunk)),
        );
        ReactDOM.render(
            <Provider store={store}>
                <App />
            </Provider>,
            rootNode,
        );
    },
});
