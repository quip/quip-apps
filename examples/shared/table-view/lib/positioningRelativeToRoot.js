export default (root, el) => {
    const rootPos = root.getBoundingClientRect();
    const elPos = el.getBoundingClientRect();
    const positioning = ["top", "right", "bottom", "left"].reduce((acc, key) => {
        acc[key] = elPos[key] - rootPos[key];
        return acc;
    }, {});
    return positioning;
};
