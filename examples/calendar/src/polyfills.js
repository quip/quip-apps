/* @flow */
// Copyright 2017 Quip

const polyfills = {
    elementsFromPoint: function (x: number, y: number) {
        if (window.document.elementsFromPoint) {
            return window.document.elementsFromPoint(x, y);
        }
        // Polyfill for Safari et al.
        // https://gist.github.com/oslego/7265412
        var parents = [];
        var parent = void 0;
        do {
            if (parent !== document.elementFromPoint(x, y)) {
                parent = document.elementFromPoint(x, y);
                parents.push(parent);
                parent.style.pointerEvents = "none";
            } else {
                parent = false;
            }
        } while (parent);
        parents.forEach(function (parent) {
            return (parent.style.pointerEvents = "all");
        });
        return parents;
    },
};
export default polyfills;
