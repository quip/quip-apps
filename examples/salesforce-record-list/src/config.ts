// Copyright 2019 Quip

import {SalesforceNavigationItem} from "./lib/salesforce-types";

/**
 * OAuth2 configuration names that should match how your Live App is conifgured
 * from the Dev Console.
 */
export const AUTH_CONFIG_NAMES = Object.freeze({
    JDITSON: "salesforce-record-list",
    ORG_62: "salesforce",
    SANDBOX: "salesforce-test",
});

// To be used if the users' "selected" app in salesforce has no objects.
export const DEFAULT_LIST_TYPES: SalesforceNavigationItem[] = [
    {
        "id": "ACCOUNT_PLACEHOLDER",
        "objectApiName": "Account",
        "label": "Accounts",
        "developerName": "Accounts",
        "itemType": "ListView",
        "standardType": "QUIP_INTERNAL",
    },
    {
        "id": "OPPORTUNITY_PLACEHOLDER",
        "objectApiName": "Opportunity",
        "label": "Opportunities",
        "developerName": "Opportunities",
        "itemType": "ListView",
        "standardType": "QUIP_INTERNAL",
    },
    {
        "id": "CONTACT_PLACEHOLDER",
        "objectApiName": "Contact",
        "label": "Contacts",
        "developerName": "Contacts",
        "itemType": "ListView",
        "standardType": "QUIP_INTERNAL",
    },
    {
        "id": "LEAD_PLACEHOLDER",
        "objectApiName": "Lead",
        "label": "Leads",
        "developerName": "Leads",
        "itemType": "ListView",
        "standardType": "QUIP_INTERNAL",
    },
    {
        "id": "CASE_PLACEHOLDER",
        "objectApiName": "Case",
        "label": "Cases",
        "developerName": "Cases",
        "itemType": "ListView",
        "standardType": "QUIP_INTERNAL",
    },
];
