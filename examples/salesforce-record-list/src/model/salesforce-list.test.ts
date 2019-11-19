// Copyright 2019 Quip
import {SalesforceListEntity} from "./salesforce-list";
import {
    SalesforceFieldValue,
    SalesforceRecord,
    SalesforceObject,
    SalesforceField,
    SalesforcePicklistValuesCollection,
    SalesforceListResponse,
} from "../lib/salesforce-types";
import {ColumnInfo} from "../lib/salesforce-responses";
import SalesforceResponse from "./salesforce-response";

const mockSalesforceField: SalesforceField = {
    apiName: "Foo",
    calculated: false,
    compound: false,
    compoundComponentName: "example",
    compoundFieldName: "example",
    controllerName: "example",
    controllingFields: [],
    createable: "example",
    custom: false,
    dataType: "Picklist",
    extraTypeInfo: null,
    filterable: "example",
    filteredLookupInfo: {
        controllingFields: [],
        dependent: false,
        optionalFilter: false,
    },
    highScaleNumber: false,
    htmlFormatted: false,
    inlineHelpText: "example",
    label: "example",
    length: 0,
    nameField: false,
    polymorphicForeignKey: false,
    precision: 0,
    reference: false,
    referenceTargetField: null,
    referenceToInfos: [],
    relationshipName: null,
    required: false,
    searchPrefilterable: false,
    scale: 0,
    sortable: false,
    unique: false,
    updateable: false,
};

const mockSalesforceRecord: SalesforceRecord = {
    apiName: "MockObject__c",
    childRelationships: {},
    eTag: "aaa",
    fields: {
        aControllingField: {
            value: "b",
        },
        aDependentField: {
            value: null,
        },
    },
    id: "aaa",
    lastModifiedById: "aaa",
    lastModifiedDate: "aaa",
    recordTypeInfo: {
        available: false,
        defaultRecordTypeMapping: false,
        master: false,
        name: "aaa",
        recordTypeId: "aaa",
    },
    systemModstamp: "aaa",
};

const mockSalesforceListResponse: SalesforceListResponse = {
    eTag: "aaa",
    records: {
        count: 1,
        currentPageToken: "1",
        currentPageUrl: "current page url",
        listInfoETag: "aaa",
        nextPageToken: null,
        nextPageUrl: null,
        previousPageToken: null,
        previousPageUrl: null,
        records: [{...mockSalesforceRecord}],
    },
    info: {
        cloneable: false,
        createable: false,
        deleteable: false,
        displayColumns: [
            {
                fieldApiName: "aControllingField",
                label: "Controlling Field",
                sortable: false,
            },
            {
                fieldApiName: "aDependentField",
                label: "Dependent Field",
                sortable: false,
            },
        ],
        eTag: "aaa",
        filterLogicString: "",
        filteredByInfo: [],
        label: "label",
        // undocumented
        listReference: {
            id: "aaa",
            listViewApiName: "list view api name",
            objectApiName: "object api name",
            type: "type",
        },
        orderedByInfo: [],
        updateable: false,
        userPreferences: {
            columnWidths: {},
            columnWrap: {},
        },
        visibility: "Private",
        visibilityEditable: false,
    },
};

const mockSalesforceObjectResponse: SalesforceObject = {
    apiName: "MockObject__c",
    childRelationships: [],
    createable: false,
    custom: true,
    defaultRecordTypeId: "aaa",
    deletable: false,
    dependentFields: {},
    feedEnabled: false,
    fields: {
        "aControllingField": {...mockSalesforceField},
        "aDependentField": {
            ...mockSalesforceField,
            controllingFields: ["aControllingField"],
        },
    },
    keyPrefix: "example",
    label: "example",
    labelPlural: "example",
    layoutable: false,
    mruEnabled: false,
    nameFields: [],
    queryable: false,
    recordTypeInfos: {},
    searchable: false,
    themeInfo: {color: "red", iconUrl: "foo"},
    updateable: false,
};

const mockPicklistResponse: SalesforcePicklistValuesCollection = {
    picklistFieldValues: {
        aDependentField: {
            controllerValues: {
                a: 0,
                b: 1,
            },
            defaultValue: null,
            url: "field url placeholder",
            values: [
                {
                    attributes: null,
                    label: "avail with a",
                    validFor: [0],
                    value: ":a",
                },
                {
                    attributes: null,
                    label: "avail with b",
                    validFor: [1],
                    value: ":b",
                },
            ],
        },
        aControllingField: {
            controllerValues: {},
            defaultValue: null,
            url: "field url placeholder",
            values: [
                {attributes: null, label: "A", validFor: [], value: "a"},
                {attributes: null, label: "B", validFor: [], value: "b"},
            ],
        },
    },
};

describe("Salesforce List Model", () => {
    describe("getCellData_", () => {
        let model: SalesforceListEntity,
            fieldValue: SalesforceFieldValue,
            record: SalesforceRecord,
            column: ColumnInfo;
        beforeEach(() => {
            // set up a mock model with a minimum set of fake responses
            model = new SalesforceListEntity();
            const listResponse: SalesforceResponse<
                SalesforceListResponse
            > = new SalesforceResponse();
            jest.spyOn(listResponse, "getData").mockReturnValue(
                mockSalesforceListResponse);
            jest.spyOn(model, "getResponse_").mockReturnValue(listResponse);

            const objectResponse: SalesforceResponse<
                SalesforceObject
            > = new SalesforceResponse();
            jest.spyOn(objectResponse, "getData").mockReturnValue(
                mockSalesforceObjectResponse);
            jest.spyOn(model, "getObjectResponse_").mockReturnValue(
                objectResponse);

            const picklistResponse: SalesforceResponse<
                SalesforcePicklistValuesCollection
            > = new SalesforceResponse();
            jest.spyOn(picklistResponse, "getData").mockReturnValue(
                mockPicklistResponse);
            jest.spyOn(model, "getPicklistResponse_").mockReturnValue(
                picklistResponse);

            // set up some common values
            fieldValue = {
                value: "test",
            };
            record = {...mockSalesforceRecord};
            column = {
                fieldApiName: "aDependentField",
                label: "test",
                sortable: false,
            };
        });

        afterEach(() => {
            model.resetData();
        });

        test("with dependent picklist values", () => {
            const output = model.getCellData_(fieldValue, {
                record,
                index: 0,
                column,
            });
            expect(output.schema.values).toBeDefined();
            expect(output.schema.values).toHaveLength(1);
            const expectedValue =
                mockPicklistResponse.picklistFieldValues.aDependentField
                    .values[1];
            expect(output.schema.values[0].label).toEqual(expectedValue.label);
            expect(output.schema.values[0].value).toEqual(expectedValue.value);
        });

        test("with dirty dependent picklist values", () => {
            model.updateCell(record.id, "aControllingField", "");
            const emptyOutput = model.getCellData_(fieldValue, {
                record,
                index: 0,
                column,
            });
            expect(emptyOutput.schema.values).toBeDefined();
            expect(emptyOutput.schema.values).toHaveLength(0);
            model.updateCell(record.id, "aControllingField", "a");
            const outputA = model.getCellData_(fieldValue, {
                record,
                index: 0,
                column,
            });
            console.log(outputA.schema);
            const expectedValue =
                mockPicklistResponse.picklistFieldValues.aDependentField
                    .values[0];
            expect(outputA.schema.values[0].label).toEqual(expectedValue.label);
            expect(outputA.schema.values[0].value).toEqual(expectedValue.value);
        });
    });
});
