import React from "react";
import PropTypes from "prop-types";

import "./DashboardPicker.css";

import {
    Card,
    CardEmpty,
    CardFilter,
    DataTable,
    DataTableCell,
    DataTableColumn,
    Spinner,
} from "@salesforce/design-system-react";

const ClickableDataTableCell = ({children, ...props}) => <DataTableCell
    {...props}>
    <div
        onClick={() => {
            props.onClick(props.item);
        }}
        style={{cursor: "pointer"}}>
        <a>{children}</a>
    </div>
</DataTableCell>;
ClickableDataTableCell.displayName = DataTableCell.displayName;

const FolderDataTableCell = ({children, ...props}) => <ClickableDataTableCell
    {...props}
    width="150px"
    primaryColumn>
    <a>{props.item.folder.label}</a>
</ClickableDataTableCell>;
FolderDataTableCell.displayName = DataTableCell.displayName;

const HEIGHT = 500;

export default class DashboardPicker extends React.Component {
    static propTypes = {
        dashboards: PropTypes.array,
        isFiltering: PropTypes.bool,
        setDashboardId: PropTypes.func,
    };
    constructor() {
        super();
        this.state = {
            filteredDashboards: null,
            isFiltering: false,
        };
    }

    handleFilterChange = e => {
        const {dashboards} = this.props;
        if (e.target.value === "") {
            this.setState({filteredDashboards: null, isFiltering: false});
            return;
        }
        const filteredDashboards = dashboards.filter(item =>
            RegExp(event.target.value, "i").test(
                `${item.folder.label} ${item.label}`)
        );
        this.setState({filteredDashboards, isFiltering: true});
    };

    onClickRow = dashboard => {
        console.debug("onClickRow", {dashboard});
        this.props.setDashboardId(dashboard.id);
    };

    render() {
        //<img src={logoSrc} style={{width: 30, height: 30}}/>
        const {dashboards, isFiltering} = this.props;
        const {filteredDashboards} = this.state;

        const isEmpty = dashboards.length === 0;
        return <Card
            bodyClassName="slds-grow slds-scrollable--y"
            className="slds-grid slds-grid--vertical"
            filter={
                (!isEmpty || isFiltering) && <CardFilter
                    className="filter"
                    onChange={this.handleFilterChange}/>
            }
            heading={quiptext("Dashboards")}
            empty={
                isEmpty ? (
                    <CardEmpty heading="Loading ...">
                        <Spinner
                            assistiveText={{label: quiptext("Loading")}}
                            size="large"/>
                    </CardEmpty>
                ) : null
            }
            style={{height: HEIGHT}}>
            <DataTable items={filteredDashboards || dashboards} fixedLayout>
                <DataTableColumn label="App" property="id" sortable>
                    <FolderDataTableCell onClick={this.onClickRow}/>
                </DataTableColumn>
                <DataTableColumn label="Name" property="label" sortable>
                    <ClickableDataTableCell onClick={this.onClickRow}/>
                </DataTableColumn>
            </DataTable>
        </Card>;
    }
}
