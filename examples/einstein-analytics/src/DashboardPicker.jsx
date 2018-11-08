import React from "react";
import PropTypes from "prop-types";

import debounce from "lodash.debounce";
import {decode} from "he";

import ButtonPrompt from "./ButtonPrompt.jsx";
import Dialog from "../../shared/dialog/dialog.jsx";
import "./DashboardPicker.css";
import Styles from "./DashboardPicker.less";

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
        <a>{decode(children)}</a>
    </div>
</DataTableCell>;
ClickableDataTableCell.displayName = DataTableCell.displayName;

const FolderDataTableCell = ({children, ...props}) => <ClickableDataTableCell
    {...props}
    width="150px"
    primaryColumn>
    <a>{decode(props.item.folder.label)}</a>
</ClickableDataTableCell>;
FolderDataTableCell.displayName = DataTableCell.displayName;

const HEIGHT = 500;

export default class DashboardPicker extends React.Component {
    static propTypes = {
        dashboards: PropTypes.array,
        totalDashboardLength: PropTypes.number,
        isFiltering: PropTypes.bool,
        setDashboardId: PropTypes.func,
        handleFilterChange: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            isFiltering: false,
            filterQuery: "",
            showPicker: true,
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
        this.setState({isFiltering: true, filterQuery: e.target.value});
    };

    onClickRow = dashboard => {
        console.debug("onClickRow", {dashboard});
        this.props.setDashboardId(dashboard.id);
    };

    render() {
        const {dashboards, totalDashboardLength} = this.props;
        const {isFiltering, filterQuery, showPicker} = this.state;
        const isEmpty = dashboards.length === 0;
        let loadMessage;
        if (totalDashboardLength !== undefined) {
            loadMessage = `${totalDashboardLength} dashboards`;
            if (dashboards.length) {
                loadMessage = `${dashboards.length} out of ${loadMessage}`;
            }
            if (filterQuery != "") {
                loadMessage = `${loadMessage} for ${filterQuery}`;
            }
        }
        return <div>
            {showPicker ? (
                <Dialog onDismiss={() => this.setState({showPicker: false})}>
                    <Card
                        bodyClassName="slds-grow slds-scrollable--y"
                        className="slds-grid slds-grid--vertical"
                        filter={
                            <CardFilter
                                className="filter"
                                onChange={this.onFilterChange}
                                placeholder="Search by Name"/>
                        }
                        heading={quiptext("Choose a Dashboard")}
                        empty={
                            isEmpty && !isFiltering ? (
                                <CardEmpty heading="Loading ...">
                                    <Spinner
                                        assistiveText={{
                                            label: quiptext("Loading"),
                                        }}
                                        size="large"/>
                                </CardEmpty>
                            ) : null
                        }
                        style={{height: HEIGHT, minWidth: 800}}>
                        <DataTable items={dashboards} fixedLayout>
                            <DataTableColumn label="Name" property="label">
                                <ClickableDataTableCell
                                    onClick={this.onClickRow}/>
                            </DataTableColumn>

                            {
                                // Not showing the App column to gather some feedback on how
                                // the dashboard picker should look like, and what other info
                                // are helpful.
                                /* <DataTableColumn label="App" property="id">
                    <FolderDataTableCell onClick={this.onClickRow}/>
                </DataTableColumn> */
                            }
                            <DataTableColumn
                                label="Last Modified Time"
                                property="lastModifiedDate">
                                <ClickableDataTableCell
                                    onClick={this.onClickRow}/>
                            </DataTableColumn>
                        </DataTable>
                        <div className={Styles.textWrapper}>
                            <div className={Styles.text}>{loadMessage}</div>
                        </div>
                    </Card>
                </Dialog>
            ) : (
                <ButtonPrompt
                    onClick={() => this.setState({showPicker: true})}
                    text={quiptext("Choose a Dashboard")}/>
            )}
        </div>;
    }
}
