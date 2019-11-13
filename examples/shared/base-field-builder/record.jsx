// Copyright 2017 Quip

import React from "react";
import BaseMenu from "../../shared/base-field-builder/base-menu.js";
import {entityListener, arrayEqual} from "./utils.jsx";
import ErrorPopover from "./error-popover.jsx";
import Field from "./field.jsx";
import FieldPicker from "./field-picker.jsx";
import Styles from "./record.less";
import RecordEntity from "./model/record.js";
import WarningIcon from "./icons/warning.jsx";
import {
    DefaultError,
    InvalidValueError,
    TypeNotSupportedError,
} from "../../shared/base-field-builder/error.js";

import {
    SortableContainer,
    SortableElement,
    arrayMove,
} from "react-sortable-hoc";

const SortableItem = SortableElement(({value}) => {
    return <div>{value}</div>;
});

const SortableList = SortableContainer(({items}) => {
    return <div className={Styles.sortableList}>
        {items.map((value, index) => <SortableItem
            key={`item-${index}`}
            index={index}
            value={value}/>)}
    </div>;
});

class Record extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(RecordEntity).isRequired,
        menuDelegate: React.PropTypes.instanceOf(BaseMenu).isRequired,
        isCreation: React.PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            showFieldPopover: false,
            showAddFieldRow: this.props.entity.getFields().length === 0,
            fieldsOrder: this.props.entity.getFields(),
            query: "",
            hasLoaded: props.entity.hasLoaded(),
            showErrorPopover: false,
            error: null,
            errorMessage: "",
        };
        this.lastFetchedTime_ = null;
        this.isDirty_ = null;
        this.ownerId_ = this.props.entity.getOwnerId();
        this.isLoggedIn_ = this.props.entity.getClient().isLoggedIn();
    }

    componentDidMount() {
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.hideFieldPicker);
        if (this.props.entity.isLoggedIn() &&
            this.props.entity.getClient().onSourceInstance()) {
            this.props.entity
                .fetchData(true, this.props.isCreation)
                .then(() => {
                    this.updateToolbar_();
                    this.setState({
                        hasLoaded: true,
                        showAddFieldRow:
                            this.props.entity.getFields().length === 0,
                    });
                })
                .catch(error => {
                    this.errorHandling(error);
                });
        }
    }

    componentWillReceiveProps(nextProps) {
        const nextFields = nextProps.entity.getFields();
        const currentFields = this.state.fieldsOrder;
        if (!arrayEqual(nextFields, currentFields)) {
            this.setState({
                fieldsOrder: nextFields,
            });
        }
        if (nextProps.entity.isPlaceholder()) {
            this.setState({
                showAddFieldRow: false,
            });
        }
        this.setState({hasLoaded: nextProps.entity.hasLoaded()});
        if (!nextProps.entity.hasLoaded() && !nextProps.entity.isLoading()) {
            nextProps.entity
                .fetchData()
                .then(() => {
                    this.updateToolbar_();
                    this.setState({
                        hasLoaded: true,
                        showAddFieldRow:
                            nextProps.entity.getFields().length === 0,
                    });
                })
                .catch(error => {
                    this.errorHandling(error);
                });
        }

        const currError = this.state.error;
        let hasInvalidField = false;
        nextFields.map(field => {
            if (!field.isValid()) {
                hasInvalidField = true;
            }
        });
        if (hasInvalidField) {
            const nextError = new InvalidValueError();
            this.errorHandling(nextError);
        } else {
            if (currError instanceof InvalidValueError) {
                this.errorHandling(null);
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const lastFetchedTime = this.props.entity.getLastFetchedTime();
        const isDirty = this.props.entity.isDirty();
        const ownerId = this.props.entity.getOwnerId();
        const isLoggedIn = this.props.entity.getClient().isLoggedIn();
        if (this.state.hasLoaded &&
            (this.lastFetchedTime_ !== lastFetchedTime ||
                this.isDirty_ !== isDirty ||
                this.ownerId_ !== ownerId ||
                this.isLoggedIn_ !== isLoggedIn)) {
            this.lastFetchedTime_ = lastFetchedTime;
            this.isDirty_ = isDirty;
            this.ownerId_ = ownerId;
            this.isLoggedIn_ = isLoggedIn;
            this.updateToolbar_();
        }
        this.props.menuDelegate.refreshToolbar();
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.hideFieldPicker);
    }

    render() {
        const error = this.props.entity.getError();
        if (error instanceof TypeNotSupportedError) {
            return <div className={Styles.notSupported}>
                {quiptext(
                    "This Salesforce record type is currently not supported.")}
            </div>;
        }

        if (!this.state.hasLoaded) {
            return <quip.apps.ui.Spinner size={25} loading={true}/>;
        }

        let fieldPicker;
        if (this.state.showFieldPopover) {
            fieldPicker = <FieldPicker
                entity={this.props.entity}
                query={this.state.query}
                downwardsOffset={35}
                upwardsOffset={10}
                onSelectField={this.addField_}/>;
        }

        let addFieldRow;
        if (this.state.showAddFieldRow) {
            addFieldRow = <div
                className={Styles.filterBar}
                onClick={e => this.onClick_(e)}>
                <div className={Styles.filterInput}>
                    <input
                        onChange={this.onChange_}
                        onKeyUp={this.onKeyUp_}
                        onFocus={this.showFieldPicker}
                        value={this.state.query}
                        placeholder={quiptext("Add a field")}
                        ref={node => (this.textInput_ = node)}/>
                </div>
                {fieldPicker}
            </div>;
        }

        let fields;
        if (this.state.fieldsOrder.length) {
            fields = <SortableList
                items={this.state.fieldsOrder.map(field => <Field
                    entity={field}
                    key={field.getKey()}
                    handleKeyEvent={this.handleKeyEvent_}
                    menuDelegate={this.props.menuDelegate}
                    source={this.props.entity.getSource()}/>)}
                onSortEnd={this.onSortEnd_}
                useDragHandle={true}/>;
        }

        return <div
            className={Styles.root}
            onClick={this.hideFieldPickerPopover_}>
            <RecordHeader
                entity={this.props.entity}
                errorMessage={this.state.errorMessage}
                showErrorPopover={this.state.showErrorPopover}
                onMouseEnterError={this.showErrorPopover_}
                onMouseLeaveError={this.hideErrorPopover_}/>
            <div className={Styles.rowContainer}>
                {fields}
                {addFieldRow}
            </div>
        </div>;
    }

    errorHandling = error => {
        if (!error) {
            this.setState({
                error: null,
                errorMessage: "",
            });
        } else {
            console.error(error);
            let setError = error;
            if (!(error instanceof DefaultError)) {
                setError = new DefaultError(quiptext("Could Not Connect."));
            }
            this.setState({
                error: setError,
                errorMessage: setError.toString(),
                showErrorPopover: true,
            });
            setTimeout(() => {
                this.setState({showErrorPopover: false});
            }, 10000);
        }
    };

    clearError = () => {
        this.setState({
            error: null,
            errorMessage: "",
        });
    };

    updateToolbar_ = () => {
        this.props.menuDelegate.updateToolbar(this.props.entity);
    };

    saveRecord = () => {
        this.props.entity
            .save()
            .then(() => {
                this.errorHandling(this.props.entity.getError());
                this.updateToolbar_();
                this.props.menuDelegate.refreshToolbar();
            })
            .catch(error => {
                this.errorHandling(error);
                this.updateToolbar_();
                this.props.menuDelegate.refreshToolbar();
            });
        this.updateToolbar_();
        this.props.menuDelegate.refreshToolbar();
    };

    onKeyUp_ = e => {
        if (e.key === "Escape") {
            this.hideFieldPicker();
            return;
        }
    };

    onChange_ = e => {
        this.setState({
            query: e.target.value,
            showFieldPopover: true,
        });
    };

    addField_ = (e, field) => {
        this.setState({query: ""});
        this.props.entity.addField(field.key);
    };

    onClick_ = e => {
        e.stopPropagation();
    };

    focusInput_ = () => {
        if (this.textInput_) {
            this.textInput_.focus();
        }
    };

    onSortEnd_ = ({oldIndex, newIndex}) => {
        const {fieldsOrder} = this.state;
        const metricArgs = {
            action: "moved_field",
            record_type: this.props.entity.getType(),
            field_key: fieldsOrder[oldIndex].getKey(),
            fields_count: String(fieldsOrder.length),
            old_index: String(oldIndex),
            new_index: String(newIndex),
        };
        const metricName = this.props.entity.getMetricName();
        quip.apps.recordQuipMetric(metricName, metricArgs);
        this.props.entity
            .getFieldsListEntity()
            .move(fieldsOrder[oldIndex], newIndex);
        this.setState({
            fieldsOrder: arrayMove(fieldsOrder, oldIndex, newIndex),
        });
        this.props.entity.saveFieldPreferences();
    };

    setRecordId_ = e => {
        this.props.entity.setRecordId(e.target.value);
    };

    hideFieldPickerPopover_ = e => {
        this.setState({
            showFieldPopover: false,
            showErrorPopover: false,
        });
    };

    hideFieldPicker = e => {
        this.setState({
            showFieldPopover: false,
            showAddFieldRow: this.props.entity.getFields().length === 0,
            showErrorPopover: false,
            query: "",
        });
    };

    showFieldPicker = e => {
        if (!this.state.showFieldPopover) {
            this.setState(
                {
                    showFieldPopover: true,
                    showAddFieldRow: true,
                },
                this.focusInput_);
        }
    };

    showErrorPopover_ = () => {
        this.setState({
            showErrorPopover: true,
        });
    };

    hideErrorPopover_ = () => {
        this.setState({
            showErrorPopover: false,
        });
    };

    handleKeyEvent_ = e => {
        if (e.altKey || e.metaKey) {
            return false;
        }
        if (e.keyCode != 9) {
            return false;
        }
        // Tab and Shift-Tab to move focus
        let focusedField = quip.apps.getFocusedRichTextRecord();
        if (!focusedField) {
            return;
        }

        focusedField = focusedField.getParent();
        let fieldToFocus = e.shiftKey
            ? focusedField.getPreviousSibling()
            : focusedField.getNextSibling();
        while (fieldToFocus && fieldToFocus.isReadOnly()) {
            fieldToFocus = e.shiftKey
                ? fieldToFocus.getPreviousSibling()
                : fieldToFocus.getNextSibling();
        }
        if (!fieldToFocus) {
            return false;
        }
        focusedField.clearFocus();
        fieldToFocus.focus(e.shiftKey);
        return true;
    };
}

export default entityListener(Record);

class RecordHeader extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(RecordEntity).isRequired,
        errorMessage: React.PropTypes.string,
        showErrorPopover: React.PropTypes.bool,
        onMouseEnterError: React.PropTypes.func,
        onMouseLeaveError: React.PropTypes.func,
    };

    onClick_ = e => {
        this.props.entity.openLink();
    };

    render() {
        const {
            entity,
            showErrorPopover,
            errorMessage,
            onMouseEnterError,
            onMouseLeaveError,
        } = this.props;
        const demoWarning = entity.getDemoText();
        let errorPopover;
        if (showErrorPopover) {
            errorPopover = <ErrorPopover errorMessage={errorMessage}/>;
        }
        const hasError = errorMessage && errorMessage.length > 0;
        let errorIndicator;
        let demoIndicator;
        const isExplorerTemplate = quip.apps.isExplorerTemplate
            ? quip.apps.isExplorerTemplate()
            : false;
        if (hasError && !isExplorerTemplate && !quip.apps.isMobile()) {
            errorIndicator = <div
                className={Styles.warning}
                onMouseEnter={onMouseEnterError}
                onMouseLeave={onMouseLeaveError}>
                <div className={Styles.warningText}>{quiptext("Error")}</div>
                <WarningIcon/>
                {errorPopover}
            </div>;
        } else if (demoWarning) {
            demoIndicator = <div className={Styles.demoWarning}>
                <WarningIcon/> {demoWarning}
            </div>;
        }

        const recordNameClassNames = [Styles.name];
        if (!entity.isPlaceholder()) {
            recordNameClassNames.push(Styles.hoverableLink);
        }
        return <div className={Styles.header}>
            <div className={Styles.headerInfo}>
                <div
                    className={recordNameClassNames.join(" ")}
                    onClick={this.onClick_}>
                    {entity.getHeaderName()}
                </div>
                <div className={Styles.type}>{entity.getLabelSingular()}</div>
            </div>
            {demoIndicator}
            {errorIndicator}
        </div>;
    }
}
