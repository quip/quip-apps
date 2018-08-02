// Copyright 2017 Quip

export default class PlaceholderData {
    static recordId = "001000000000000000";
    static schema = {
        "apiName": "Account",
        "label": "Account",
        "labelPlural": "Accounts",
        "nameFields": ["Name"],
        "fields": {
            "Employees": {
                "label": quiptext("Employees"),
                "dataType": "String",
                "updateable": true,
            },
            "Industry": {
                "label": quiptext("Industry"),
                "dataType": "String",
                "updateable": true,
            },
            "Name": {
                "label": quiptext("Account Name"),
                "dataType": "String",
                "updateable": true,
            },
            "TotalSales": {
                "label": quiptext("Total Sales"),
                "dataType": "String",
                "updateable": true,
            },
            "Type": {
                "label": quiptext("Type"),
                "dataType": "String",
                "updateable": true,
            },
        },
        "themeInfo": {
            "color": "7F8DE1",
        },
    };

    static fieldsData = {
        "fields": {
            "Employees": {
                "value": "450",
            },
            "Name": {
                "value": "Acme Corp Inc",
            },
            "Industry": {
                "value": quiptext("Technology"),
            },
            "TotalSales": {
                "value": "$80,000.00",
            },
            "Type": {
                "value": quiptext("Mid-Market"),
            },
        },
    };

    static fieldsOrder = ["Type", "Industry", "Employees", "TotalSales"];
}
