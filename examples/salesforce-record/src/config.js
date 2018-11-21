// Copyright 2018 Quip

/**
 * OAuth2 configuration names that should match how your Live App is conifgured
 * from the Dev Console.
 */
export const AUTH_CONFIG_NAMES = Object.freeze({
    PRODUCTION: "salesforce",
    SANDBOX: "salesforce-test",
});

// To be used if the users' "selected" app in salesforce has no objects.
export const DEFAULT_SELECTED_OBJECTS = [
    "Account",
    "Opportunity",
    "Contact",
    "Lead",
    "Case",
    "User",
];
