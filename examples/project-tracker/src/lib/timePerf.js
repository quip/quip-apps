/* eslint no-console:0 */

export default (label, condition) => {
    if (process.env.NODE_ENV !== "production") {
        console.time(label);
        const int = setInterval(() => {
            if (condition()) {
                console.timeEnd(label);
                clearInterval(int);
            }
        }, 1);
    }
};
