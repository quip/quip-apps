// Copyright 2019 Quip

import React, {Component, ChangeEvent, KeyboardEvent} from "react";
import PropTypes, {InferProps} from "prop-types";
import quip from "quip-apps-api";
import _ from "quiptext";
import classNames from "classnames";
import {
    SalesforceListViewSummary,
    SalesforceNavigationItem,
} from "../lib/salesforce-types";
import SearchIcon from "./search-icon";
import {ListsResponseData} from "../model/lists-response";
import RowContainer from "../../shared/base-field-builder/row-container.jsx";
import {loaderSentinel, ListSentinal} from "./list-picker";
import Styles from "./list-picker.less";

interface ListViewFilterProps
    extends InferProps<typeof ListViewFilter.propTypes> {
    listViews: Map<string, ListsResponseData>;
    selectedListType?: SalesforceNavigationItem;
    selectedListView?: SalesforceListViewSummary;
    onSelectListView: (listView: SalesforceListViewSummary) => void;
    onFetchMore: (lastPageToken?: string) => void;
    onSearch: (
        type: SalesforceNavigationItem,
        query: string
    ) => Promise<ListsResponseData>;
    onSubmit: () => void;
}
interface ListViewFilterState {
    searchText: string;
    isSearching: boolean;
    inSearchMode: boolean;
    searchResults: ListsResponseData;
}

export default class ListViewFilter extends Component<
    ListViewFilterProps,
    ListViewFilterState
> {
    static propTypes = {
        listViews: PropTypes.instanceOf(Map).isRequired,
        selectedListType: PropTypes.object,
        selectedListView: PropTypes.object,
        isLoading: PropTypes.bool.isRequired,
        isFetchingMoreLists: PropTypes.bool.isRequired,
        onSelectListView: PropTypes.func.isRequired,
        onFetchMore: PropTypes.func.isRequired,
        onSearch: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        error: PropTypes.instanceOf(Error),
    };

    private searchInput_: HTMLInputElement;
    private needsScrollUpdate_: boolean = false;
    private listViewRef_: RowContainer;

    constructor(props: ListViewFilterProps) {
        super(props);
        this.state = {
            searchText: "",
            isSearching: false,
            inSearchMode: false,
            searchResults: {hasMore: false, lists: []},
        };
    }

    componentDidMount() {
        this.focusInput_();
    }

    componentWillReceiveProps(nextProps: ListViewFilterProps) {
        if (nextProps.selectedListType !== this.props.selectedListType) {
            this.focusInput_();
        }
    }

    componentDidUpdate() {
        this.fetchListsIfNeeded_();
    }

    focusInput_ = () => {
        if (this.searchInput_) {
            this.searchInput_.focus();
        }
    };

    updateSearchQuery_ = (e: ChangeEvent<HTMLInputElement>) => {
        const searchText = e.currentTarget.value;
        // If a user deletes all the text in a search box, act as if they
        // pressed the cancel button
        if (searchText.length === 0) {
            this.setState({
                searchText,
                inSearchMode: false,
                searchResults: {hasMore: false, lists: []},
            });
        } else {
            this.setState({searchText, inSearchMode: true});
        }
    };

    onSearchInputKeyDown_ = async (e: KeyboardEvent<HTMLInputElement>) => {
        const {onSearch, selectedListType} = this.props;
        const {searchText} = this.state;
        if (e.keyCode === 13) {
            this.setState({inSearchMode: true, isSearching: true});
            // enter pressed
            const searchResults = await onSearch(selectedListType, searchText);
            this.setState({searchResults, isSearching: false});
        }
    };

    onFocusSearchInput_ = () => {
        // Don't allow focusing both a list item and the search box at the same
        // time, since they both respond to the enter key
        const {onSelectListView} = this.props;
        onSelectListView(null);
    };

    onScroll_ = (e: Event) => {
        this.needsScrollUpdate_ = true;
        requestAnimationFrame(() => {
            if (!this.needsScrollUpdate_) {
                return;
            }
            this.fetchListsIfNeeded_();
            this.needsScrollUpdate_ = false;
        });
    };

    fetchListsIfNeeded_() {
        const {onFetchMore, isFetchingMoreLists, isLoading} = this.props;
        const {inSearchMode} = this.state;
        const {lastPageToken} = this.getListData_();
        const ref = this.listViewRef_;
        if (!inSearchMode &&
            !isFetchingMoreLists &&
            !isLoading &&
            lastPageToken &&
            ref &&
            ref.domNode) {
            const el: HTMLElement = ref.domNode;
            if (el.scrollTop >= el.scrollHeight - el.offsetHeight) {
                // we've reached the bottom of the container, fetch more.
                onFetchMore(lastPageToken);
            }
        }
    }

    getListData_(): ListsResponseData {
        const {listViews, selectedListType} = this.props;
        return (
            listViews.get(selectedListType.objectApiName) || {
                hasMore: false,
                lists: [],
            }
        );
    }

    render() {
        const {
            selectedListView,
            isLoading,
            onSelectListView,
            onSubmit,
            error,
        } = this.props;
        const {
            searchText,
            searchResults,
            inSearchMode,
            isSearching,
        } = this.state;
        let listsContent;

        if (isLoading || isSearching) {
            listsContent = <div
                className={Styles.spinner}
                style={{width: "100%", marginTop: 20}}>
                <quip.apps.ui.Spinner size={25}/>
            </div>;
        } else if (error) {
            listsContent = <div className={Styles.errorLoading}>
                {error.message}
            </div>;
        } else {
            const {lists, hasMore} = inSearchMode
                ? searchResults
                : this.getListData_();
            let rows: Array<SalesforceListViewSummary | ListSentinal> = lists;
            if (rows && hasMore) {
                // we add this even if there are no results, since it will
                // immediately trigger a pagination when it renders.
                rows = rows.concat([loaderSentinel]);
            }
            if (!rows || rows.length === 0) {
                listsContent = <div className={Styles.noResult}>
                    {inSearchMode
                        ? _("Press Enter to Search")
                        : _("No Results")}
                </div>;
            } else {
                listsContent = <RowContainer
                    rows={rows}
                    renderRow={(
                        listView: SalesforceListViewSummary | ListSentinal
                    ) =>
                        listView === loaderSentinel ? (
                            <div
                                className={classNames(
                                    Styles.listViewRow,
                                    Styles.loaderRow)}>
                                <quip.apps.ui.Spinner size={14}/>
                            </div>
                        ) : (
                            <div
                                className={classNames(Styles.listViewRow, {
                                    [Styles.highlighted]:
                                        selectedListView === listView,
                                })}>
                                {(listView as SalesforceListViewSummary).label}
                            </div>
                        )
                    }
                    containerClassName={Styles.scrollableList}
                    isActive={true}
                    onSelectionChange={(
                        e: Event,
                        row: SalesforceListViewSummary
                    ) => onSelectListView(row)}
                    onSubmitSelectedRow={onSubmit}
                    ref={r => (this.listViewRef_ = r)}
                    onScroll={
                        !inSearchMode && hasMore ? this.onScroll_ : null
                    }/>;
            }
        }
        return <div className={Styles.listViewFilter}>
            <div className={Styles.searchInput}>
                <SearchIcon/>
                <input
                    type="search"
                    className={Styles.searchInputControl}
                    value={searchText}
                    placeholder={_("Search list views...") as string}
                    onChange={this.updateSearchQuery_}
                    onKeyDown={this.onSearchInputKeyDown_}
                    onFocus={this.onFocusSearchInput_}
                    ref={node => (this.searchInput_ = node)}
                    disabled={!!error}/>
            </div>
            {listsContent}
        </div>;
    }
}
