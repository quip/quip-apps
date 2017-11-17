import quip from "quip";

export class RootRecord extends quip.apps.RootRecord {
    static getProperties() {
        return {
            chosenEntry: ChosenEntryRecord,
        };
    }
}

class ChosenEntryRecord extends quip.apps.Record {
    static getProperties() {
        return {
            phrase: "string",
            definition: "string",
            notes: quip.apps.RichTextRecord,
            image: quip.apps.ImageRecord,
        };
    }

    spread() {
        let image = this.get("image");
        let notes = this.get("notes");
        return {
            phrase: this.get("phrase"),
            definition: this.get("definition"),
            imageRecordId: image ? image.id : null,
            notesRecordId: notes ? notes.id : null,
        };
    }
}

quip.apps.registerClass(RootRecord, "Root");
quip.apps.registerClass(ChosenEntryRecord, "ChosenEntry");
