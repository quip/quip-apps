import $ from "jquery";
import quip from "quip";
import App from "./App.jsx";
import Styles from "./App.less"

var html = `
<div class="${Styles.app}">
    <div>
        <input type="text" class="${Styles.phrase}" list="phrases">
        <datalist id="phrases"></datalist>
    </div>
        <textarea class="${Styles.definition}"></textarea>
    </div>
</div>
`;

const SERVER = "https://quipworkshop.herokuapp.com";

class RootRecord extends quip.apps.RootRecord {
    static getProperties = () => ({
        phrase: "string",
        definition: "string",
    })
}
quip.apps.registerClass(RootRecord, "Root");

class Storage {
    get(key) {
        const record = quip.apps.getRootRecord();
        return record.get(key);
    }

    set(key, value) {
        const record = quip.apps.getRootRecord();
        record.set(key, value);
    }
}

const storage = new Storage();
let glossary;

quip.apps.initialize({
    initializationCallback: function(rootNode) {
        $(rootNode).html(html);
        main();
    },
});


const main = () => {
    const updateView = () => {
        // Restore from storage on load
        const phrase = storage.get("phrase");
        if (phrase) {
            $phrase.val(phrase);
        }

        const definition = storage.get("definition");
        if (definition) {
            $definition.val(definition);
        }
        updateMenu();
    };

    const updateMenu = () => {
        const saveEnabled = $phrase.val() && $definition.val() && (!storage.get("phrase") || (storage.get("phrase") != $phrase.val() || storage.get("definition") != $definition.val()));
        const refreshEnabled = storage.get("phrase") && !saveEnabled;
        console.warn("Updating app buttons");
        let commands = [];
        if (refreshEnabled) {
            commands.push("refresh");
        }
        if (saveEnabled) {
            commands.push("save");
            commands.push("discard");
        }
        quip.apps.updateToolbar({
            toolbarCommandIds: commands,
            menuCommands: [
                {
                    id: "save",
                    label: "Save",
                    handler: saveHandler,
                },
                {
                    id: "refresh",
                    label: "Refresh",
                    handler: refreshHandler,
                },
                {
                    id: "discard",
                    label: "Discard",
                    handler: discardHandler,
                },
            ],
        });
    };

     // Define handlers
    const saveHandler = e => {
        const phrase = $phrase.val();
        const definition = $definition.val();
        storage.set("phrase", phrase);
        storage.set("definition", definition);
        console.log("saved", phrase, definition);
        fetch(
            `${SERVER}/row/add?phrase=${phrase}&definition=${definition}`,
        ).then(response => {
            console.log("Save response", response);
            loadGlossary(); // Load in the term we just saved
        });
        updateMenu();
    };

    const discardHandler = e => {
        $phrase.set(storage.get("phrase"));
        $definition.set(storage.get("definition"));
        updateMenu();
    };

    const refreshHandler = e => loadGlossary();

    const loadGlossary = () => {
        console.log("loadGlossary");
        fetch(`${SERVER}/all`)
            .then(response => response.json())
            .then(json => {
                glossary = json.results;
                console.log("loadGlossary got", glossary);
                $phrases.empty();
                glossary.forEach(term => {
                    const $phrase = $(`<option value="${term.phrase}">`);
                    $phrases.append($phrase);
                });
                const phrase = $phrase.val();
                const term = glossary.find(term => term.phrase == phrase);
                if (term) {
                    $definition.val(term.definition);
                }
            })
            .catch(err => {
                console.error("loadGlossary err", err);
            });
    };

    // Initialize
    const $phrase = $("." + Styles.phrase);
    const $definition = $("." + Styles.definition);
    const $phrases = $("#phrases");

    updateView();

    // Load the term list
    loadGlossary();

    // Register model listeners
    quip.apps.getRootRecord().listen(() => {
        console.log("Listen update root record");
        updateView();
        loadGlossary();;
    });

    // Register listeners
    $phrase.on("input change", e => {
        const phrase = e.target.value;
        console.log("phrase change", phrase, glossary);
        if (glossary) {
            let definition;
            const term = glossary.find(term => term.phrase == phrase);
            if (term) {
                $definition.val(term.definition);
            } else {
                $definition.val("(none)");
            }
            updateMenu();
        }
    });

    $definition.on("input change", e => {
        const definition = e.target.value;
        console.log("definition change", definition, glossary);
        updateMenu();
    });

    quip.apps.addEventListener(quip.apps.EventType.FOCUS, () => {
        console.warn("Focused glossary");
        $definition.addClass(Styles.definitionFocused);
    });

    quip.apps.addEventListener(quip.apps.EventType.BLUR, () => {
        console.warn("Blurred glossary");
        $definition.removeClass(Styles.definitionFocused);
    });
};
