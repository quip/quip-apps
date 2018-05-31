// Copyright 2018 Quip

/**
 * @typedef {Object} SupportedObjectConfig Declarative configuration describing
 * a supported object type.
 * @property {string} PREFIX The Salesforce ID prefix associated with the
 * object type.
 * @property {string} DISPLAY_NAME The human-readable, pluralized display name
 * of the object type.
 * @property {Array<string>} LIST_VIEWS A list of supported list views to show
 * when picking a record.
 * @property {Array<string>} DEFAULT_FIELDS The default fields to show for the
 * object type if the user has not saved their own preferences.
 * @property {=Array<string>} HEADER_FIELDS The fields to use when
 * displaying the header (this should be relatively short). The result will be
 * the values concatenated by spaces. Defaults to ["Name"].
 * @property {=string} SEARCH_FIELD The field to use when searching for or
 * displaying a search result for an object. Defaults to "Name".
 */

/** @type {Object<string, SupportedObjectConfig>} */
const SUPPORTED_OBJECT_TYPES = {
    "Account": {
        PREFIX: "001",
        DISPLAY_NAME: quiptext("Accounts"),
        LIST_VIEWS: [
            "RecentlyViewed",
            "RecentlyViewedAccounts",
            "MyAccounts",
            "NewThisWeek",
            "AllAccounts",
        ],
        DEFAULT_FIELDS: [
            "Name",
            "Combo Sector",
            "BillingCity",
            "Employees",
            "edw_num_licenses__c",
        ],
    },

    "Opportunity": {
        PREFIX: "006",
        DISPLAY_NAME: quiptext("Opportunities"),
        LIST_VIEWS: [
            "RecentlyViewed",
            "RecentlyViewedOpportunities",
            "ClosingNextMonth",
            "ClosingThisMonth",
            "MyOpportunities",
            "NewThisWeek",
            "Default_Opportunity_Pipeline",
            "Won",
            "AllOpportunities",
        ],
        DEFAULT_FIELDS: ["Name", "CloseDate"],
    },

    "Contact": {
        PREFIX: "003",
        DISPLAY_NAME: quiptext("Contacts [people]"),
        LIST_VIEWS: [
            "RecentlyViewed",
            "RecentlyViewedContacts",
            "MyContacts",
            "NewThisWeek",
            "BirthdaysThisMonth",
            "AllContacts",
        ],
        DEFAULT_FIELDS: ["Title", "FirstName", "LastName", "PhoneExtension__c"],
        HEADER_FIELDS: ["FirstName", "LastName"],
    },

    "Lead": {
        PREFIX: "00Q",
        DISPLAY_NAME: quiptext("Leads [sales]"),
        LIST_VIEWS: [
            "RecentlyViewed",
            "RecentlyViewedLeads",
            "MyUnreadLeads",
            "TodaysLeads",
            "AllOpenLeads",
        ],
        DEFAULT_FIELDS: ["Trial_Expiry__c", "FirstName", "LastName"],
        HEADER_FIELDS: ["FirstName", "LastName"],
    },
};

/**
 * @type {!Array<string>}
 */
export const SUPPORTED_OBJECT_TYPE_KEYS = Object.freeze(
    Object.keys(SUPPORTED_OBJECT_TYPES));

// Prefix Source:
// http://www.fishofprey.com/2011/09/obscure-salesforce-object-key-prefixes.html
const PREFIXES_TO_OBJECT_TYPES = Object.entries(SUPPORTED_OBJECT_TYPES).reduce(
    (prefixToType, [type, {PREFIX: prefix}]) => {
        prefixToType[prefix] = type;
        return prefixToType;
    },
    Object.create(null));

/**
 * From a given Salesforce Object ID prefix, returns the associated object type
 * key.
 * @param {string} objectIdPrefix
 * @return {string} Object type (API name)
 */
export function getObjectTypeFromPrefix(objectIdPrefix) {
    return PREFIXES_TO_OBJECT_TYPES[objectIdPrefix];
}

/**
 * Returns the human-friendly, plural display name for an object type.
 * @param {string} objectType
 * @return {string}
 */
export function getDisplayName(objectType) {
    return SUPPORTED_OBJECT_TYPES[objectType].DISPLAY_NAME;
}

/**
 * Returns the supported list views that are displayed when selecting a record
 * for a given object type.
 * @param {string} objectType
 * @return {!Array<string>}
 */
export function getSupportedListViews(objectType) {
    return [...SUPPORTED_OBJECT_TYPES[objectType].LIST_VIEWS];
}

/**
 * Returns the default fields to display if the user has not saved any
 * preferred fields.
 * @param {string} objectType
 * @return {!Array<string>}
 */
export function getDefaultFields(objectType) {
    return [...SUPPORTED_OBJECT_TYPES[objectType].DEFAULT_FIELDS];
}

/**
 * Returns the header field names for a given object type.
 * @param {string} objectType
 * @return {!Array<string>}
 */
export function getHeaderFields(objectType) {
    return SUPPORTED_OBJECT_TYPES[objectType].HEADER_FIELDS || ["Name"];
}

/**
 * Returns the search field name for a given object type.
 * @param {string} objectType
 * @return {string}
 */
export function getSearchField(objectType) {
    return SUPPORTED_OBJECT_TYPES[objectType].SEARCH_FIELD || "Name";
}

/**
 * OAuth2 configuration names that should match how your Live App is conifgured
 * from the Dev Console.
 */
export const AUTH_CONFIG_NAMES = Object.freeze({
    PRODUCTION: "salesforce",
    SANDBOX: "salesforce-test",
});
