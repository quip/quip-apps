// Copyright 2017 Quip

import quip from "quip";

import ListenerRecord from "./listenerRecord";

const defaultOptionText = index =>
    `Option${typeof index === "number" ? ` ${index + 1}` : ""}`;
const matchDefaultOptionText = text => (text.match(/^Option (\d+)$/) || [])[1];

class Root extends quip.apps.RootRecord {
    static CONSTRUCTOR_KEY = "Root";
    static DATA_VERSION = 2;

    static getProperties = () => ({
        color: "string",
        allowMultiple: "boolean",
        options: quip.apps.RecordList.Type(Option),
    });

    static getDefaultProperties = () => ({
        color: quip.apps.ui.ColorMap.BLUE.KEY,
        allowMultiple: false,
        options: [...Array(3)].map((__, index) =>
            Option.getDefaultProperties(index),
        ),
    });

    supportsComments() {
        return false;
    }

    seed() {
        const defaultValues = this.constructor.getDefaultProperties();

        // These have to be seeded too since the connect function relies
        // on these being set on the record for first render
        Object.keys(defaultValues).forEach(key => {
            this.set(key, defaultValues[key]);
        });
    }

    addOption() {
        const options = this.getOptions();
        const last = options[options.length - 1];
        const isMatch =
            last &&
            matchDefaultOptionText(
                last
                    .getRichTextRecord()
                    .getTextContent()
                    .trim(),
            );
        const lastIndex = isMatch ? parseInt(isMatch) : options.length;

        this.get("options").add(Option.getDefaultProperties(lastIndex));
        quip.apps.recordQuipMetric("add_option");
        //quip.apps.sendMessage("added an option");
    }

    getOptions() {
        return this.get("options").getRecords();
    }

    setAllowMultiple(value) {
        this.set("allowMultiple", value);
    }

    currentUserHasVoted() {
        const user = quip.apps.getViewingUser();
        if (!user) {
            return false;
        }

        const findUserVote = option =>
            option
                .get("votes")
                .getRecords()
                .find(vote => vote.get("user") === user.getId());

        const found = this.getOptions().find(findUserVote);
        return Boolean(found);
    }

    getTotalVotes() {
        return this.getOptions().reduce(
            (acc, option) => acc + option.getVotesCount(),
            0,
        );
    }
}

class Option extends ListenerRecord {
    static CONSTRUCTOR_KEY = "option";
    static DATA_VERSION = 2;

    static getProperties = () => ({
        votes: quip.apps.RecordList.Type(Vote),
        text: quip.apps.RichTextRecord,
        createdAt: "number",
    });

    static getDefaultProperties = lastIndex => ({
        votes: [],
        text: {
            RichText_placeholderText: "New Option",
        },
        createdAt: new Date().getTime(),
    });

    getRichTextRecord() {
        return this.get("text");
    }

    getDom() {
        return this._domNode;
    }

    setDom(node) {
        this._domNode = node;
    }

    supportsComments() {
        return true;
    }

    delete() {
        const text = this.getRichTextRecord().getTextContent();
        super.delete();
        //quip.apps.sendMessage(`removed an option: ${text}`);
    }

    vote(value, sendMessage = true) {
        const user = quip.apps.getViewingUser();
        if (!user) {
            return;
        }

        const parent = this.getParentRecord();
        const currentVote = this.getCurrentVote();
        const allowMultiple = parent.get("allowMultiple");
        const rtr = this.getRichTextRecord();
        const text = rtr.getTextContent();
        if (value && !currentVote) {
            this.get("votes").add({
                user: user.getId(),
                multiple: allowMultiple,
            });
            if (!allowMultiple) {
                this.removeOtherOptionVotes();
            }
        } else if (!value && currentVote) {
            currentVote.delete();
        }

        if (!rtr.empty() && sendMessage) {
            if (allowMultiple) {
                quip.apps.sendMessage(`voted for ${text}`);
            } else {
                const hasVoted = parent.currentUserHasVoted();
                if (hasVoted) {
                    quip.apps.sendMessage(`changed their vote to ${text}`);
                } else {
                    quip.apps.sendMessage(`voted for ${text}`);
                }
            }
        }
        quip.apps.recordQuipMetric("voted");
    }

    removeOtherOptionVotes() {
        const parent = this.getParentRecord();

        parent.getOptions().forEach(option => {
            if (option !== this) {
                option.vote(false, false);
            }
        });
    }

    isVoted() {
        return !!this.getCurrentVote();
    }

    getVotesCount() {
        const isMultiple = this.getParentRecord().get("allowMultiple");
        const votes = this.get("votes");

        if (this.isDeleted() || !votes) return 0;

        return votes
            .getRecords()
            .filter(vote => vote.get("multiple") === isMultiple).length;
    }

    clearVotes() {
        this.clear("votes");
    }

    getCurrentVote() {
        const user = quip.apps.getViewingUser();
        if (!user) {
            return null;
        }

        const parent = this.getParentRecord();
        const isMultiple = parent.get("allowMultiple");

        return this.get("votes")
            .getRecords()
            .filter(vote => vote.get("multiple") === isMultiple)
            .find(vote => vote.get("user") === user.getId());
    }
}

class Vote extends ListenerRecord {
    static CONSTRUCTOR_KEY = "vote";
    static DATA_VERSION = 2;

    static getProperties = () => ({
        user: "string",
        multiple: "boolean",
    });
}

export default () => {
    const classes = [Root, Option, Vote];
    classes.forEach(c => quip.apps.registerClass(c, c.CONSTRUCTOR_KEY));
};
