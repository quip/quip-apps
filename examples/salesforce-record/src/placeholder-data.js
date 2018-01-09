// Copyright 2017 Quip

export default class PlaceholderData {
    static recordId = "001000000000000000";
    static type = "Account";
    static schema = {
        "fields": {
            "Employees": {
                "label": "Employees",
                "dataType": "String",
                "updateable": true,
            },
            "Industry": {
                "label": "Industry",
                "dataType": "String",
                "updateable": true,
            },
            "Name": {
                "label": "Account Name",
                "dataType": "String",
                "updateable": true,
            },
            "TotalSales": {
                "label": "Total Sales",
                "dataType": "String",
                "updateable": true,
            },
            "Type": {
                "label": "Type",
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
                "value": "Technology",
            },
            "TotalSales": {
                "value": "$80,000.00",
            },
            "Type": {
                "value": "Mid-Market",
            },
        },
    };

    static fieldsOrder = ["Type", "Industry", "Employees", "TotalSales"];
}
