import React from "react";
import PropTypes from "prop-types";
import sortBy from "lodash/sortby";

import {getAuth} from "./root.jsx";
import {logout} from "./menus";

import "./DashboardPicker.css";

import {
    Card,
    CardEmpty,
    CardFilter,
    DataTable,
    DataTableCell,
    DataTableColumn,
    Icon,
    IconSettings,
} from "@salesforce/design-system-react";
import standardSprite from "!svg-react-loader!@salesforce-ux/design-system/assets/icons/standard-sprite/svg/symbols.svg";

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
        setDashboards: PropTypes.func,
    };
    constructor() {
        super();
        this.state = {
            filteredDashboards: null,
            isFiltering: false,
        };
    }
    componentDidMount() {
        const {dashboards} = this.props;
        if (dashboards.length) {
            return;
        }
        this.fetchDashboards();
    }
    fetchDashboards(q = "") {
        const {setDashboards} = this.props;
        const tokenResponse = getAuth().getTokenResponse();
        const url = `${
            tokenResponse.instance_url
        }/services/data/v42.0/wave/dashboards?q=${q}`;
        let headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenResponse.access_token}`,
        };
        fetch(url, {headers})
            .then(resp => resp.json())
            .then(json => {
                setDashboards(
                    sortBy(json.dashboards, ["folder.label", "label"]));
            })
            .catch(err => {
                console.error({err, arguments: arguments});
                // TODO: sometimes logout
            });
    }

    handleFilterChange = e => {
        console.debug("handleFilterChange", e);
        const {dashboards} = this.props;
        if (e.target.value === "") {
            this.setState({filteredDashboards: null, isFiltering: false});
            return;
        }
        const filteredDashboards = dashboards.filter(item =>
            RegExp(event.target.value, "i").test(item.label)
        );
        this.setState({filteredDashboards, isFiltering: true});
    };

    onClickRow = dashboard => {
        console.debug({dashboard});
        this.props.setDashboardId(dashboard.id);
    };
    render() {
        const {dashboards, isFiltering} = this.props;
        const {filteredDashboards} = this.state;

        const isEmpty = dashboards.length === 0;
        return <IconSettings standardSprite={standardSprite}>
            <Card
                bodyClassName="slds-grow slds-scrollable--y"
                className="slds-grid slds-grid--vertical"
                filter={
                    (!isEmpty || isFiltering) && <CardFilter
                        className="filter"
                        onChange={this.handleFilterChange}/>
                }
                heading="Einstein Dashboards"
                icon={<Icon category="standard" name="document" size="small"/>}
                empty={isEmpty ? <CardEmpty heading="Loading ..."/> : null}
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

        /*
        return <div className={Styles.DashboardPicker}>
            <h2>Choose a Dashboard:</h2>
            <div className={Styles.listContainer}>
                <table>
                    <thead>
                        <th className={Styles.folderLabel}>App</th>
                        <th>Dashboard</th>
                    </thead>
                    <tbody>
                        {dashboards.map(d => <tr
                            key={d.id}
                            onClick={() => {
                                this.onClickRow(d);
                            }}>
                            <td className={Styles.folderLabel}>
                                {d.folder.label}
                            </td>
                            <td>{d.label}</td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </div>;
        */
    }
}
