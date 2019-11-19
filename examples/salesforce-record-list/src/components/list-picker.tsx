// Copyright 2019 Quip

import React, {Component, MouseEvent} from "react";
import PropTypes, {InferProps} from "prop-types";
import quip from "quip-apps-api";
import _ from "quiptext";
import {DEFAULT_LIST_TYPES} from "../config";
import {
    SalesforceNavigationItem,
    SalesforceListViewSummary,
} from "../lib/salesforce-types";
import ListTypePicker from "./list-type-picker";
import ListViewFilter from "./list-view-filter";
import {ListsResponseData} from "../model/lists-response";
import Dialog from "../../shared/dialog/dialog.jsx";
import Styles from "./list-picker.less";

export const listDividerSentinel = {SENTINEL_VALUE: "LIST_DIVIDER" as const};
export const moreListsSentinel = {SENTINEL_VALUE: "MORE_LISTS" as const};
export const loaderSentinel = {SENTINEL_VALUE: "LOADER" as const};
export type ListSentinal =
    | typeof listDividerSentinel
    | typeof moreListsSentinel
    | typeof loaderSentinel;

export const isNavigationItem = (
    item: SalesforceNavigationItem | ListSentinal
): item is SalesforceNavigationItem => {
    if (item === listDividerSentinel ||
        item === moreListsSentinel ||
        item === loaderSentinel) {
        return false;
    }
    return true;
};

interface ListPickerProps extends InferProps<typeof ListPicker.propTypes> {
    listTypes?: SalesforceNavigationItem[];
    listViews: Map<string, ListsResponseData>;
    availableObjects: Set<string>;
    onFetchListTypes: () => Promise<unknown>;
    onFetchLists: (type: SalesforceNavigationItem, pageToken?: string) => void;
    onSelectList: (id: string, type: string) => void;
    onSearchLists: (
        type: SalesforceNavigationItem,
        query: string
    ) => Promise<ListsResponseData>;
    onDismiss: () => void;
}
interface ListPickerState {
    isShowingAllTypes: boolean;
    selectedListType?: SalesforceNavigationItem;
    selectedListView: SalesforceListViewSummary;
}

export default class ListPicker extends Component<
    ListPickerProps,
    ListPickerState
> {
    static propTypes = {
        listTypes: PropTypes.array,
        listViews: PropTypes.instanceOf(Map).isRequired,
        availableObjects: PropTypes.instanceOf(Set).isRequired,
        isLoadingLists: PropTypes.bool.isRequired,
        isLoadingListTypes: PropTypes.bool.isRequired,
        isFetchingMoreLists: PropTypes.bool.isRequired,
        onFetchListTypes: PropTypes.func.isRequired,
        onFetchLists: PropTypes.func.isRequired,
        onSelectList: PropTypes.func.isRequired,
        onSearchLists: PropTypes.func.isRequired,
        onDismiss: PropTypes.func.isRequired,
        error: PropTypes.instanceOf(Error),
    };

    private typePicker_: ListTypePicker;

    constructor(props: ListPickerProps) {
        super(props);
        this.state = {
            isShowingAllTypes: false,
            selectedListView: null,
        };
    }

    componentDidMount() {
        this.fetchListViews_();
    }

    componentDidUpdate(prevProps: ListPickerProps, prevState: ListPickerState) {
        const getSelectedListType = (state: ListPickerState) =>
            state.selectedListType
                ? state.selectedListType.objectApiName
                : null;
        if (getSelectedListType(this.state) !==
            getSelectedListType(prevState)) {
            this.fetchListViews_();
        }
    }

    showAllTypes_ = () => {
        const {isShowingAllTypes} = this.state;
        if (!isShowingAllTypes) {
            const {onFetchListTypes} = this.props;
            onFetchListTypes();
            this.setState({isShowingAllTypes: true}, () => {
                if (this.typePicker_) {
                    // focus the search bar when expanding to the full list
                    this.typePicker_.focusInput();
                }
            });
        }
    };

    fetchListViews_ = () => {
        const {onFetchLists} = this.props;
        const selectedListType = this.getSelectedListType_();
        onFetchLists(selectedListType);
    };

    fetchMoreLists_ = (pageToken: string) => {
        const {onFetchLists} = this.props;
        const selectedListType = this.getSelectedListType_();
        onFetchLists(selectedListType, pageToken);
    };

    selectListType_ = (
        selectedListType: SalesforceNavigationItem | typeof moreListsSentinel
    ) => {
        if (isNavigationItem(selectedListType)) {
            this.setState({selectedListType}, this.fetchListViews_);
        }
        if (selectedListType === moreListsSentinel) {
            this.showAllTypes_();
        }
    };

    selectListView_ = (selectedListView: SalesforceListViewSummary | null) => {
        this.setState({selectedListView});
    };

    submitSelectedListView_ = (e?: MouseEvent<HTMLDivElement>) => {
        const {selectedListView} = this.state;
        this.props.onSelectList(
            selectedListView.id,
            this.getSelectedListType_().objectApiName);
    };

    getListTypes_(): Array<SalesforceNavigationItem | ListSentinal> {
        const {isShowingAllTypes} = this.state;
        const {listTypes} = this.props;
        if (listTypes.length && isShowingAllTypes) {
            return listTypes;
        }
        return [...DEFAULT_LIST_TYPES, listDividerSentinel, moreListsSentinel];
    }

    getSelectedListType_(): SalesforceNavigationItem {
        const selectedList =
            this.state.selectedListType || this.getListTypes_()[0];
        if (isNavigationItem(selectedList)) {
            return selectedList;
        }
        return DEFAULT_LIST_TYPES[0];
    }

    render() {
        const {
            listViews,
            availableObjects,
            onDismiss,
            isFetchingMoreLists,
            isLoadingListTypes,
            isLoadingLists,
            onSearchLists,
            error,
        } = this.props;
        const {selectedListView, isShowingAllTypes} = this.state;
        const listTypes = this.getListTypes_();
        const selectedListType = this.getSelectedListType_();

        return <Dialog onDismiss={onDismiss}>
            <div className={Styles.dialog}>
                <div className={Styles.header}>{_("Select List View")}</div>
                <div className={Styles.picker}>
                    <ListTypePicker
                        ref={ref => (this.typePicker_ = ref)}
                        listTypes={listTypes}
                        availableObjects={availableObjects}
                        selectedListType={selectedListType}
                        onSelectListType={this.selectListType_}
                        isLoading={isLoadingListTypes}
                        isShowingAllTypes={isShowingAllTypes}/>
                    <div className={Styles.columnGroup}>
                        <ListViewFilter
                            error={error}
                            listViews={listViews}
                            isLoading={isLoadingLists}
                            isFetchingMoreLists={isFetchingMoreLists}
                            selectedListType={selectedListType}
                            selectedListView={selectedListView}
                            onSelectListView={this.selectListView_}
                            onFetchMore={this.fetchMoreLists_}
                            onSearch={onSearchLists}
                            onSubmit={this.submitSelectedListView_}/>
                    </div>
                </div>
                <div className={Styles.actions}>
                    <quip.apps.ui.Button
                        text={_("Cancel") as string}
                        onClick={onDismiss}/>
                    <quip.apps.ui.Button
                        primary={true}
                        disabled={selectedListView === null}
                        text={_("OK") as string}
                        onClick={this.submitSelectedListView_}/>
                </div>
            </div>
        </Dialog>;
    }
}
