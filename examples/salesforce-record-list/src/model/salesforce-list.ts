// Copyright 2019 Quip

import quip from "quip-apps-api";
import CellComment, {CellCommentProperties} from "./cell-comment";
import SalesforceResponse, {
    SalesforceResponseProperties,
} from "./salesforce-response";
import {
    listData,
    listUrl,
    ColumnInfo,
    RowInfo,
} from "../lib/salesforce-responses";
import recordMetric from "../lib/metrics";
import {
    SalesforceRecordCollection,
    SalesforceObject,
    SalesforcePicklistValuesCollection,
    SalesforceRecord,
    SalesforceListResponse,
    SalesforceColumn,
    SalesforceFieldValue,
    SalesforcePicklistValue,
    SalesforceDataType,
} from "../lib/salesforce-types";

const DEFAULT_THEME_INFO = {
    name: "Opportunity",
    color: "FCB95B",
     
    // from salesforce. Instead will use toLowerCase on the name to find this
    // icon in SLDS, hopefully that scales!
    iconUrl:
        "https://na91.salesforce.com/img/icon/t4v35/standard/opportunity_120.png",
};

interface ListUpdate {
    recordId: string;
    fields: {[colName: string]: string};
}

export interface SalesforceListProperties {
    listId?: string;
    response?: SalesforceResponseProperties<SalesforceListResponse>;
    recordResponses?: SalesforceResponseProperties<
        SalesforceRecordCollection
    >[];
    objectType?: string;
    hasInitialColumns?: boolean;
    objectResponse?: SalesforceResponseProperties<SalesforceObject>;
    picklistsResponse?: SalesforceResponseProperties<
        SalesforcePicklistValuesCollection
    >;
    comments?: CellCommentProperties[];
    sortColumn?: string;
    sortDesc?: boolean;
    columnWidths?: {[colName: string]: number};
    isPlaceholder?: boolean;
    showingColumns?: string[];
    recordsPerPage?: number;
}

export interface SalesforceListCellData {
    id?: string;
    relativeUrl?: string;
    dirtyValue?: string;
    displayValue: string | null;
    value: string | number | SalesforceRecord | null;
    locked: boolean;
}

export interface SalesforceListCellSchema {
    values?: ({label: string; value: string})[];
    defaultValue?: string;
    dataType: SalesforceDataType | "__UNKNOWN" | "__REFERENCE";
    isHtml?: boolean;
}

export interface SalesforceListCell {
    comment: CellComment | null;
    data: SalesforceListCellData;
    schema: SalesforceListCellSchema;
    dirty: boolean;
    column: ColumnInfo;
}

export interface SalesforceListData {
    title: string;
    columns: SalesforceColumn[];
    columnWidths: Map<string, number>;
    rows: RowInfo<SalesforceListCell>[];
    hasInitialColumns: boolean;
    availableColumns: SalesforceColumn[];
    showingColumns: string[];
    sortDesc: boolean;
    sortColumn: string;
    isPlaceholder: boolean;
    isDirty: boolean;
    isEmpty: boolean;
    lastFetchedTime: number;
    ownerId: string;
    instanceUrl: string;
    themeInfo: {name: string};
    salesforceUrl: string;
    recordsPerPage: number;
}

export class SalesforceListEntity extends quip.apps.Record {
    static ID = "salesforceList";
    static DATA_VERSION = 2;

    static getProperties() {
        return {
            listId: "string",
            response: SalesforceResponse,
            recordResponses: quip.apps.RecordList.Type(SalesforceResponse),
            objectType: "string",
            hasInitialColumns: "boolean",
            objectResponse: SalesforceResponse,
            picklistsResponse: SalesforceResponse,
            comments: quip.apps.RecordList.Type(CellComment),
            sortColumn: "string",
            sortDesc: "boolean",
            columnWidths: "object",
            isPlaceholder: "boolean",
            showingColumns: "array",
            recordsPerPage: "number",
            // Salesforce has an artificial limit on paging beyond 2k. This bit
            // is true for lists that have > 2k records to indicate that we
            // won't display the entire list.
            isLargerThanMax: "boolean",
        };
    }

     
    // matter since they won't be checked anywhere. In the future we should
    // consider making these static properties rather than methods and type
    // checking them, although we will need to make sure that the automatic
    // conversion code for Records does not confuse typescript.
    static getDefaultProperties(): {
        response: Object;
        recordResponses: any[];
        hasInitialColumns: boolean;
        comments: any[];
        columnWidths: Object;
        showingColumns: any[];
        recordsPerPage: number;
    } {
        return {
            response: {},
            recordResponses: [],
            hasInitialColumns: false,
            comments: [],
            columnWidths: {},
            showingColumns: [],
            recordsPerPage: 20,
        };
    }

    private dirtyFields_: Map<
        string,
        {value: string; recordId: string}
    > = new Map();

    initialize() {
        const comments = this.getComments_().getRecords();
        comments.forEach((comment: CellComment) => {
            comment.listen(this.commentUpdated_);
        });
    }

    setProperties(
        properties: SalesforceListProperties,
        resetDirtyFields: boolean
    ) {
        if (resetDirtyFields) {
            this.dirtyFields_ = new Map();
        }
        const recordFields = new Set([
            "response",
            "objectResponse",
            "recordResponses",
            "picklistsResponse",
        ]);
        const restrictedFields = new Set(["comments"]);
        for (let prop in properties) {
            if (restrictedFields.has(prop)) {
                console.warn(`attempt to set non-mutable field ${prop}.`);
                break;
            }
            if (recordFields.has(prop)) {
                this.clear(prop);
            }
            this.set(prop, (properties as {[key: string]: any})[prop]);
        }
    }

    getListId_(): string {
        return this.get("listId");
    }
    getResponse_(): SalesforceResponse<SalesforceListResponse> {
        return this.get("response");
    }
    getRecordResponses_(): quip.apps.RecordList<
        SalesforceResponse<SalesforceRecordCollection>
    > {
        return this.get("recordResponses");
    }
    getObjectType_(): string {
        return this.get("objectType");
    }
    getHasInitialColumns_(): boolean {
        return this.get("hasInitialColumns");
    }
    getObjectResponse_(): SalesforceResponse<SalesforceObject> | undefined {
        return this.get("objectResponse");
    }
    getPicklistResponse_():
        | SalesforceResponse<SalesforcePicklistValuesCollection>
        | undefined {
        return this.get("picklistsResponse");
    }
    getComments_(): quip.apps.RecordList<CellComment> {
        return this.get("comments");
    }
    getSortColumn_(): string | undefined {
        return this.get("sortColumn");
    }
    getSortDesc_(): boolean | undefined {
        return this.get("sortDesc");
    }
    getColumnWidths_(): {[colName: string]: number} {
        return this.get("columnWidths");
    }
    getIsPlaceholder_(): boolean {
        return this.get("isPlaceholder");
    }
    getShowingColumns_(): string[] {
        return this.get("showingColumns");
    }
    getRecordsPerPage_(): number {
        return this.get("recordsPerPage");
    }

    getData(): SalesforceListData {
        const sortColumn = this.getSortColumn_();
        const sortDesc = this.getSortDesc_();
        const response = this.getResponse_();
        const recordResponses = this.getRecordResponses_();
        const objectResponse = this.getObjectResponse_();
        const recordsPerPage = this.getRecordsPerPage_();
        const objectData = objectResponse ? objectResponse.getData() : null;
        const hasInitialColumns =
            this.getDataVersion() === 1 ? true : this.getHasInitialColumns_();
        const {
            title,
            availableColumns,
            showingColumns,
            columns,
            rows,
        } = listData<SalesforceListCell>(response, recordResponses, {
            showingColumns: this.getShowingColumns_(),
            maxShowingColumns: hasInitialColumns ? 0 : 5,
            sortColumn,
            sortDesc,
            getCellData: this.getCellData_,
        });
        const columnWidthsObj = this.getColumnWidths_();
        const columnWidths = new Map(
            Object.keys(columnWidthsObj).map(k => [k, columnWidthsObj[k]]));
        const instanceUrl = response.getInstanceUrl();
        const themeInfo = objectData
            ? {...objectData.themeInfo, name: objectData.apiName}
            : DEFAULT_THEME_INFO;
        return {
            title,
            columns,
            columnWidths,
            rows,
            hasInitialColumns,
            availableColumns,
            showingColumns,
            sortDesc,
            sortColumn,
            isPlaceholder: this.getIsPlaceholder_(),
            isDirty: this.dirtyFields_.size > 0,
            isEmpty: rows.length === 0,
            lastFetchedTime: response.getLastFetchedTime(),
            ownerId: response.getOwnerId(),
            instanceUrl,
            themeInfo,
            salesforceUrl: listUrl(instanceUrl, objectData, response),
            recordsPerPage,
        };
    }

    getSaveData() {
        this.notifyListeners();
        const updates: ListUpdate[] = [];
        for (const [key, {value, recordId}] of this.dirtyFields_) {
            const [_, colName] = key.split("#");
            updates.push({
                recordId,
                fields: {
                    [colName]: value,
                },
            });
        }
        return {
            listId: this.getListId_(),
            objectType: this.getObjectType_(),
            updates,
        };
    }

    resetData() {
        this.dirtyFields_ = new Map();
        this.notifyListeners();
    }

    setSortColumn(columnName: string, desc?: boolean) {
        if (desc === undefined) {
            const currentColumn = this.getSortColumn_();
            desc = currentColumn === columnName ? !this.getSortDesc_() : false;
        }
        this.set("sortColumn", columnName);
        this.set("sortDesc", desc);
        recordMetric("update_sort");
    }

    setColumnWidths(columnWidths: Map<string, number>) {
        const widthsObj: {[key: string]: number} = {};
        for (const [col, width] of columnWidths) {
            widthsObj[col] = width;
        }
        this.set("columnWidths", widthsObj);
        recordMetric("resize_column");
    }

    updateCell(recordId: string, fieldApiName: string, value: string) {
        const cellKey = `${recordId}#${fieldApiName}`;
        const row = this.getData().rows.find(row => row.recordId === recordId);
        if (!row) {
            console.error(`Attempt to update non-existent record ${recordId}`);
            return;
        }
        const {data: serverData} = row.cells.find(
            r => r.column.fieldApiName === fieldApiName);
        // Passing a value identical to the server value resets this field
        if (value === serverData.value || value === null) {
            this.dirtyFields_.delete(cellKey);
            recordMetric("cell_edited", {"edit_type": "reset"});
        } else {
            // Otherwise this field is dirty until saved/reset
            this.dirtyFields_.set(cellKey, {
                value,
                recordId,
            });
            recordMetric("cell_edited", {"edit_type": "update"});
        }
        this.notifyListeners();
    }

    setShowingColumns(showingColumns: string[]) {
        if (!this.getHasInitialColumns_()) {
            recordMetric("initialize_showing_columns");
            this.set("hasInitialColumns", true);
        } else {
            recordMetric("update_showing_columns");
        }
        this.set("showingColumns", showingColumns);
    }

    hideColumn(colName: string) {
        recordMetric("hide_column");
        let showingColumns = this.getShowingColumns_();
        if (showingColumns.length === 0) {
            showingColumns = this.getData().showingColumns;
        }
        this.set("showingColumns", showingColumns.filter(c => c !== colName));
    }

    addComment(
        recordId: string,
        columnName: string,
        domNode: Node
    ): CellComment {
        const comment = this.getComments_().add({recordId, columnName});
        comment.listen(this.commentUpdated_);
        comment.setDom(domNode);
        this.notifyListeners();
        recordMetric("comment_added");
        return comment;
    }

    getComment_(recordId: string, columnName: string): CellComment | null {
        const comments = this.getComments_();
        for (let i = 0; i < comments.count(); i++) {
            const c = comments.get(i);
            if (c.isFor(recordId, columnName)) {
                return c;
            }
        }
        return null;
    }

    getCellData_ = (
        fieldValue: SalesforceFieldValue,
        {
            record,
            column,
        }: {
            record: SalesforceRecord;
            index: number;
            column: ColumnInfo;
        }
    ): SalesforceListCell => {
        const {fieldApiName} = column;
        const cell: SalesforceListCell = {
            comment: this.getComment_(record.id, fieldApiName),
            dirty: false,
            data: {
                value: fieldValue.value,
                displayValue: fieldValue.displayValue,
                locked: false,
            },
            schema: {
                dataType: "__UNKNOWN",
            },
            column,
        };
        const getDirtyValue = (field: string) =>
            this.dirtyFields_.get(`${record.id}#${field}`);
        const dirtyField = getDirtyValue(fieldApiName);
        if (dirtyField && dirtyField.value !== fieldValue.value) {
            cell.data.dirtyValue = dirtyField.value;
            cell.dirty = true;
        }
        // Non-placeholder data must also provide objectResponse and
        // picklistResponse. In theory non-editable data could also omit this,
        // so if we implement a read-only version this could check that as well.
        if (!this.getIsPlaceholder_()) {
            const {fields} = this.getObjectResponse_().getData();
            const {picklistFieldValues} = this.getPicklistResponse_().getData();
            const fieldInfo = fields[fieldApiName];
            cell.data.locked = true;
            if (fieldInfo) {
                // This is a primitive field, tell the UI how to edit it
                cell.data.locked = !fieldInfo.updateable;
                cell.schema.dataType = fieldInfo.dataType;
                cell.data.displayValue = fieldValue.displayValue;
                if (fieldInfo.dataType === "TextArea") {
                    cell.schema.isHtml =
                        fieldInfo.extraTypeInfo === "RichTextArea";
                }
            } else {
                // This is an alias, so just dereference the ID it points to and
                // link to it rather than allowing inline editing.
                const apiName = fieldApiName.split(".")[0];
                const fieldInfo = record.fields[apiName];
                const id =
                    fieldInfo &&
                    fieldInfo.value &&
                    (fieldInfo.value as SalesforceRecord).id;
                cell.schema.dataType = "__REFERENCE";
                if (id) {
                    cell.data.id = id;
                    cell.data.relativeUrl = `/lightning/r/${apiName}/${id}/view`;
                }
            }
            if (fieldInfo && fieldInfo.dataType === "Picklist") {
                const {controllingFields} = fieldInfo;
                const {
                    values: allValues,
                    defaultValue,
                    controllerValues,
                } = picklistFieldValues[fieldApiName];
                let values: SalesforcePicklistValue[] = [...allValues];
                if (controllingFields.length > 0) {
                    // This is a dependent picklist, filter the values by the
                    // controlling fields' valid values.
                    // Look up our controlling fields to see if they have values
                    for (const field of controllingFields) {
                        if (!record.fields[field]) {
                            console.error(
                                `Invalid data: ${fieldApiName} is controlled by ${field} but it was not present on the record.`,
                                record.fields);
                            break;
                        }
                        // find the controlling fields' value (picklist values
                        // are always strings so this cast makes sense)
                        const dirtyValue = getDirtyValue(field);
                        const value = (dirtyValue !== undefined
                            ? dirtyValue.value
                            : record.fields[field].value) as string;
                        // find the corresponding controllerValues validFor number
                        const validForLookup = controllerValues[value];
                        if (typeof validForLookup === undefined) {
                            console.error(
                                `Invalid data: ${value} not found in controllerValues for ${fieldApiName}.${field}`,
                                controllerValues);
                            break;
                        }
                        // filter values by ones that are validFor our lookup number
                        values = values.filter(
                            val => val.validFor.indexOf(validForLookup) !== -1);
                    }
                }
                cell.schema.values = values.map(
                    ({label, value}: {label: string; value: string}) => ({
                        label,
                        value,
                    }));
                 
                cell.schema.defaultValue = defaultValue
                    ? defaultValue.value
                    : null;
            }
        }
        return cell;
    };

    commentUpdated_ = () => {
        this.notifyListeners();
    };
}
