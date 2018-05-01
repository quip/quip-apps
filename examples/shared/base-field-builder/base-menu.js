// Copyright 2017 Quip

import moment from "moment";

/**
 * Base class shared between the Field Builder and Jira element. Used to handle
 * menus.
 */
export class BaseMenu {
    allMenuCommands() {
        throw Error("Unimplemented abstract method.");
    }

    showFieldContextMenu(e, button, fieldEntity, onDismiss) {
        throw Error("Unimplemented abstract method.");
    }

    showRecordPickerContextMenu(e, button, commands, onDismiss) {
        throw Error("Unimplemented abstract method.");
    }

    refreshToolbar() {
        throw Error("Unimplemented abstract method.");
    }

    updateToolbar(recordEntity) {
        throw Error("Unimplemented abstract method.");
    }

    static getSyncingString(recordEntity) {
        const isDirty = !recordEntity || recordEntity.isDirty();
        let syncingLabel;
        if (recordEntity && recordEntity.saveInProgress()) {
            syncingLabel = quiptext("Saving…");
        } else if (!isDirty) {
            syncingLabel = this.getLastUpdatedString(recordEntity);
        } else {
            syncingLabel = quiptext("Save to %(source)s", {
                "source": recordEntity.getSource(),
            });
        }
        return syncingLabel;
    }

    static getLastUpdatedString(recordEntity) {
        return this.getLastUpdatedStringFromTime(
            recordEntity.getLastFetchedTime());
    }

    static getLastUpdatedStringFromTime(time) {
        const lastFetchedTime = moment(time);
        let format = "MM/D, h:mm A";
        const yesterday = moment()
            .subtract(1, "day")
            .endOf("day");
        if (lastFetchedTime > yesterday) {
            format = "h:mm A";
        }
        return quiptext("Last Updated %(time)s", {
            "time": lastFetchedTime.format(format),
        });
    }
}
