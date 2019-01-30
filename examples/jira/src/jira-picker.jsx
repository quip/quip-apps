// Copyright 2017 Quip

import RowContainer from "../../shared/base-field-builder/row-container.jsx";
import Styles from "./jira-picker.less";
import {JiraDatasource, MAX_RECORDS_SEARCH} from "./datasource.js";
import {JiraRecentEntity} from "./model/jira-recent-record.js";
import {
    GatewayTimeoutError,
    InternalServerError,
    ServiceUnavailableError,
} from "../../shared/base-field-builder/error.js";
import Checkbox from "../../shared/base-field-builder/icons/checkbox.jsx";
import LiveDataIcon from "../../shared/base-field-builder/icons/live-data.jsx";

class Filter {
    constructor(id, name, query, showUser, searchUrl) {
        this.id = id;
        this.name = name;
        this.query = query;
        this.showUser = showUser;
        this.searchUrl = searchUrl;
    }
}

const RECENTLY_VIEWED = new Filter("1", quiptext("Recently Viewed"), "", false);
const MY_OPEN_ISSUES = new Filter(
    "-1",
    quiptext("My Open Issues"),
    "assignee = currentUser() AND status != done",
    true);
const REPORTED_BY_ME = new Filter(
    "-2",
    quiptext("Reported By Me"),
    "reporter = currentUser()",
    true);
const ALL_ISSUES = new Filter("-4", quiptext("All Issues"), "", false);
const OPEN_ISSUES = new Filter(
    "-5",
    quiptext("Open Issues"),
    "status != done",
    false);
const DONE_ISSUES = new Filter(
    "-9",
    quiptext("Done Issues"),
    "status = done",
    false);
const RECENTLY_VIEWED_SERVER = new Filter(
    "-3",
    quiptext("Recently Viewed"),
    "issuekey in issueHistory() order by lastViewed DESC",
    false);

const DEFAULT_FILTERS = [
    RECENTLY_VIEWED_SERVER,
    MY_OPEN_ISSUES,
    REPORTED_BY_ME,
    ALL_ISSUES,
    OPEN_ISSUES,
    DONE_ISSUES,
];

const FILTER_ROW = "filter_row";

const LOADING_STATUS = {
    LOADING: 0,
    LOADED: 1,
    ERROR: 2,
};

export const getDefaultFilter = id => {
    return DEFAULT_FILTERS.find(filter => filter.id === id);
};

export default class JiraPicker extends React.Component {
    static propTypes = {
        client: React.PropTypes.instanceOf(JiraDatasource).isRequired,
        recentRecords: React.PropTypes.arrayOf(
            React.PropTypes.instanceOf(JiraRecentEntity)).isRequired,
        className: React.PropTypes.string,
        onSelectFilter: React.PropTypes.func.isRequired,
        onUpdate: React.PropTypes.func.isRequired,
        selectedIssues: React.PropTypes.arrayOf(React.PropTypes.object)
            .isRequired,
        selectedLiveFilter: React.PropTypes.object,
        enableButton: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            records: [],
            selectedFilter: RECENTLY_VIEWED_SERVER,
            hasSearchText: false,
            searchMessage: "",
            selectFirst: false,
            recordsLoadingStatus: LOADING_STATUS.LOADED,
        };
    }

    componentDidMount() {
        this.selectFilter_(null, RECENTLY_VIEWED_SERVER);
        this.timeout = null;
        this.mounted = true;
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        this.mounted = false;
    }

    search(filter) {
        this.setState({
            recordsLoadingStatus: LOADING_STATUS.LOADING,
        });
        const promise = DEFAULT_FILTERS.includes(filter)
            ? this.props.client.searchRecords(
                  {jql: filter.query},
                  MAX_RECORDS_SEARCH)
            : this.props.client.searchRecordsWithFilter(filter);

        promise
            .then(response => {
                if (filter !== this.state.selectedFilter) {
                    return;
                }
                const issues = response.issues.map(issue => {
                    return {
                        id: issue.id,
                        key: issue.key,
                        summary: issue.fields.summary,
                    };
                });
                if (this.mounted) {
                    this.setState({
                        records: issues,
                        recordsLoadingStatus: LOADING_STATUS.LOADED,
                    });
                }
            })
            .catch(error => {
                window.setTimeout(() => {
                    console.error(error);
                    throw new Error(error);
                }, 0);
                if (filter === this.state.selectedFilter) {
                    if (this.mounted) {
                        this.setState({
                            recordsLoadingStatus: LOADING_STATUS.ERROR,
                        });
                    }
                }
            });
    }

    selectFilter_ = (e, filter) => {
        this.clearSearchBox_();
        this.setState({
            records: [],
            selectedFilter: filter,
        });
        this.refs["search-bar"].value = "";
        this.props.onUpdate([]);
        if (filter === RECENTLY_VIEWED) {
            let issues = this.props.recentRecords.map(record => {
                return {
                    id: record.getJiraId(),
                    key: record.getKey(),
                    summary: record.getSummary(),
                };
            });
            this.setState({
                records: issues,
                recordsLoadingStatus: LOADING_STATUS.LOADED,
            });
        } else {
            this.search(filter);
        }
        if (filter.query && filter !== RECENTLY_VIEWED_SERVER) {
            this.selectLiveFilter_(e, filter);
        }
    };

    selectLiveFilter_ = (e, filter) => {
        this.props.onSelectFilter(filter);
    };

    selectIssue_ = (e, issue) => {
        let issues = this.props.selectedIssues;
        let index = issues.findIndex(i => i.id === issue.id);
        if (index !== -1) {
            issues.splice(index, 1);
        } else {
            issues.push(issue);
        }
        this.props.onUpdate(issues);
    };

    findIssueKey_ = () => {
        // Fake autocomplete by seeing if we can pull an issue matching the
        // input from the API. Use a timeout to avoid bombarding the server.
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        if (!this.state.hasSearchText) {
            this.setState({
                hasSearchText: true,
                selectedFilter: null,
                searchMessage: quiptext("Searching..."),
            });
        }

        this.timeout = setTimeout(
            function() {
                var searchBar = this.refs["search-bar"];
                if (searchBar.value) {
                    this.setState({searchMessage: quiptext("Searching...")});
                    let that = this;
                    this.props.client
                        .summaryRecord(searchBar.value)
                        .then(response => {
                            if (response.errorMessage) {
                                that.setState({
                                    searchMessage: quiptext("No Results"),
                                    selectFirst: false,
                                });
                            } else {
                                that.setState({
                                    records: [
                                        {
                                            "id": response.id,
                                            "key": response.key,
                                            "summary": response.fields.summary,
                                        },
                                    ],
                                    hasSearchText: false,
                                    searchMessage: "",
                                    selectFirst: true,
                                });
                                this.props.enableButton(this.state.records[0]);
                            }
                        })
                        .catch(response => {
                            let message;
                            if (response instanceof InternalServerError ||
                                response instanceof ServiceUnavailableError ||
                                response instanceof GatewayTimeoutError) {
                                message = quiptext("Could Not Connect");
                            } else {
                                message = quiptext("No Results");
                            }
                            that.setState({
                                searchMessage: message,
                                selectFirst: false,
                            });
                        });
                } else {
                    this.setState({
                        records: [],
                        searchMessage: quiptext("No Results"),
                        selectFirst: false,
                    });
                }
            }.bind(this),
            500);
    };

    clearSearchBox_ = () => {
        this.setState({hasSearchText: false, selectFirst: false});
    };

    render() {
        let filter, tableDisplay, selectedIssues, retryDiv;
        if (this.state.selectedFilter && this.state.selectedFilter.query) {
            filter = this.state.selectedFilter;
        }
        if (this.state.selectFirst) {
            selectedIssues = [this.state.records[0].id];
        } else {
            selectedIssues = this.props.selectedIssues.map(issue => {
                return issue.id;
            });
        }
        if (this.state.hasSearchText) {
            if (this.state.searchMessage === quiptext("Could Not Connect")) {
                retryDiv = <div
                    className={Styles.retry}
                    onClick={this.findIssueKey_}>
                    {quiptext("Retry")}
                </div>;
            }
            tableDisplay = <div className={Styles.searchDisplay}>
                {this.state.searchMessage}
                {retryDiv}
            </div>;
        } else {
            tableDisplay = <PickerTable
                issues={this.state.records}
                filter={filter}
                selectedIssues={selectedIssues}
                selectedLiveFilter={
                    this.props.selectedLiveFilter ? true : false
                }
                onFilterClick={this.selectLiveFilter_}
                onIssueClick={this.selectIssue_}
                recordsLoadingStatus={this.state.recordsLoadingStatus}
                retry={e => this.selectFilter_(e, this.state.selectedFilter)}/>;
        }
        return <div className={Styles.pickerContainer}>
            <input
                className={Styles.searchBar}
                placeholder={quiptext("Search for an issue key in Jira...")}
                ref="search-bar"
                type="text"
                onInput={this.findIssueKey_}/>
            <div className={this.props.className}>
                <PickerFilter
                    selectedFilter={this.state.selectedFilter}
                    onClick={this.selectFilter_}
                    client={this.props.client}/>
                {tableDisplay}
            </div>
        </div>;
    }
}

class PickerFilter extends React.Component {
    static propTypes = {
        selectedFilter: React.PropTypes.object.isRequired,
        onClick: React.PropTypes.func.isRequired,
        client: React.PropTypes.instanceOf(JiraDatasource).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            filters: DEFAULT_FILTERS,
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.props.client.isServerInstance().then(server =>
            this.props.client.fetchFilters(server).then(response => {
                console.error(response);
                let filters = response.reduce((filters, item) => {
                    filters.push(
                        new Filter(
                            item.id,
                            item.name,
                            item.jql,
                            false,
                            item.searchUrl));
                    return filters;
                }, DEFAULT_FILTERS.slice());
                if (this.mounted) {
                    this.setState({filters: filters});
                }
            })
        );
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    renderRow_ = (filter, isHighlighted, index) => {
        const classNames = [Styles.filterRow];
        let currentUserModifier;
        if (this.props.selectedFilter === filter) {
            classNames.push(Styles.highlighted);
        }
        if (filter.showUser) {
            currentUserModifier = `(${quip.apps.getViewingUser().getName()})`;
        }
        return <div
            className={classNames.join(" ")}
            onClick={e => this.props.onClick(e, filter)}>
            {filter.name} {currentUserModifier}
        </div>;
    };

    render() {
        return <div className={Styles.filterList}>
            <RowContainer
                rows={this.state.filters}
                renderRow={this.renderRow_}
                containerClassName={Styles.scrollableList}/>
        </div>;
    }
}

class PickerTable extends React.Component {
    static propTypes = {
        issues: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        selectedIssues: React.PropTypes.arrayOf(React.PropTypes.string)
            .isRequired,
        selectedLiveFilter: React.PropTypes.bool.isRequired,
        onFilterClick: React.PropTypes.func.isRequired,
        onIssueClick: React.PropTypes.func.isRequired,
        filter: React.PropTypes.object,
        recordsLoadingStatus: React.PropTypes.number,
        retry: React.PropTypes.func.isRequired,
    };

    renderRow_ = (issue, isHighlighted, index) => {
        const rowClassNames = [Styles.issueRow];
        const keyClassNames = [Styles.keySpan];
        if (issue === FILTER_ROW) {
            rowClassNames.push(Styles.filterRow);
            if (this.props.selectedLiveFilter) {
                rowClassNames.push(Styles.highlighted);
            }
            return <div>
                <div
                    className={rowClassNames.join(" ")}
                    onClick={e =>
                        this.props.onFilterClick(e, this.props.filter)
                    }>
                    <div>{this.props.filter.name}</div>
                    <div className={Styles.liveDataByline}>
                        {quiptext("Live-updating filter")}
                    </div>
                    <div className={Styles.liveDataIcon}>
                        <LiveDataIcon/>
                    </div>
                </div>
                <hr className={Styles.issueDivider}/>
            </div>;
        } else {
            if (this.props.selectedIssues.indexOf(issue.id) !== -1) {
                rowClassNames.push(Styles.highlighted);
                keyClassNames.push(Styles.highlighted);
            }
            return <div
                className={rowClassNames.join(" ")}
                onClick={e => this.props.onIssueClick(e, issue)}>
                <Checkbox/>
                <div className={keyClassNames.join(" ")}>{issue.key}</div>
                <div>{issue.summary}</div>
            </div>;
        }
    };

    render() {
        if (this.props.recordsLoadingStatus == LOADING_STATUS.LOADING) {
            return <quip.apps.ui.Spinner
                key={"picker-table-spinner"}
                size={25}
                loading={true}/>;
        } else if (this.props.recordsLoadingStatus == LOADING_STATUS.ERROR) {
            return <div className={Styles.errorLoading}>
                {quiptext("Could Not Connect")}
                <div className={Styles.retry} onClick={this.props.retry}>
                    {quiptext("Retry")}
                </div>
            </div>;
        }

        let issues = this.props.issues.slice();
        if (this.props.filter && this.props.filter !== RECENTLY_VIEWED_SERVER) {
            issues.splice(0, 0, FILTER_ROW);
        }
        return <div className={Styles.issueList}>
            <RowContainer
                rows={issues}
                renderRow={this.renderRow_}
                containerClassName={Styles.scrollableList}/>
        </div>;
    }
}
