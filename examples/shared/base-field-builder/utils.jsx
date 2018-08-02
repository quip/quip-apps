import IntlPolyfill from "intl";
import en from "intl/locale-data/jsonp/en.js";

if (!global.Intl) {
    global.Intl = IntlPolyfill;
}

export function entityListener(WrappedComponent) {
    return class extends React.Component {
        componentDidMount() {
            this.props.entity.listen(this.onEntityChange_);
        }

        componentWillUnmount() {
            this.props.entity.unlisten(this.onEntityChange_);
        }

        getWrappedComponent() {
            return this.wrappedComponent_;
        }

        render() {
            return <WrappedComponent
                {...this.props}
                ref={node => (this.wrappedComponent_ = node)}/>;
        }

        onEntityChange_ = () => {
            this.forceUpdate();
        };
    };
}

if (!Element.prototype.scrollIntoViewIfNeeded) {
    Element.prototype.scrollIntoViewIfNeeded = function(centerIfNeeded) {
        // TODO add a polyfill for Firefox and Edge
        // e.g., https://gist.github.com/hsablonniere/2581101
    };
}

export function arrayEqual(a1, a2) {
    if (a1.length != a2.length) {
        return false;
    }
    for (var i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) {
            return false;
        }
    }
    return true;
}

export function shallowEqual(objA, objB) {
    if (Object.is(objA, objB)) {
        return true;
    }

    if (typeof objA !== "object" ||
        objA === null ||
        typeof objB !== "object" ||
        objB === null) {
        return false;
    }

    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
        return false;
    }

    // Test for A's keys different from B.
    for (let i = 0; i < keysA.length; i++) {
        if (!hasOwnProperty.call(objB, keysA[i]) ||
            !Object.is(objA[keysA[i]], objB[keysA[i]])) {
            return false;
        }
    }

    return true;
}

export function sortBy(array, keyFn, descending) {
    array.sort(function(a, b) {
        var keyA = keyFn(a);
        var keyB = keyFn(b);
        if (keyA < keyB) {
            return descending ? 1 : -1;
        } else if (keyA > keyB) {
            return descending ? -1 : 1;
        } else {
            return 0;
        }
    });
    return array;
}

export function unescapeHTML(str) {
    str = String(str);
    const HTML_UNESCAPE_AMP_RE_ = /\&amp;/g;
    const HTML_UNESCAPE_LT_RE_ = /\&lt;/g;
    const HTML_UNESCAPE_GT_RE_ = /\&gt;/g;
    if (!str || str.indexOf("&") == -1) {
        return str;
    }
    str = str.replace(HTML_UNESCAPE_LT_RE_, "<");
    str = str.replace(HTML_UNESCAPE_GT_RE_, ">");
    str = str.replace(HTML_UNESCAPE_AMP_RE_, "&");
    return str;
}

export function formatNumber(value) {
    if (value === null) {
        return null;
    }
    const options = {maximumFractionDigits: 2};
    const formattedNumber = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
    }).format(value);
    return formattedNumber;
}

export function formatBoolean(value) {
    return value ? "True" : "False";
}

export function normalizeNewlines(str) {
    return str.replace(/\r?\n|\r/g, "\n");
}
