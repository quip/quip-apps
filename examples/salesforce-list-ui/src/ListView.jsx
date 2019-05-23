import React from "react";

import {decode} from "he";
import moment from "moment";

import {
    Card,
    CardEmpty,
    CardFilter,
    DataTable,
    DataTableCell,
    DataTableColumn,
    Spinner,
} from "@salesforce/design-system-react";

export default class ListView extends React.Component {
    onClickName = item => {
        console.debug("onClickName", item.id);
        // TODO use quip.apps.openLink to open in Salesforce.
    };

    handleRowChange = (event, {selection}) => {
        console.debug("handleRowChange", selection);
        quip.apps.getRootRecord().set("selection", selection);
    };

    render() {
        const {data, selection} = this.props;
        const items = data.records.records.map(record => {
            let data = {id: record.id};
            Object.keys(record.fields).map(key => {
                data[key] =
                    record.fields[key].displayValue || record.fields[key].value;
            });
            return data;
        });
        const columns = data.info.displayColumns.map(col => {
            const property = col.fieldApiName;
            let cell;
            if (property === "Name") {
                cell = <ClickableDataTableCell onClick={this.onClickName} />;
            } else if (property === "MSRP__c") {
                cell = <CommentableDataTableCell />;
            } else if (property === "Picture_URL__c") {
                cell = <ImageDataTableCell />;
            }
            return (
                <DataTableColumn label={col.label} property={property}>
                    {cell}
                </DataTableColumn>
            );
        });
        return (
            <div style={{maxWidth: 800}}>
                <DataTable
                    items={items}
                    fixedLayout
                    selection={selection}
                    selectRows="checkbox"
                    onRowChange={this.handleRowChange}>
                    {columns}
                </DataTable>
            </div>
        );
    }
}

const CommentableDataTableCell = ({children, ...props}) => {
    const records = quip.apps
        .getRootRecord()
        .get("myRecords")
        .getRecords();
    const commentableRecord = records.find(r => r.get("id") === props.item.id);
    return (
        <DataTableCell {...props}>
            <div style={{alignItems: "center", display: "flex"}}>
                <div>{children}</div>
                <div
                    ref={c => commentableRecord.setDom(c)}
                    style={{marginLeft: 5}}>
                    <quip.apps.ui.CommentsTrigger
                        record={commentableRecord}
                        showEmpty={true}
                    />
                </div>
            </div>
        </DataTableCell>
    );
};
CommentableDataTableCell.displayName = DataTableCell.displayName;

const ClickableDataTableCell = ({children, ...props}) => {
    return (
        <DataTableCell {...props}>
            <div>
                <a
                    onClick={() => {
                        props.onClick(props.item);
                    }}
                    style={{cursor: "pointer"}}>
                    {children}
                </a>
            </div>
        </DataTableCell>
    );
};
ClickableDataTableCell.displayName = DataTableCell.displayName;

const ImageDataTableCell = ({children, ...props}) => {
    return (
        <DataTableCell {...props}>
            <img
                src={props.item[props.property]}
                alt=""
                style={{maxWidth: 75}}
            />
        </DataTableCell>
    );
};
ImageDataTableCell.displayName = DataTableCell.displayName;
