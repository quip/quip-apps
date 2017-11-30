import quip from "quip";
import debounce from "lodash.debounce";

const Actions = {
    ERROR: "ERROR",
    GLOSSARY_ADD_PHRASE_REMOTE: "GLOSSARY_ADD_PHRASE_REMOTE",
    GLOSSARY_ADD_PHRASE: "GLOSSARY_ADD_PHRASE",
    GLOSSARY_LOADED: "GLOSSARY_LOADED",
    GLOSSARY_LOADING: "GLOSSARY_LOADING",
    GLOSSARY_UPDATED_REMOTE: "GLOSSARY_UPDATED_REMOTE",
    GLOSSARY_UPDATED: "GLOSSARY_UPDATED",
    GLOSSARY_UPDATING_REMOTE: "GLOSSARY_UPDATING_REMOTE",
    GLOSSARY_UPDATING: "GLOSSARY_UPDATING",
    SET_CHOSEN_ENTRY: "SET_CHOSEN_ENTRY",
    SET_FOCUSED: "SET_FOCUSED",
    SET_PHRASE_VALUE: "SET_PHRASE_VALUE",
    SET_DEFINITION_VALUE: "SET_DEFINITION_VALUE",
};
export default Actions;

export const loadGlossary = () => async dispatch => {
    dispatch({ type: Actions.GLOSSARY_LOADING });
    try {
        const fetched = await fetchGlossary();
        const glossary = fetched.results;

        const rootRecord = quip.apps.getRootRecord();
        const chosenEntry = rootRecord.get("chosenEntry");
        let chosenEntrySpread;
        if (chosenEntry) {
            const phrase = chosenEntry.get("phrase");
            chosenEntry.set(
                "definition",
                glossary.find(row => row.phrase === phrase).definition,
            );
            chosenEntrySpread = chosenEntry.spread();
        }
        return dispatch({
            type: Actions.GLOSSARY_LOADED,
            payload: {
                chosenEntry: chosenEntrySpread,
                glossary,
            },
        });
    } catch (e) {
        return dispatch({
            type: Actions.ERROR,
            payload: e,
        });
    }
};

const SERVER = "https://quipworkshop.herokuapp.com";

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

export const setPhraseValue = payload => ({
    type: Actions.SET_PHRASE_VALUE,
    payload,
});

export const setDefinitionValue = payload => ({
    type: Actions.SET_DEFINITION_VALUE,
    payload,
});

export const setChosenEntry = payload => dispatch => {
    const rootRecord = quip.apps.getRootRecord();
    const currentChosenPhrase = rootRecord.get("chosenEntry");
    if (currentChosenPhrase) {
        rootRecord.clear("chosenEntry");
    }

    rootRecord.set("chosenEntry", {
        phrase: payload.phrase,
        definition: payload.definition,
    });
    return dispatch({
        type: Actions.SET_CHOSEN_ENTRY,
        payload,
    });
};

export const setFocused = payload => ({
    type: Actions.SET_FOCUSED,
    payload,
});
