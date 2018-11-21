// Copyright 2017 Quip

export default class PlaceholderData {
    static schema = {
        fields: {
            "key": {
                "label": quiptext("Key"),
                "dataType": "String",
            },
            "issuetype": {
                "label": quiptext("Issue Type"),
                "dataType": "Picklist",
                "updateable": true,
            },
            "summary": {
                "label": quiptext("Summary"),
                "dataType": "String",
                "updateable": true,
            },
            "priority": {
                "label": quiptext("Priority"),
                "dataType": "Picklist",
                "updateable": true,
            },
            "status": {
                "label": quiptext("Status"),
                "dataType": "Picklist",
                "updateable": true,
            },
        },
    };

    static records = [
        {
            recordId: "1",
            fieldsData: {
                "fields": {
                    "key": {
                        "value": "TES-22",
                    },
                    "issuetype": {
                        "value": quiptext("Task"),
                    },
                    "summary": {
                        "value": quiptext("Add task status as an option"),
                    },
                    "priority": {
                        "value": quiptext("Highest [priority]"),
                    },
                    "status": {
                        "value": quiptext("To Do"),
                    },
                },
            },
        },
        {
            recordId: "2",
            fieldsData: {
                "fields": {
                    "key": {
                        "value": "TES-28",
                    },
                    "issuetype": {
                        "value": quiptext("Task"),
                    },
                    "summary": {
                        "value": quiptext("Make task status draggable"),
                    },
                    "priority": {
                        "value": quiptext("High [priority]"),
                    },
                    "status": {
                        "value": quiptext("To Do"),
                    },
                },
            },
        },
        {
            recordId: "3",
            fieldsData: {
                "fields": {
                    "key": {
                        "value": "TES-31",
                    },
                    "issuetype": {
                        "value": quiptext("Bug [issue]"),
                    },
                    "summary": {
                        "value": quiptext("Task status is not draggable"),
                    },
                    "priority": {
                        "value": quiptext("Medium [priority]"),
                    },
                    "status": {
                        "value": quiptext("In Progress"),
                    },
                },
            },
        },
        {
            recordId: "4",
            fieldsData: {
                "fields": {
                    "key": {
                        "value": "TES-34",
                    },
                    "issuetype": {
                        "value": quiptext("Story"),
                    },
                    "summary": {
                        "value": quiptext(
                            "As a user, I can update task status with drag and drop"),
                    },
                    "priority": {
                        "value": quiptext("Medium [priority]"),
                    },
                    "status": {
                        "value": quiptext("In Progress"),
                    },
                },
            },
        },
    ];
}
