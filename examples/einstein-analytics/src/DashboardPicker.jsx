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
    IconSettings,
    Spinner,
} from "@salesforce/design-system-react";

import logoSrc from "./analytics-studio.png";
import standardSprite from "./assets/icons/standard-sprite/svg/symbols.svg";
import standardUtilitySprite from "./assets/icons/utility-sprite/svg/symbols.svg";
//import standardSprite from "@salesforce-ux/design-system/assets/icons/standard-sprite/svg/symbols.svg";
//import standardSprite from "!file-loader!@salesforce-ux/design-system/assets/icons/standard-sprite/svg/symbols.svg";

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
        const {dashboards, isFiltering} = this.props;
        const {filteredDashboards} = this.state;

        const isEmpty = dashboards.length === 0;
        return <IconSettings iconPath="dist/assets/icons">
            <Card
                bodyClassName="slds-grow slds-scrollable--y"
                className="slds-grid slds-grid--vertical"
                filter={
                    (!isEmpty || isFiltering) && <CardFilter
                        className="filter"
                        onChange={this.handleFilterChange}/>
                }
                heading={quiptext("Dashboards")}
                icon={<img src={logoSrc} style={{width: 30, height: 30}}/>}
                empty={
                    isEmpty ? (
                        <CardEmpty heading="Loading dashboards ...">
                            <Spinner
                                assistiveText={{label: quiptext("Loading")}}
                                size="large"/>
                        </CardEmpty>
                    ) : null
                }
                style={{height: "350px"}}>
                <DataTable items={filteredDashboards || dashboards} fixedLayout>
                    <DataTableColumn label="App" property="id" sortable>
                        <FolderDataTableCell onClick={this.onClickRow}/>
                    </DataTableColumn>
                    <DataTableColumn label="Name" property="label" sortable>
                        <ClickableDataTableCell onClick={this.onClickRow}/>
                    </DataTableColumn>
                </DataTable>
            </Card>
        </IconSettings>;
    }
}
