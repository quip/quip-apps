// Copyright 2019 Quip

import React, {StatelessComponent, Component, ChangeEvent} from "react";
import PropTypes, {InferProps} from "prop-types";
import quip from "quip-apps-api";
import _ from "quiptext";
import classNames from "classnames";
import {
    listDividerSentinel,
    moreListsSentinel,
    ListSentinal,
    isNavigationItem,
} from "./list-picker";
import SearchIcon from "./search-icon";
import RowContainer from "../../shared/base-field-builder/row-container.jsx";
import Styles from "./list-picker.less";
import {SalesforceNavigationItem} from "../lib/salesforce-types";

interface ListTypePickerProps
    extends InferProps<typeof ListTypePicker.propTypes> {
    listTypes: Array<SalesforceNavigationItem | ListSentinal>;
    availableObjects: Set<string>;
    selectedListType: SalesforceNavigationItem;
    onSelectListType: (type: SalesforceNavigationItem | ListSentinal) => void;
}
interface ListTypePickerState {
    filter: string;
}

export default class ListTypePicker extends Component<
    ListTypePickerProps,
    ListTypePickerState
> {
    static propTypes = {
        listTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
        availableObjects: PropTypes.instanceOf(Set).isRequired,
        selectedListType: PropTypes.object,
        onSelectListType: PropTypes.func.isRequired,
        isLoading: PropTypes.bool.isRequired,
        isShowingAllTypes: PropTypes.bool.isRequired,
    };

    private searchInput_: HTMLInputElement;

    constructor(props: ListTypePickerProps) {
        super(props);
        this.state = {filter: ""};
    }

    renderRow_ = (type: SalesforceNavigationItem | ListSentinal) => {
        const {
            isLoading,
            onSelectListType,
            selectedListType,
            availableObjects,
        } = this.props;
        if (type === listDividerSentinel) {
            return <div className={Styles.listTypesHR}>
                <hr/>
            </div>;
        }
        if (type === moreListsSentinel) {
            return <div
                className={Styles.listTypeRow}
                onClick={() => onSelectListType(type)}>
                {_("More")}{" "}
                <div className={Styles.spinner}>
                    {isLoading ? (
                        <quip.apps.ui.Spinner size={14}/>
                    ) : (
                        <svg className={Styles.chevronIcon} viewBox="0 0 18 10">
                            <Chevron/>
                        </svg>
                    )}
                </div>
            </div>;
        }
        if (isNavigationItem(type)) {
            const isAvailable = availableObjects.has(type.objectApiName);
            return <div
                className={classNames(Styles.listTypeRow, {
                    [Styles.highlighted]: selectedListType === type,
                    [Styles.disabled]: !isAvailable,
                })}
                onClick={isAvailable ? () => onSelectListType(type) : null}
                title={
                    isAvailable
                        ? type.developerName
                        : (_("%(typeName)s - unavailable", {
                              typeName: type.developerName,
                          }) as string)
                }>
                {type.label}
            </div>;
        }
        return null;
    };

    public focusInput = () => {
        if (this.searchInput_) {
            this.searchInput_.focus();
        }
    };

    private updateFilter_ = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({filter: e.currentTarget.value.toLowerCase()});
    };

    render() {
        let {listTypes, isShowingAllTypes} = this.props;
        const {filter} = this.state;
        if (filter.length > 0) {
            listTypes = listTypes.filter(
                type =>
                    isNavigationItem(type) &&
                    type.developerName.toLowerCase().includes(filter));
        }
        return <div className={Styles.listTypePicker}>
            {isShowingAllTypes ? (
                <div className={Styles.searchInput}>
                    <SearchIcon/>
                    <input
                        ref={node => (this.searchInput_ = node)}
                        className={Styles.searchInputControl}
                        value={filter}
                        placeholder={_("Filter types...") as string}
                        onChange={this.updateFilter_}/>
                </div>
            ) : null}
            <RowContainer
                rows={listTypes}
                renderRow={this.renderRow_}
                containerClassName={Styles.scrollableList}/>
        </div>;
    }
}

const Chevron: StatelessComponent = () => <path
    className={Styles.svgPath}
    d="M8.993,11.994A1,1,0,0,1,8.285,11.7L4.28,7.7A1,1,0,0,1,5.7,6.291l3.3,3.29,3.3-3.29A1,1,0,0,1,13.706,7.7L9.7,11.7A1,1,0,0,1,8.993,11.994Z"/>;
