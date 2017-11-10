import quip from "quip";
import { Provider } from "react-redux";
import { createStore } from "redux";

import reducer from "./redux/reducer";

import App from "./App.jsx";

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        const store = createStore(reducer);
        ReactDOM.render(
            <Provider store={store}>
                <App />
            </Provider>,
            rootNode,
        );
    },
});
