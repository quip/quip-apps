import PropTypes from "prop-types";
import React from "react";

import debounce from "lodash.debounce";
import {decode} from "he";
import moment from "moment";

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
        <a>{children}</a>
    </div>
</DataTableCell>;
ClickableDataTableCell.displayName = DataTableCell.displayName;

const LabelDataTableCell = ({children, ...props}) => <ClickableDataTableCell
    {...props}>
    <div
        onClick={() => {
            props.onClick(props.item);
        }}
        style={{cursor: "pointer"}}>
        <a>{decode(props.item.label)}</a>
    </div>
</ClickableDataTableCell>;
LabelDataTableCell.displayName = DataTableCell.displayName;

const MomentDataTableCell = ({children, ...props}) => <ClickableDataTableCell
    {...props}>
    <div
        onClick={() => {
            props.onClick(props.item);
        }}
        style={{cursor: "pointer"}}>
        <a>{decode(moment(props.item.lastModifiedDate).fromNow())}</a>
    </div>
</ClickableDataTableCell>;
MomentDataTableCell.displayName = DataTableCell.displayName;

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
        showUnavailableOnNativeError: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            isFiltering: false,
            filterQuery: "",
            showPicker: quip.apps.isAppFocused(),
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

    onButtonPromptClick = () => {
        if (quip.apps.isNative()) {
            this.props.showUnavailableOnNativeError();
        } else {
            this.setState({showPicker: true});
        }
    };

    render() {
        const {dashboards, totalDashboardLength} = this.props;
        const {isFiltering, filterQuery, showPicker} = this.state;
        const isEmpty = dashboards.length === 0;
        let loadMessage;
        if (totalDashboardLength !== undefined) {
            loadMessage = `${totalDashboardLength} dashboards found`;
        }

        return <div style={{height: "100%", minWidth: 600}}>
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
                        style={{height: HEIGHT}}>
                        <div className="slds-text-align_center slds-text-body_small slds-text-color_small">
                            {loadMessage}
                        </div>
                        <DataTable items={dashboards}>
                            <DataTableColumn label="Folder" property="id">
                                <FolderDataTableCell onClick={this.onClickRow}/>
                            </DataTableColumn>
                            <DataTableColumn label="Name" property="label">
                                <LabelDataTableCell onClick={this.onClickRow}/>
                            </DataTableColumn>
                            <DataTableColumn
                                label="Last Modified"
                                property="lastModifiedDate">
                                <MomentDataTableCell onClick={this.onClickRow}/>
                            </DataTableColumn>
                        </DataTable>
                    </Card>
                </Dialog>
            ) : (
                <ButtonPrompt
                    onClick={this.onButtonPromptClick}
                    text={quiptext("Choose a Dashboard")}/>
            )}
        </div>;
    }
}
