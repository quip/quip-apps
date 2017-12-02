const SERVER = "https://quipworkshop.herokuapp.com";

class Storage {
    get(key) {
        return localStorage.getItem(key);
    }

    set(key, value) {
        localStorage.setItem(key, value);
    }
}

const storage = new Storage();
let glossary;

const main = () => {
    const $phrase = $(".phrase");
    const $definition = $(".definition");
    const $phrases = $("#phrases");
    const $save = $(".save");
    const $discard = $(".discard");
    const $refresh = $(".refresh");

    // Restore from storage on load
    const phrase = storage.get("phrase");
    if (phrase) {
        $phrase.val(phrase);
    }
    const definition = storage.get("definition");
    if (definition) {
        $definition.val(definition);
    }

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

    $save.on("click", e => {
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
    });

    $discard.on("click", e => {
        $phrase.set(storage.get("phrase"));
        $definition.set(storage.get("definition"));
        updateMenu();
    });

    $refresh.on("click", () => loadGlossary());

    // Helper functions
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

    const updateMenu = () => {
        const saveEnabled =
            $phrase.val() &&
            $definition.val() &&
            (!storage.get("phrase") ||
                (storage.get("phrase") != $phrase.val() ||
                    storage.get("definition") != $definition.val()));
        const refreshEnabled = storage.get("phrase") && !saveEnabled;
        console.warn("Updating app buttons");
        saveEnabled ? $save.show() : $save.hide();
        saveEnabled ? $discard.show() : $discard.hide();
        refreshEnabled ? $refresh.show() : $refresh.hide();
    };

    // Load the term list
    loadGlossary();
    updateMenu();
};

$(document).ready(main);
