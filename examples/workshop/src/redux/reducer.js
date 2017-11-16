import Actions, { Tabs } from "./actions";

const DEFAULT_STATE = {
    chosenPhrase: null,
    error: null,
    isFocused: false,
    glossary: [],
    glossaryLoading: false,
    glossaryUpdatingRemote: false,
    inputValue: "",
    loggedIn: true,
    rootRecord: null,
    tabSelected: Tabs.INSERT,
};

export default function reducer(state = DEFAULT_STATE, action) {
    //console.error("-> reducer", action);
    switch (action.type) {
        case Actions.GLOSSARY_LOADING:
            return {
                ...state,
                glossaryLoading: true,
            };
        case Actions.GLOSSARY_LOADED:
            return {
                ...state,
                glossary: action.payload.results,
                glossaryLoading: false,
            };
        case Actions.GLOSSARY_UPDATED:
            // TODO(elsigh): use a map and emit an array from it
            return {
                ...state,
                glossary: state.glossary.map(row => {
                    if (row.phrase === action.payload.phrase) {
                        row.definition = action.payload.definition;
                    }
                    return row;
                }),
            };
        case Actions.GLOSSARY_UPDATING_REMOTE:
            return {
                ...state,
                glossaryUpdatingRemote: true,
            };
        case Actions.GLOSSARY_UPDATED_REMOTE:
            return {
                ...state,
                glossaryUpdatingRemote: false,
            };
        case Actions.GLOSSARY_ADD_PHRASE:
            return {
                ...state,
                glossary: [action.payload, ...state.glossary],
            };
        case Actions.ERROR:
            return {
                ...state,
                glossaryLoading: false,
                glossaryUpdatingRemote: false,
                error: action.payload,
            };
        case Actions.SET_TAB_SELECTED:
            return {
                ...state,
                tabSelected: action.payload,
            };
        case Actions.SET_INPUT_VALUE:
            return {
                ...state,
                inputValue: action.payload,
            };
        case Actions.SET_CHOSEN_PHRASE:
            return {
                ...state,
                chosenPhrase: action.payload,
            };

        case Actions.SET_FOCUSED:
            return {
                ...state,
                isFocused: action.payload,
            };
        default:
            return { ...state };
    }
}

export const getInitialState = rootRecord => {
    return {
        ...DEFAULT_STATE,
        rootRecord,
    };
};
