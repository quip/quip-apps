// Copyright 2019 Quip

import _ from "quiptext";
import quip from "quip-apps-api";
import React, {Component} from "react";
import PropTypes, {InferProps} from "prop-types";
import Icon from "./icon";
import Styles from "./dueling-dialog.less";
import Dialog from "../../shared/dialog/dialog.jsx";

/**
 * @fileoverview A dialog containing a dueling picklist
 * (see https://lightningdesignsystem.com/components/dueling-picklist)
 * This is generally useful for creating a short, sorted list from a long,
 * unsorted list. For instance, selecting an ordered subset of columns.
 *
 * Pass an array of options, which are objects with `id` and `label` keys.
 * Selected IDs are IDs that appear in the right side of the dueling picklist,
 * highlghted IDs are IDs that are currently interactive, e.g. pressing one
 * of the arrows will move them (either between lists or up and down in the
 * selected list). When the user commits the selection, onCommitSelection will
 * be invoked with the new list of selected IDs.
 */
interface DuelingDialogOption {
    id: string;
    label: string;
}
interface DuelingDialogProps
    extends InferProps<typeof DuelingDialog.propTypes> {
    options: DuelingDialogOption[];
    initiallySelectedIds: string[];
    onCommitSelection: (selectedIds: string[]) => void;
    onDismiss: () => void;
}

interface DuelingDialogState {
    selectedIds: string[];
    highlightedIds: Set<string>;
}

export default class DuelingDialog extends Component<
    DuelingDialogProps,
    DuelingDialogState
> {
    static propTypes = {
        options: PropTypes.array.isRequired,
        optionName: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        subtitle: PropTypes.string,
        hideCancel: PropTypes.bool,
        initiallySelectedIds: PropTypes.array.isRequired,
        onCommitSelection: PropTypes.func.isRequired,
        onDismiss: PropTypes.func.isRequired,
    };

    static defaultProps = {
        optionName: _("Fields"),
        title: _("Choose Fields"),
    };

    constructor(props: DuelingDialogProps) {
        super(props);
        const optionMap = new Map(props.options.map(o => [o.id, o]));
        const selectedIds = props.initiallySelectedIds.filter(id => {
            if (!optionMap.get(id)) {
                console.error(
                    `Found a selected option "${id}" that has no corresponding available option.`);
                return false;
            }
            return true;
        });
        this.state = {
            selectedIds,
            highlightedIds: new Set(),
        };
    }

    dismissAndCommit_ = () => {
        const {onDismiss, onCommitSelection} = this.props;
        const {selectedIds} = this.state;
        onDismiss();
        onCommitSelection(selectedIds);
    };

    selectId_ = (id: string, multi: boolean) => {
        let {highlightedIds} = this.state;
        if (highlightedIds.has(id)) {
            highlightedIds.delete(id);
        } else if (multi) {
            highlightedIds.add(id);
        } else {
            highlightedIds = new Set([id]);
        }
        this.setState({highlightedIds});
    };

    renderOption_ = (option: DuelingDialogOption, idx: number) => {
        const {highlightedIds} = this.state;
        return <li
            key={option.id}
            role="presentation"
            className="slds-listbox__item">
            <div
                className="slds-listbox__option slds-listbox__option_plain slds-media slds-media_small slds-media_inline"
                aria-selected={highlightedIds.has(option.id)}
                draggable={true}
                role="option"
                tabIndex={0}
                onClick={e => this.selectId_(option.id, e.metaKey)}>
                <span className="slds-media__body">
                    <span className="slds-truncate" title={option.label}>
                        {option.label}
                    </span>
                </span>
            </div>
        </li>;
    };

    /**
     * Moves the currently highlighted IDs from one side to the other.
     * Moving left deselects them moving right selects them.
     * @param {bool} right - pass true to move right, false to move left
     */
    moveHighlightedIds_ = (right: boolean) => {
        const {highlightedIds} = this.state;
        let selectedIds = this.state.selectedIds;
        if (right) {
            // Moving right adds to selectedIds
            highlightedIds.forEach(id => {
                selectedIds.push(id);
            });
        } else {
            // Moving left removes the items from selectedIds
            selectedIds = selectedIds.filter(id => !highlightedIds.has(id));
        }
        this.setState({selectedIds});
    };

    /**
     * Moves the currently highlighted IDs up or down the selected list.
     * If more than one item is selected and we reach the top, it just
     * stays there until all the items are in their original order at
     * the top of the list.
     * @param {bool} up - pass true to move up, false to move down
     */
    sortHighlightedIds_ = (up: boolean) => {
        const {highlightedIds, selectedIds} = this.state;
        let ids = up ? selectedIds : selectedIds.reverse();
        ids.forEach((id, idx) => {
            if (highlightedIds.has(id) && idx > 0) {
                // Swap with the item above it
                const prev = ids[idx - 1];
                if (highlightedIds.has(prev)) {
                    // Unless it is also selected (which just cascades the idx == 0 case,
                    // otherwise it already would have been swapped.)
                    return;
                }
                ids[idx - 1] = id;
                ids[idx] = prev;
            }
        });
        this.setState({selectedIds: up ? ids : ids.reverse()});
    };

    render() {
        const {
            options,
            title,
            subtitle,
            onDismiss,
            optionName,
            hideCancel,
        } = this.props;
        const {selectedIds} = this.state;
        const selectedSet = new Set(selectedIds);
        const optionMap = new Map();

        const availableOptions = options.filter(o => {
            optionMap.set(o.id, o);
            return !selectedSet.has(o.id);
        });
        const selectedOptions = selectedIds.map(id => optionMap.get(id));

        const listOneTitle = _("Available %(optionName)s", {optionName});
        const listTwoTitle = _("Selected %(optionName)s", {optionName});

        return <Dialog onDismiss={onDismiss}>
            <div>
                <div id="picklist-group-label" className={Styles.header}>
                    <h2>{title}</h2>
                </div>
                <div className={Styles.picker}>
                    {subtitle ? (
                        <div className={Styles.subtitle}>
                            <span>{subtitle}</span>
                        </div>
                    ) : null}
                    <section role="dialog">
                        <div className="slds-popover__body">
                            <div
                                className="slds-form-element"
                                role="group"
                                aria-labelledby="picklist-group-label">
                                <div className="slds-form-element__control">
                                    <div className="slds-dueling-list">
                                        <div
                                            className="slds-assistive-text"
                                            id="drag-live-region"
                                            aria-live="assertive"/>
                                        <div
                                            className="slds-assistive-text"
                                            id="option-drag-label">
                                            {_(
                                                "Press space bar when on an item, to move it within the list. CMD plus left and right arrow keys, to move items between lists.")}
                                        </div>
                                        <div className="slds-dueling-list__column">
                                            <span
                                                className="slds-form-element__label"
                                                id="label-1">
                                                {listOneTitle}
                                            </span>
                                            <div className="slds-dueling-list__options">
                                                <ul
                                                    aria-describedby="option-drag-label"
                                                    aria-labelledby="label-1"
                                                    aria-multiselectable="true"
                                                    className="slds-listbox slds-listbox_vertical"
                                                    role="listbox">
                                                    {availableOptions.map(
                                                        this.renderOption_)}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="slds-dueling-list__column">
                                            <button
                                                className="slds-button slds-button_icon slds-button_icon-container"
                                                title={
                                                    _(
                                                        "Move Selection to %(listTwoTitle)s",
                                                        {
                                                            listTwoTitle,
                                                        }) as string
                                                }
                                                onClick={() =>
                                                    this.moveHighlightedIds_(
                                                        true)
                                                }>
                                                <Icon
                                                    object="right"
                                                    type="utility"
                                                    size="x-small"/>
                                                <span className="slds-assistive-text">
                                                    {_(
                                                        "Move Selection to %(listTwoTitle)s",
                                                        {listTwoTitle})}
                                                </span>
                                            </button>
                                            <button
                                                className="slds-button slds-button_icon slds-button_icon-container"
                                                title={
                                                    _(
                                                        "Move Selection to %(listOneTitle)s",
                                                        {
                                                            listOneTitle,
                                                        }) as string
                                                }
                                                onClick={() =>
                                                    this.moveHighlightedIds_(
                                                        false)
                                                }>
                                                <Icon
                                                    object="left"
                                                    type="utility"
                                                    size="x-small"/>
                                                <span className="slds-assistive-text">
                                                    {_(
                                                        "Move Selection to %(listOneTitle)s",
                                                        {listOneTitle})}
                                                </span>
                                            </button>
                                        </div>
                                        <div className="slds-dueling-list__column">
                                            <span
                                                className="slds-form-element__label"
                                                id="label-2">
                                                {listTwoTitle}
                                            </span>
                                            <div className="slds-dueling-list__options">
                                                <ul
                                                    aria-describedby="option-drag-label"
                                                    aria-labelledby="label-2"
                                                    aria-multiselectable="true"
                                                    className="slds-listbox slds-listbox_vertical"
                                                    role="listbox">
                                                    {selectedOptions.map(
                                                        this.renderOption_)}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="slds-dueling-list__column">
                                            <button
                                                className="slds-button slds-button_icon slds-button_icon-container"
                                                title={
                                                    _(
                                                        "Move Selection Up") as string
                                                }
                                                onClick={() =>
                                                    this.sortHighlightedIds_(
                                                        true)
                                                }>
                                                <Icon
                                                    object="up"
                                                    type="utility"
                                                    size="x-small"/>
                                                <span className="slds-assistive-text">
                                                    {_("Move Selection Up")}
                                                </span>
                                            </button>
                                            <button
                                                className="slds-button slds-button_icon slds-button_icon-container"
                                                title={
                                                    _(
                                                        "Move Selection Down") as string
                                                }
                                                onClick={() =>
                                                    this.sortHighlightedIds_(
                                                        false)
                                                }>
                                                <Icon
                                                    object="down"
                                                    type="utility"
                                                    size="x-small"/>
                                                <span className="slds-assistive-text">
                                                    {_("Move Selection Down")}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <div className={Styles.actions}>
                    {!hideCancel ? (
                        <quip.apps.ui.Button
                            text={_("Cancel") as string}
                            onClick={onDismiss}/>
                    ) : null}
                    <quip.apps.ui.Button
                        primary={true}
                        text={_("Save") as string}
                        onClick={this.dismissAndCommit_}/>
                </div>
            </div>
        </Dialog>;
    }
}
