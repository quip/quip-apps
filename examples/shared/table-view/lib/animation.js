import {spring} from "react-motion";
export const animateTo = value => {
    return spring(value, {
        stiffness: 210,
        damping: 20,
    });
};
