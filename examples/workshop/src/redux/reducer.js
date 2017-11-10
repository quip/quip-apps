const DEFAULT_STATE = {
    loggedIn: false,
};

export default function reducer(state = DEFAULT_STATE, action) {
    switch (action.type) {
        case "SOMETHING":
            return { ...state };
        default:
            return { ...state };
    }
}
