// Copyright 2019 Quip

/**
 * @fileoverview raw response from /services/data/v46.0/ui-api/list-ui/00B2E00000B0l96UAB
 */

export default {
    "eTag": "42cde0b7b24a0b40630260aadbc21aa9",
    "info": {
        "cloneable": true,
        "createable": true,
        "deletable": true,
        "displayColumns": [
            {
                "fieldApiName": "Name",
                "label": "Opportunity Name",
                "sortable": true,
            },
            {
                "fieldApiName": "Account.Name",
                "label": "Account Name",
                "sortable": true,
            },
            {
                "fieldApiName": "Amount",
                "label": "Amount",
                "sortable": true,
            },
            {
                "fieldApiName": "CloseDate",
                "label": "Close Date",
                "sortable": true,
            },
            {
                "fieldApiName": "StageName",
                "label": "Stage",
                "sortable": true,
            },
        ],
        "eTag": "ca8e4a0491dcbc663f307301134e86a1",
        "filterLogicString": null,
        "filteredByInfo": [
            {
                "fieldApiName": "IsClosed",
                "label": "Closed",
                "operandLabels": ["1"],
                "operator": "Equals" as const,
            },
            {
                "fieldApiName": "IsWon",
                "label": "Won",
                "operandLabels": ["1"],
                "operator": "Equals" as const,
            },
        ],
        "label": "Won",
        "listReference": {
            "id": "00B2E00000B0l96UAB",
            "listViewApiName": "Won",
            "objectApiName": "Opportunity",
            "type": "listView",
        },
        "orderedByInfo": [
            {
                "fieldApiName": "Name",
                "isAscending": true,
                "label": "Opportunity Name",
            },
        ],
        "updateable": true,
        "userPreferences": {
            "columnWidths": {
                "StageName": -1,
                "Amount": -1,
                "Account.Name": -1,
                "CloseDate": -1,
                "Name": -1,
            },
            "columnWrap": {
                "StageName": false,
                "Amount": false,
                "Account.Name": false,
                "CloseDate": false,
                "Name": false,
            },
        },
        "visibility": "Public" as const,
        "visibilityEditable": true,
    },
    "records": {
        "count": 18,
        "currentPageToken": "0",
        "currentPageUrl":
            "/services/data/v46.0/ui-api/list-records/00B2E00000B0l96UAB?pageSize=50&pageToken=0",
        "listInfoETag": "ca8e4a0491dcbc663f307301134e86a1",
        "nextPageToken": null,
        "nextPageUrl": null,
        "previousPageToken": null,
        "previousPageUrl": null,
        "records": [
            {
                "apiName": "Opportunity",
                "childRelationships": {},
                "eTag": "98cbd04897236e687f7a1a26a147c984",
                "fields": {
                    "Account": {
                        "displayValue": "Burlington Textiles Corp of America",
                        "value": {
                            "apiName": "Account",
                            "childRelationships": {},
                            "eTag": "04ef29b4b9d75b5c7a98f5afd9f707de",
                            "fields": {
                                "CreatedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Id": {
                                    "displayValue": null,
                                    "value": "0012E00001oNAwUQAW",
                                },
                                "LastModifiedById": {
                                    "displayValue": null,
                                    "value": "0052E00000IAnFVQA1",
                                },
                                "LastModifiedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Name": {
                                    "displayValue": null,
                                    "value":
                                        "Burlington Textiles Corp of America",
                                },
                                "SystemModstamp": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                            },
                            "id": "0012E00001oNAwUQAW",
                            "lastModifiedById": "0052E00000IAnFVQA1",
                            "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                            "recordTypeInfo": null,
                            "systemModstamp": "2019-04-09T01:00:25.000Z",
                        },
                    },
                    "AccountId": {
                        "displayValue": null,
                        "value": "0012E00001oNAwUQAW",
                    },
                    "Amount": {
                        "displayValue": "$235,000.00",
                        "value": 235000.0,
                    },
                    "CloseDate": {
                        "displayValue": "2/8/2019",
                        "value": "2019-02-08",
                    },
                    "CreatedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Id": {
                        "displayValue": null,
                        "value": "0062E00001D6mz0QAB",
                    },
                    "LastModifiedById": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "LastModifiedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Name": {
                        "displayValue": null,
                        "value": "Burlington Textiles Weaving Plant Generator",
                    },
                    "OwnerId": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "StageName": {
                        "displayValue": "Closed Won",
                        "value": "Closed Won",
                    },
                    "SystemModstamp": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                },
                "id": "0062E00001D6mz0QAB",
                "lastModifiedById": "0052E00000IAnFVQA1",
                "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                "recordTypeInfo": null,
                "systemModstamp": "2019-04-09T01:00:25.000Z",
            },
            {
                "apiName": "Opportunity",
                "childRelationships": {},
                "eTag": "8e4491bc41929edaf68c695111202803",
                "fields": {
                    "Account": {
                        "displayValue": "Edge Communications",
                        "value": {
                            "apiName": "Account",
                            "childRelationships": {},
                            "eTag": "6400f929eca1122d5e1f851f11c1af52",
                            "fields": {
                                "CreatedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Id": {
                                    "displayValue": null,
                                    "value": "0012E00001oNAwTQAW",
                                },
                                "LastModifiedById": {
                                    "displayValue": null,
                                    "value": "0052E00000IAnFVQA1",
                                },
                                "LastModifiedDate": {
                                    "displayValue": null,
                                    "value": "2019-07-17T23:31:20.000Z",
                                },
                                "Name": {
                                    "displayValue": null,
                                    "value": "Edge Communications",
                                },
                                "SystemModstamp": {
                                    "displayValue": null,
                                    "value": "2019-07-17T23:31:20.000Z",
                                },
                            },
                            "id": "0012E00001oNAwTQAW",
                            "lastModifiedById": "0052E00000IAnFVQA1",
                            "lastModifiedDate": "2019-07-17T23:31:20.000Z",
                            "recordTypeInfo": null,
                            "systemModstamp": "2019-07-17T23:31:20.000Z",
                        },
                    },
                    "AccountId": {
                        "displayValue": null,
                        "value": "0012E00001oNAwTQAW",
                    },
                    "Amount": {
                        "displayValue": "$75,000.00",
                        "value": 75000.0,
                    },
                    "CloseDate": {
                        "displayValue": "4/4/2019",
                        "value": "2019-04-04",
                    },
                    "CreatedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Id": {
                        "displayValue": null,
                        "value": "0062E00001D6mylQAB",
                    },
                    "LastModifiedById": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "LastModifiedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Name": {
                        "displayValue": null,
                        "value": "Edge Emergency Generator",
                    },
                    "OwnerId": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "StageName": {
                        "displayValue": "Closed Won",
                        "value": "Closed Won",
                    },
                    "SystemModstamp": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                },
                "id": "0062E00001D6mylQAB",
                "lastModifiedById": "0052E00000IAnFVQA1",
                "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                "recordTypeInfo": null,
                "systemModstamp": "2019-04-09T01:00:25.000Z",
            },
            {
                "apiName": "Opportunity",
                "childRelationships": {},
                "eTag": "75893356e1a1842085ff9bb8a89becd8",
                "fields": {
                    "Account": {
                        "displayValue": "Edge Communications",
                        "value": {
                            "apiName": "Account",
                            "childRelationships": {},
                            "eTag": "6400f929eca1122d5e1f851f11c1af52",
                            "fields": {
                                "CreatedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Id": {
                                    "displayValue": null,
                                    "value": "0012E00001oNAwTQAW",
                                },
                                "LastModifiedById": {
                                    "displayValue": null,
                                    "value": "0052E00000IAnFVQA1",
                                },
                                "LastModifiedDate": {
                                    "displayValue": null,
                                    "value": "2019-07-17T23:31:20.000Z",
                                },
                                "Name": {
                                    "displayValue": null,
                                    "value": "Edge Communications",
                                },
                                "SystemModstamp": {
                                    "displayValue": null,
                                    "value": "2019-07-17T23:31:20.000Z",
                                },
                            },
                            "id": "0012E00001oNAwTQAW",
                            "lastModifiedById": "0052E00000IAnFVQA1",
                            "lastModifiedDate": "2019-07-17T23:31:20.000Z",
                            "recordTypeInfo": null,
                            "systemModstamp": "2019-07-17T23:31:20.000Z",
                        },
                    },
                    "AccountId": {
                        "displayValue": null,
                        "value": "0012E00001oNAwTQAW",
                    },
                    "Amount": {
                        "displayValue": "$50,000.00",
                        "value": 50000.0,
                    },
                    "CloseDate": {
                        "displayValue": "1/24/2019",
                        "value": "2019-01-24",
                    },
                    "CreatedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Id": {
                        "displayValue": null,
                        "value": "0062E00001D6mysQAB",
                    },
                    "LastModifiedById": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "LastModifiedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Name": {
                        "displayValue": null,
                        "value": "Edge Installation",
                    },
                    "OwnerId": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "StageName": {
                        "displayValue": "Closed Won",
                        "value": "Closed Won",
                    },
                    "SystemModstamp": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                },
                "id": "0062E00001D6mysQAB",
                "lastModifiedById": "0052E00000IAnFVQA1",
                "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                "recordTypeInfo": null,
                "systemModstamp": "2019-04-09T01:00:25.000Z",
            },
            {
                "apiName": "Opportunity",
                "childRelationships": {},
                "eTag": "f6497736c1bff86d63d989a500636cc5",
                "fields": {
                    "Account": {
                        "displayValue": "Edge Communications",
                        "value": {
                            "apiName": "Account",
                            "childRelationships": {},
                            "eTag": "6400f929eca1122d5e1f851f11c1af52",
                            "fields": {
                                "CreatedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Id": {
                                    "displayValue": null,
                                    "value": "0012E00001oNAwTQAW",
                                },
                                "LastModifiedById": {
                                    "displayValue": null,
                                    "value": "0052E00000IAnFVQA1",
                                },
                                "LastModifiedDate": {
                                    "displayValue": null,
                                    "value": "2019-07-17T23:31:20.000Z",
                                },
                                "Name": {
                                    "displayValue": null,
                                    "value": "Edge Communications",
                                },
                                "SystemModstamp": {
                                    "displayValue": null,
                                    "value": "2019-07-17T23:31:20.000Z",
                                },
                            },
                            "id": "0012E00001oNAwTQAW",
                            "lastModifiedById": "0052E00000IAnFVQA1",
                            "lastModifiedDate": "2019-07-17T23:31:20.000Z",
                            "recordTypeInfo": null,
                            "systemModstamp": "2019-07-17T23:31:20.000Z",
                        },
                    },
                    "AccountId": {
                        "displayValue": null,
                        "value": "0012E00001oNAwTQAW",
                    },
                    "Amount": {
                        "displayValue": "$60,000.00",
                        "value": 60000.0,
                    },
                    "CloseDate": {
                        "displayValue": "12/20/2018",
                        "value": "2018-12-20",
                    },
                    "CreatedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Id": {
                        "displayValue": null,
                        "value": "0062E00001D6mytQAB",
                    },
                    "LastModifiedById": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "LastModifiedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Name": {
                        "displayValue": null,
                        "value": "Edge SLA",
                    },
                    "OwnerId": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "StageName": {
                        "displayValue": "Closed Won",
                        "value": "Closed Won",
                    },
                    "SystemModstamp": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                },
                "id": "0062E00001D6mytQAB",
                "lastModifiedById": "0052E00000IAnFVQA1",
                "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                "recordTypeInfo": null,
                "systemModstamp": "2019-04-09T01:00:25.000Z",
            },
            {
                "apiName": "Opportunity",
                "childRelationships": {},
                "eTag": "402cd558598a53ea1ba5c170c8f9bbc1",
                "fields": {
                    "Account": {
                        "displayValue": "Express Logistics and Transport",
                        "value": {
                            "apiName": "Account",
                            "childRelationships": {},
                            "eTag": "b3828d2f99d077d57e77ea1f73a4543b",
                            "fields": {
                                "CreatedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Id": {
                                    "displayValue": null,
                                    "value": "0012E00001oNAwZQAW",
                                },
                                "LastModifiedById": {
                                    "displayValue": null,
                                    "value": "0052E00000IAnFVQA1",
                                },
                                "LastModifiedDate": {
                                    "displayValue": null,
                                    "value": "2019-06-27T20:20:58.000Z",
                                },
                                "Name": {
                                    "displayValue": null,
                                    "value": "Express Logistics and Transport",
                                },
                                "SystemModstamp": {
                                    "displayValue": null,
                                    "value": "2019-06-27T20:20:58.000Z",
                                },
                            },
                            "id": "0012E00001oNAwZQAW",
                            "lastModifiedById": "0052E00000IAnFVQA1",
                            "lastModifiedDate": "2019-06-27T20:20:58.000Z",
                            "recordTypeInfo": null,
                            "systemModstamp": "2019-06-27T20:20:58.000Z",
                        },
                    },
                    "AccountId": {
                        "displayValue": null,
                        "value": "0012E00001oNAwZQAW",
                    },
                    "Amount": {
                        "displayValue": "$220,000.00",
                        "value": 220000.0,
                    },
                    "CloseDate": {
                        "displayValue": "12/30/2018",
                        "value": "2018-12-30",
                    },
                    "CreatedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Id": {
                        "displayValue": null,
                        "value": "0062E00001D6myfQAB",
                    },
                    "LastModifiedById": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "LastModifiedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Name": {
                        "displayValue": null,
                        "value": "Express Logistics Standby Generator",
                    },
                    "OwnerId": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "StageName": {
                        "displayValue": "Closed Won",
                        "value": "Closed Won",
                    },
                    "SystemModstamp": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                },
                "id": "0062E00001D6myfQAB",
                "lastModifiedById": "0052E00000IAnFVQA1",
                "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                "recordTypeInfo": null,
                "systemModstamp": "2019-04-09T01:00:25.000Z",
            },
            {
                "apiName": "Opportunity",
                "childRelationships": {},
                "eTag": "08efe20414d3d18a5d0919ef8e418d89",
                "fields": {
                    "Account": {
                        "displayValue": "GenePoint",
                        "value": {
                            "apiName": "Account",
                            "childRelationships": {},
                            "eTag": "31503df0eb353d2de801cbceec48e071",
                            "fields": {
                                "CreatedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Id": {
                                    "displayValue": null,
                                    "value": "0012E00001oNAwdQAG",
                                },
                                "LastModifiedById": {
                                    "displayValue": null,
                                    "value": "0052E00000IAnFVQA1",
                                },
                                "LastModifiedDate": {
                                    "displayValue": null,
                                    "value": "2019-07-09T17:43:41.000Z",
                                },
                                "Name": {
                                    "displayValue": null,
                                    "value": "GenePoint",
                                },
                                "SystemModstamp": {
                                    "displayValue": null,
                                    "value": "2019-07-09T17:43:41.000Z",
                                },
                            },
                            "id": "0012E00001oNAwdQAG",
                            "lastModifiedById": "0052E00000IAnFVQA1",
                            "lastModifiedDate": "2019-07-09T17:43:41.000Z",
                            "recordTypeInfo": null,
                            "systemModstamp": "2019-07-09T17:43:41.000Z",
                        },
                    },
                    "AccountId": {
                        "displayValue": null,
                        "value": "0012E00001oNAwdQAG",
                    },
                    "Amount": {
                        "displayValue": "$30,000.00",
                        "value": 30000.0,
                    },
                    "CloseDate": {
                        "displayValue": "4/1/2019",
                        "value": "2019-04-01",
                    },
                    "CreatedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Id": {
                        "displayValue": null,
                        "value": "0062E00001D6myqQAB",
                    },
                    "LastModifiedById": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "LastModifiedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Name": {
                        "displayValue": null,
                        "value": "GenePoint SLA",
                    },
                    "OwnerId": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "StageName": {
                        "displayValue": "Closed Won",
                        "value": "Closed Won",
                    },
                    "SystemModstamp": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                },
                "id": "0062E00001D6myqQAB",
                "lastModifiedById": "0052E00000IAnFVQA1",
                "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                "recordTypeInfo": null,
                "systemModstamp": "2019-04-09T01:00:25.000Z",
            },
            {
                "apiName": "Opportunity",
                "childRelationships": {},
                "eTag": "29856b73d32cc0ecd4066416748d9256",
                "fields": {
                    "Account": {
                        "displayValue": "GenePoint",
                        "value": {
                            "apiName": "Account",
                            "childRelationships": {},
                            "eTag": "31503df0eb353d2de801cbceec48e071",
                            "fields": {
                                "CreatedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Id": {
                                    "displayValue": null,
                                    "value": "0012E00001oNAwdQAG",
                                },
                                "LastModifiedById": {
                                    "displayValue": null,
                                    "value": "0052E00000IAnFVQA1",
                                },
                                "LastModifiedDate": {
                                    "displayValue": null,
                                    "value": "2019-07-09T17:43:41.000Z",
                                },
                                "Name": {
                                    "displayValue": null,
                                    "value": "GenePoint",
                                },
                                "SystemModstamp": {
                                    "displayValue": null,
                                    "value": "2019-07-09T17:43:41.000Z",
                                },
                            },
                            "id": "0012E00001oNAwdQAG",
                            "lastModifiedById": "0052E00000IAnFVQA1",
                            "lastModifiedDate": "2019-07-09T17:43:41.000Z",
                            "recordTypeInfo": null,
                            "systemModstamp": "2019-07-09T17:43:41.000Z",
                        },
                    },
                    "AccountId": {
                        "displayValue": null,
                        "value": "0012E00001oNAwdQAG",
                    },
                    "Amount": {
                        "displayValue": "$85,000.00",
                        "value": 85000.0,
                    },
                    "CloseDate": {
                        "displayValue": "2/6/2019",
                        "value": "2019-02-06",
                    },
                    "CreatedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Id": {
                        "displayValue": null,
                        "value": "0062E00001D6mygQAB",
                    },
                    "LastModifiedById": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "LastModifiedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Name": {
                        "displayValue": null,
                        "value": "GenePoint Standby Generator",
                    },
                    "OwnerId": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "StageName": {
                        "displayValue": "Closed Won",
                        "value": "Closed Won",
                    },
                    "SystemModstamp": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                },
                "id": "0062E00001D6mygQAB",
                "lastModifiedById": "0052E00000IAnFVQA1",
                "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                "recordTypeInfo": null,
                "systemModstamp": "2019-04-09T01:00:25.000Z",
            },
            {
                "apiName": "Opportunity",
                "childRelationships": {},
                "eTag": "6b8c82330b192026a5ea4a85079bdaa9",
                "fields": {
                    "Account": {
                        "displayValue": "Grand Hotels &amp; Resorts Ltd",
                        "value": {
                            "apiName": "Account",
                            "childRelationships": {},
                            "eTag": "096170a32ff42e20e926480535582388",
                            "fields": {
                                "CreatedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Id": {
                                    "displayValue": null,
                                    "value": "0012E00001oNAwXQAW",
                                },
                                "LastModifiedById": {
                                    "displayValue": null,
                                    "value": "0052E00000IAnFVQA1",
                                },
                                "LastModifiedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Name": {
                                    "displayValue": null,
                                    "value": "Grand Hotels &amp; Resorts Ltd",
                                },
                                "SystemModstamp": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                            },
                            "id": "0012E00001oNAwXQAW",
                            "lastModifiedById": "0052E00000IAnFVQA1",
                            "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                            "recordTypeInfo": null,
                            "systemModstamp": "2019-04-09T01:00:25.000Z",
                        },
                    },
                    "AccountId": {
                        "displayValue": null,
                        "value": "0012E00001oNAwXQAW",
                    },
                    "Amount": {
                        "displayValue": "$210,000.00",
                        "value": 210000.0,
                    },
                    "CloseDate": {
                        "displayValue": "3/16/2019",
                        "value": "2019-03-16",
                    },
                    "CreatedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Id": {
                        "displayValue": null,
                        "value": "0062E00001D6mz5QAB",
                    },
                    "LastModifiedById": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "LastModifiedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Name": {
                        "displayValue": null,
                        "value": "Grand Hotels Emergency Generators",
                    },
                    "OwnerId": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "StageName": {
                        "displayValue": "Closed Won",
                        "value": "Closed Won",
                    },
                    "SystemModstamp": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                },
                "id": "0062E00001D6mz5QAB",
                "lastModifiedById": "0052E00000IAnFVQA1",
                "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                "recordTypeInfo": null,
                "systemModstamp": "2019-04-09T01:00:25.000Z",
            },
            {
                "apiName": "Opportunity",
                "childRelationships": {},
                "eTag": "a3541e9ddc26f7d66db6fa26212b9657",
                "fields": {
                    "Account": {
                        "displayValue": "Grand Hotels &amp; Resorts Ltd",
                        "value": {
                            "apiName": "Account",
                            "childRelationships": {},
                            "eTag": "096170a32ff42e20e926480535582388",
                            "fields": {
                                "CreatedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Id": {
                                    "displayValue": null,
                                    "value": "0012E00001oNAwXQAW",
                                },
                                "LastModifiedById": {
                                    "displayValue": null,
                                    "value": "0052E00000IAnFVQA1",
                                },
                                "LastModifiedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Name": {
                                    "displayValue": null,
                                    "value": "Grand Hotels &amp; Resorts Ltd",
                                },
                                "SystemModstamp": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                            },
                            "id": "0012E00001oNAwXQAW",
                            "lastModifiedById": "0052E00000IAnFVQA1",
                            "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                            "recordTypeInfo": null,
                            "systemModstamp": "2019-04-09T01:00:25.000Z",
                        },
                    },
                    "AccountId": {
                        "displayValue": null,
                        "value": "0012E00001oNAwXQAW",
                    },
                    "Amount": {
                        "displayValue": "$350,000.00",
                        "value": 350000.0,
                    },
                    "CloseDate": {
                        "displayValue": "3/18/2019",
                        "value": "2019-03-18",
                    },
                    "CreatedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Id": {
                        "displayValue": null,
                        "value": "0062E00001D6myvQAB",
                    },
                    "LastModifiedById": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "LastModifiedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Name": {
                        "displayValue": null,
                        "value": "Grand Hotels Generator Installations",
                    },
                    "OwnerId": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "StageName": {
                        "displayValue": "Closed Won",
                        "value": "Closed Won",
                    },
                    "SystemModstamp": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                },
                "id": "0062E00001D6myvQAB",
                "lastModifiedById": "0052E00000IAnFVQA1",
                "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                "recordTypeInfo": null,
                "systemModstamp": "2019-04-09T01:00:25.000Z",
            },
            {
                "apiName": "Opportunity",
                "childRelationships": {},
                "eTag": "86ed5f50f64ef74c80bd67214be26306",
                "fields": {
                    "Account": {
                        "displayValue": "Grand Hotels &amp; Resorts Ltd",
                        "value": {
                            "apiName": "Account",
                            "childRelationships": {},
                            "eTag": "096170a32ff42e20e926480535582388",
                            "fields": {
                                "CreatedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Id": {
                                    "displayValue": null,
                                    "value": "0012E00001oNAwXQAW",
                                },
                                "LastModifiedById": {
                                    "displayValue": null,
                                    "value": "0052E00000IAnFVQA1",
                                },
                                "LastModifiedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Name": {
                                    "displayValue": null,
                                    "value": "Grand Hotels &amp; Resorts Ltd",
                                },
                                "SystemModstamp": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                            },
                            "id": "0012E00001oNAwXQAW",
                            "lastModifiedById": "0052E00000IAnFVQA1",
                            "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                            "recordTypeInfo": null,
                            "systemModstamp": "2019-04-09T01:00:25.000Z",
                        },
                    },
                    "AccountId": {
                        "displayValue": null,
                        "value": "0012E00001oNAwXQAW",
                    },
                    "Amount": {
                        "displayValue": "$90,000.00",
                        "value": 90000.0,
                    },
                    "CloseDate": {
                        "displayValue": "12/27/2018",
                        "value": "2018-12-27",
                    },
                    "CreatedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Id": {
                        "displayValue": null,
                        "value": "0062E00001D6mz3QAB",
                    },
                    "LastModifiedById": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "LastModifiedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Name": {
                        "displayValue": null,
                        "value": "Grand Hotels SLA",
                    },
                    "OwnerId": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "StageName": {
                        "displayValue": "Closed Won",
                        "value": "Closed Won",
                    },
                    "SystemModstamp": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                },
                "id": "0062E00001D6mz3QAB",
                "lastModifiedById": "0052E00000IAnFVQA1",
                "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                "recordTypeInfo": null,
                "systemModstamp": "2019-04-09T01:00:25.000Z",
            },
            {
                "apiName": "Opportunity",
                "childRelationships": {},
                "eTag": "2d6f97243bf3258baf52a0cb0ef6bde1",
                "fields": {
                    "Account": {
                        "displayValue": "United Oil &amp; Gas Corp.",
                        "value": {
                            "apiName": "Account",
                            "childRelationships": {},
                            "eTag": "385a8bb186a59c47080ccd3bfc74d1fd",
                            "fields": {
                                "CreatedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Id": {
                                    "displayValue": null,
                                    "value": "0012E00001oNAwYQAW",
                                },
                                "LastModifiedById": {
                                    "displayValue": null,
                                    "value": "0052E00000IAnFVQA1",
                                },
                                "LastModifiedDate": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                                "Name": {
                                    "displayValue": null,
                                    "value": "United Oil &amp; Gas Corp.",
                                },
                                "SystemModstamp": {
                                    "displayValue": null,
                                    "value": "2019-04-09T01:00:25.000Z",
                                },
                            },
                            "id": "0012E00001oNAwYQAW",
                            "lastModifiedById": "0052E00000IAnFVQA1",
                            "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                            "recordTypeInfo": null,
                            "systemModstamp": "2019-04-09T01:00:25.000Z",
                        },
                    },
                    "AccountId": {
                        "displayValue": null,
                        "value": "0012E00001oNAwYQAW",
                    },
                    "Amount": {
                        "displayValue": "$440,000.00",
                        "value": 440000.0,
                    },
                    "CloseDate": {
                        "displayValue": "1/23/2019",
                        "value": "2019-01-23",
                    },
                    "CreatedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Id": {
                        "displayValue": null,
                        "value": "0062E00001D6mz2QAB",
                    },
                    "LastModifiedById": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "LastModifiedDate": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                    "Name": {
                        "displayValue": null,
                        "value": "United Oil Emergency Generators",
                    },
                    "OwnerId": {
                        "displayValue": null,
                        "value": "0052E00000IAnFVQA1",
                    },
                    "StageName": {
                        "displayValue": "Closed Won",
                        "value": "Closed Won",
                    },
                    "SystemModstamp": {
                        "displayValue": null,
                        "value": "2019-04-09T01:00:25.000Z",
                    },
                },
                "id": "0062E00001D6mz2QAB",
                "lastModifiedById": "0052E00000IAnFVQA1",
                "lastModifiedDate": "2019-04-09T01:00:25.000Z",
                "recordTypeInfo": null,
                "systemModstamp": "2019-04-09T01:00:25.000Z",
            },
        ],
    },
};
