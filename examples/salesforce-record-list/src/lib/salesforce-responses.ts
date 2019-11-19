// Copyright 2019 Quip
import quip from "quip-apps-api";
import SalesforceResponse from "../model/salesforce-response";
import {
    SalesforceListResponse,
    SalesforceRecordCollection,
    SalesforceRecord,
    SalesforceNavigationItems,
    SalesforceNavigationItem,
    SalesforceListViewSummaryCollection,
    SalesforceColumn,
    SalesforceFieldValue,
    ObjectInfoResponse,
} from "./salesforce-types";

/**
 * @fileoverview Functions to transform `salesforce-response`s to
 * application-readable plain objects.
 */

const getField = (record: SalesforceRecord, field: string) => {
    const parts = field.split(".");
    let node: SalesforceFieldValue = {value: record};
    while (parts.length > 0) {
        const key = parts.shift();
        // If a child is null, just return the (empty) parent node.
        if (!node.value) {
            return node;
        }
        node = (node.value as SalesforceRecord).fields[key];
        if (node === undefined) {
            throw new Error(
                `field ${field} not found in ${JSON.stringify(
                    record,
                    null,
                    2)}`);
        }
    }
    return node;
};

export function listUrl(
    instanceUrl: string,
    objectData: {apiName: string},
    response: SalesforceResponse<SalesforceListResponse>
) {
    if (!objectData) {
        return null;
    }
    const {
        info: {
            listReference: {id},
        },
    } = response.getData();
    const {apiName} = objectData;
    return `${instanceUrl}/lightning/o/${apiName}/list?filterName=${id}`;
}

export interface ColumnInfo {
    fieldApiName: string;
    label: string;
    sortable: boolean;
}

export interface RowInfo<T> {
    recordId: string;
    cells: T[];
    sortValue_: string | number | SalesforceRecord;
}

export function listData<T>(
    response: SalesforceResponse<SalesforceListResponse>,
    recordResponses: quip.apps.RecordList<
        SalesforceResponse<SalesforceRecordCollection>
    >,
    {
        showingColumns,
        sortColumn,
        sortDesc,
        getCellData,
        maxShowingColumns,
    }: {
        showingColumns: string[];
        sortColumn: string;
        sortDesc: boolean;
        getCellData: (
            value: SalesforceFieldValue,
            info: {
                record: SalesforceRecord;
                index: number;
                column: ColumnInfo;
            }
        ) => T;
        maxShowingColumns: number;
    }
): {
    title: string;
    availableColumns: SalesforceColumn[];
    columns: SalesforceColumn[];
    showingColumns: string[];
    rows: RowInfo<T>[];
} {
    const {
        info: {displayColumns, label: title},
        records: {records: firstRecordsPage},
    } = response.getData();
    if (showingColumns.length === 0) {
        showingColumns = displayColumns.map(c => c.fieldApiName);
    }
    if (maxShowingColumns) {
        showingColumns = showingColumns.slice(0, maxShowingColumns);
    }
    const colMap = new Map(displayColumns.map(c => [c.fieldApiName, c]));
    const records = recordResponses
        .getRecords()
        .reduce(
            (arr, response) => [...arr, ...response.getData().records],
            firstRecordsPage);
    let rows = records.map((record, index) => {
        let sortValue_;
        return {
            recordId: record.id,
            cells: showingColumns.map(c => {
                const value = Object.assign({}, getField(record, c));
                const column = colMap.get(c);
                if (c === sortColumn) {
                    sortValue_ = value;
                }
                return getCellData(value, {record, index, column});
            }),
            sortValue_,
        };
    });
    if (sortColumn) {
        const lt = sortDesc ? 1 : -1;
        const gt = sortDesc ? -1 : 1;
        rows = rows.sort((ra, rb) => {
            const va = ra.sortValue_ || -1;
            const vb = rb.sortValue_ || -1;
            return va === vb ? 0 : va < vb ? lt : gt;
        });
    }
    return {
        title,
        availableColumns: displayColumns,
        columns: showingColumns.map(c => colMap.get(c)),
        showingColumns,
        rows,
    };
}

export function navItems(
    responses: quip.apps.RecordList<
        SalesforceResponse<SalesforceNavigationItems>
    >
): SalesforceNavigationItem[] {
    let items: SalesforceNavigationItem[] = [];
    for (const r of responses.getRecords()) {
        const {navItems} = r.getData();
        items = items.concat(
            navItems.filter(
                item =>
                     
                    // objectId as the objectAPIName, but testing seems to show
                    // that the list endpoint will consistently fail when called
                    // with them, so I'll skip them for now.
                    !item.objectApiName.startsWith("0")));
    }
    return items;
}

export function objectInfoTypes(
    response: SalesforceResponse<ObjectInfoResponse>
): Set<string> {
    const {objects} = response.getData();
    return new Set(Object.values(objects).map(({apiName}) => apiName));
}

export function listTypeListData(
    response: SalesforceResponse<SalesforceListViewSummaryCollection>
) {
    const {lists} = response.getData();
    return lists;
}

export function getLastPageToken(
    responses: SalesforceResponse<SalesforceListViewSummaryCollection>[]
) {
    const lastList = responses[responses.length - 1].getData();
    return lastList.nextPageToken;
}
