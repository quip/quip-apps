// Copyright 2017 Quip

/**
 * Base class shared between Field Builder and Jira element. Used to make calls
 * to the respective endpoints.
 */
export class BaseDatasource {
    fetchRecord(recordId) {
        throw Error("Unimplemented abstract method.");
    }
}
