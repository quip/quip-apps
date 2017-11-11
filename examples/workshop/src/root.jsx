import quip from "quip";
import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import reducer from "./redux/reducer";

import App from "./App.jsx";

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        ReactDOM.render(
            <Provider store={store}>
                <App />
            </Provider>,
            rootNode,
        );
    },
});
