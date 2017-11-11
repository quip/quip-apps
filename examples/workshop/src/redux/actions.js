import debounce from "lodash.debounce";

const Actions = {
    GLOSSARY_ADD_PHRASE: "GLOSSARY_ADD_PHRASE",
    GLOSSARY_ADD_PHRASE_REMOTE: "GLOSSARY_ADD_PHRASE_REMOTE",
    GLOSSARY_LOADED: "GLOSSARY_LOADED",
    GLOSSARY_LOADING: "GLOSSARY_LOADING",
    GLOSSARY_UPDATING: "GLOSSARY_UPDATING",
    GLOSSARY_UPDATED: "GLOSSARY_UPDATED",
    GLOSSARY_UPDATED_REMOTE: "GLOSSARY_UPDATED_REMOTE",
    GLOSSARY_UPDATING_REMOTE: "GLOSSARY_UPDATING_REMOTE",
    ERROR: "ERROR",
};
export default Actions;

export const loadGlossary = () => async dispatch => {
    dispatch({
        type: Actions.GLOSSARY_LOADING,
    });
    try {
        const payload = await fetchGlossary();
        return dispatch({
            type: Actions.GLOSSARY_LOADED,
            payload,
        });
    } catch (e) {
        return dispatch({
            type: Actions.ERROR,
            payload: e,
        });
    }
};

const SERVER = "https://quipworkshop.herokuapp.com";

const fetchMockGlossary = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                results: [
                    {
                        id: 1,
                        phrase: "Foo",
                        definition: "Thing that programmers say",
                    },
                    {
                        id: 2,
                        phrase: "Bar",
                        definition: "Another thing that programmers say",
                    },
                ],
            });
        }, 1000);
    });
};

const fetchGlossary = async () => await (await fetch(`${SERVER}/all`)).json();

export const updateGlossary = ({ phrase, definition }) => async dispatch => {
    dispatch({
        type: Actions.GLOSSARY_UPDATED,
        payload: { phrase, definition },
    });
    updateGlossaryRemote({ phrase, definition }, dispatch);
};

const updateGlossaryRemote = debounce(({ phrase, definition }, dispatch) => {
    dispatch({
        type: Actions.GLOSSARY_UPDATING_REMOTE,
    });
    try {
        const updateURL = `${SERVER}/row/add?phrase=${phrase}&definition=${
            definition
        }`;
        let update = async () => await fetch(updateURL, { method: "POST" });
        update();
    } catch (e) {
        return dispatch({
            type: Actions.ERROR,
            payload: e,
        });
    }
    dispatch({
        type: Actions.GLOSSARY_UPDATED_REMOTE,
    });
    return dispatch({
        type: Actions.GLOSSARY_UPDATED,
        payload: { phrase, definition },
    });
}, 500);

export const addPhrase = phrase => async dispatch => {
    const definition = "new"; // TODO: this has to be something today.
    dispatch({
        type: Actions.GLOSSARY_ADD_PHRASE,
        payload: {
            phrase,
            definition,
        },
    });
    updateGlossaryRemote({ phrase, definition }, dispatch);
};
