// Copyright 2019 Quip

export interface SalesforceListResponse {
    eTag: string;
    info: SalesforceListMetadata;
    records: SalesforceRecordCollection;
}

export interface SalesforceColumn {
    fieldApiName: string;
    label: string;
    sortable: boolean;
}

export interface ObjectInfoResponse {
    objects: {
        [objectName: string]: {
            apiName: string;
            keyPrefix: string;
            label: string;
            labelPlural: string;
            nameFields: string[];
            objectInfoUrl: string;
        };
    };
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_list_metadata.htm#topic-title
export interface SalesforceListMetadata {
    cloneable: boolean;
    createable: boolean;
    deleteable?: boolean;
    displayColumns: SalesforceColumn[];
    eTag: string;
    filterLogicString: string;
    filteredByInfo: ({
        fieldApiName: string;
        label: string;
        operandLabels: string[];
        operator:
            | "Contains"
            | "Equals"
            | "Excludes"
            | "GreaterOrEqual"
            | "GreaterThan"
            | "Includes"
            | "LessOrEqual"
            | "LessThan"
            | "NotContain"
            | "NotEqual"
            | "StartsWith"
            | "Within";
    })[];
    label: string;
    // undocumented
    listReference: {
        id: string;
        listViewApiName: string; // undocumented
        objectApiName: string;
        type: string;
    };
    orderedByInfo: {
        fieldApiName: string;
        isAscending: boolean;
        label: string;
    }[];
    updateable: boolean;
    userPreferences: {
        columnWidths: {
            [key: string]: number;
        };
        columnWrap: {
            [key: string]: boolean;
        };
    };
    visibility: "Private" | "Public" | "Shared";
    visibilityEditable: boolean;
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_child_relationship.htm#ui_api_responses_child_relationship
export interface SalesforceChildRelationship {
    childObjectApiName: string;
    fieldName: string;
    junctionIdListNames: string[];
    junctionReferenceTo: string[];
    relationshipName: string;
}

export interface SalesforceDependentFields {
    [fieldName: string]: SalesforceDependentFields;
}

export type SalesforceDataType =
    | "Address"
    | "Base64"
    | "Boolean"
    | "ComboBox"
    | "ComplexValue"
    | "Currency"
    | "Date"
    | "DateTime"
    | "Double"
    | "Email"
    | "EncryptedString"
    | "Int"
    | "Location"
    | "MultiPicklist"
    | "Percent"
    | "Phone"
    | "Picklist"
    | "Reference"
    | "String"
    | "TextArea"
    | "Time"
    | "Url";

export type SalesforceExtraTypeInfo =
    | "ExternalLookup"
    | "ImageUrl"
    | "IndirectLookup"
    | "PersonName"
    | "PlainTextArea"
    | "RichTextArea"
    | "SwitchablePersonName";

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_filtered_lookup_info.htm#ui_api_responses_filtered_lookup_info
export interface SalesforceFilteredLookupInfo {
    controllingFields: string[];
    dependent: boolean;
    optionalFilter: boolean;
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_field.htm#ui_api_responses_field
export interface SalesforceField {
    apiName: string;
    calculated: boolean;
    compound: boolean;
    compoundComponentName: string;
    compoundFieldName: string;
    controllerName: string;
    controllingFields: string[];
    createable: string;
    custom: boolean;
    dataType: SalesforceDataType;
    extraTypeInfo: SalesforceExtraTypeInfo;
    filterable: string;
    filteredLookupInfo: SalesforceFilteredLookupInfo;
    highScaleNumber: boolean;
    htmlFormatted: boolean;
    inlineHelpText: string;
    label: string;
    length: number;
    nameField: boolean;
    polymorphicForeignKey: boolean;
    precision: number;
    reference: boolean;
    referenceTargetField: string;
    referenceToInfos: {apiName: string; nameFields: string[]}[];
    relationshipName: string;
    required: boolean;
    searchPrefilterable: boolean;
    scale: number;
    sortable: boolean;
    unique: boolean;
    updateable: boolean;
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_object_info.htm#ui_api_responses_object_info
export interface SalesforceObject {
    apiName: string;
    childRelationships: SalesforceChildRelationship[];
    createable: boolean;
    custom: boolean;
    defaultRecordTypeId: string;
    deletable: boolean;
    dependentFields: SalesforceDependentFields;
    feedEnabled: boolean;
    fields: {[fieldName: string]: SalesforceField};
    keyPrefix: string;
    label: string;
    labelPlural: string;
    layoutable: boolean;
    mruEnabled: boolean;
    nameFields: string[];
    queryable: boolean;
    recordTypeInfos: {
        [recordId: string]: {
            available: boolean;
            defaultRecordTypeMapping: boolean;
            master: boolean;
            name: string;
            recordTypeId: string;
        };
    };
    searchable: boolean;
    themeInfo: {color: string; iconUrl: string};
    updateable: boolean;
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_field_value.htm#ui_api_responses_field_value
export interface SalesforceFieldValue {
    displayValue?: string | null;
    value: string | number | SalesforceRecord | null;
}
// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_type_info.htm#ui_api_responses_record_type_info
export interface SalesforceRecordTypeInfo {
    available: boolean;
    defaultRecordTypeMapping: boolean;
    master: boolean;
    name: string;
    recordTypeId: string;
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record.htm#ui_api_responses_record
export interface SalesforceRecord {
    apiName: string;
    childRelationships: {
        [recordId: string]: SalesforceRecordCollection;
    };
    eTag: string;
    fields: {
        [fieldName: string]: SalesforceFieldValue;
    };
    id: string;
    lastModifiedById: string;
    lastModifiedDate: string;
    recordTypeInfo: SalesforceRecordTypeInfo;
    systemModstamp: string;
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_record_collection.htm#topic-title
export interface SalesforceRecordCollection {
    count: number;
    currentPageToken: string;
    currentPageUrl: string;
    listInfoETag: string;
    nextPageToken: string | null;
    nextPageUrl: string | null;
    previousPageToken: string | null;
    previousPageUrl: string | null;
    records: SalesforceRecord[];
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_lead_status_picklist_values.htm#ui_api_responses_lead_status_picklist_values
export interface SalesforceLeadStatusPicklistValueAttributes {
    converted: boolean;
    picklistAttributesValueType: "LeadStatus";
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_opportunity_stage_picklist_values.htm#ui_api_responses_opportunity_stage_picklist_values
export interface SalesforceOpportunityStagePicklistValueAttributes {
    closed: boolean;
    defaultProbability: number;
    forecastCategoryName: string;
    picklistAttributesValueType: "OpportunityStage";
    won: boolean;
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_picklist_value.htm#ui_api_responses_picklist_value
export interface SalesforcePicklistValue {
    attributes:
        | SalesforceLeadStatusPicklistValueAttributes
        | SalesforceOpportunityStagePicklistValueAttributes
        | null;
    label: string;
    validFor: number[];
    value: string;
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_picklist_values.htm#ui_api_responses_picklist_values
export interface SalesforcePicklistValues {
    controllerValues: {
        [controllingField: string]: number;
    };
    defaultValue: SalesforcePicklistValue;
    url: string;
    values: SalesforcePicklistValue[];
}
// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_picklist_values_collection.htm
export interface SalesforcePicklistValuesCollection {
    picklistFieldValues: {
        [fieldName: string]: SalesforcePicklistValues;
    };
}
// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_page_reference.htm#ui_api_responses_page_reference
export interface SalesforcePageReference {
    attributes: Map<string, {[name: string]: string}>;
    state: Map<string, {[key: string]: string}>;
    type: string;
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_nav_item.htm#topic-title
export interface SalesforceNavigationItem {
    availableInClassic?: boolean;
    availableInLightning?: boolean;
    color?: string;
    content?: string;
    custom?: boolean;
    developerName: string;
    iconUrl?: string;
    id: string;
    itemType:
        | "CanvasConnectedApp"
        | "Connected App"
        | "Entity"
        | "Standard"
        | "TabApexPage"
        | "TabAura"
        | "TabSObject"
        | "TabWeb"
        | "FullSite"
        | "Help"
        | "Logout"
        | "UserProfile"
        | "Notification Settings"
        | "Record"
        | "ListView";
    label: string;
    objectApiName: string;
    objectLabel?: string;
    objectLabelPlural?: string;
    pageReference?: SalesforcePageReference;
    standardType:
        | "Dashboards"
        | "Events"
        | "Feeds"
        | "Groups"
        | "Home"
        | "MyDay"
        | "PendingInterviews"
        | "People"
        | "ProcessInstanceWorkitem"
        | "Reports"
        | "Tasks"
        | "Topics"
        | "News"
        | "DistributedMarketing"
        | "Forecasting"
        | "Forecasting3"
        | "ForecastingLightning"
        | "Development"
        | "AppLauncher"
        | "DataAssessmentLightning"
        | "DiscoveryForAccounts"
        | "WaveHome"
        | "WaveHomeLightning"
        | "WaveHomeLightningEacFree"
        | "B2bHome"
        | "B2bPardotCampaigns"
        | "B2bEmail"
        | "B2bMarketablePeople"
        | "B2bAutomation"
        | "B2bSocialSearch"
        | "B2bContent"
        | "B2bPardotSettings"
        | "OmniSupervisorLightning"
        | "ReactNative"
        | "LightningBoltHome"
        | "LightningInstrumentation"
        | "QUIP_INTERNAL";
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_nav_items.htm
export interface SalesforceNavigationItems {
    navItems: SalesforceNavigationItem[];
    currentPageUrl: string;
    nextPageUrl: string | null;
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_list_view_summary.htm
export interface SalesforceListViewSummary {
    apiName: string;
    id: string;
    label: string;
    listUiUrl: string;
}

// https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_responses_list_view_summary_collection.htm#ui_api_responses_list_view_summary_collection
export interface SalesforceListViewSummaryCollection {
    count: number;
    currentPageToken: string;
    currentPageUrl: string;
    lists: SalesforceListViewSummary[];
    nextPageToken: string | null;
    nextPageUrl: string | null;
    previousPageToken: string | null;
    previousPageUrl: string | null;
}
