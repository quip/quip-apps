import React from "react";
import PropTypes from "prop-types";

import debounce from "lodash.debounce";

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
        handleFilterChange: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            isFiltering: false,
        };
        this.handleFilterChangeDebounced = debounce(
            this.props.handleFilterChange,
            200);
    }

    onFilterChange = e => {
        if (e.target.value === "") {
            this.setState({isFiltering: false});
            return;
        }
        this.handleFilterChangeDebounced(e.target.value);
        this.setState({isFiltering: true});
    };

    onClickRow = dashboard => {
        console.debug("onClickRow", {dashboard});
        this.props.setDashboardId(dashboard.id);
    };

    render() {
        const {dashboards} = this.props;
        const isFiltering = this.state;
        const isEmpty = dashboards.length === 0;
        return <Card
            bodyClassName="slds-grow slds-scrollable--y"
            className="slds-grid slds-grid--vertical"
            filter={
                <CardFilter className="filter" onChange={this.onFilterChange}/>
            }
            heading={quiptext("Dashboards")}
            empty={
                isEmpty && !isFiltering ? (
                    <CardEmpty heading="Loading ...">
                        <Spinner
                            assistiveText={{label: quiptext("Loading")}}
                            size="large"/>
                    </CardEmpty>
                ) : null
            }
            style={{height: HEIGHT}}>
            <DataTable items={dashboards} fixedLayout>
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
