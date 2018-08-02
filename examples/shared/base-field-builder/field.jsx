// Copyright 2017 Quip

import Styles from "./field.less";
import {
    entityListener,
    formatBoolean,
    formatNumber,
    shallowEqual,
} from "./utils.jsx";
import {BaseMenu} from "../../shared/base-field-builder/base-menu.js";
import GrabberIcon from "./icons/grabber.jsx";
import ArrowIcon from "./icons/arrow.jsx";
import ClearIcon from "./icons/clear.jsx";
import LockIcon from "./icons/lock.jsx";
import CheckmarkIcon from "./icons/checkmark.jsx";
import DropdownIcon from "./icons/dropdown.jsx";
import Dialog from "../dialog/dialog.jsx";
import RowContainer from "./row-container.jsx";
import WarningIcon from "./icons/warning.jsx";
import ErrorPopover from "./error-popover.jsx";

import {
    BooleanFieldEntity,
    DateFieldEntity,
    DateTimeFieldEntity,
    EnumFieldEntity,
    FieldEntity,
    MultipicklistEntity,
    NumericFieldEntity,
    ReferenceFieldEntity,
    TextFieldEntity,
    TokenFieldEntity,
} from "./model/field.js";

import {SortableHandle} from "react-sortable-hoc";

const LOADING_STATUS = {
    UNLOADED: 0,
    LOADING: 1,
    LOADED: 2,
    ERROR: 3,
};

const DragHandle = SortableHandle(() => <div className={Styles.dragHandle}>
    <GrabberIcon/>
</div>);

class Field extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(FieldEntity).isRequired,
        handleKeyEvent: React.PropTypes.func.isRequired,
        menuDelegate: React.PropTypes.instanceOf(BaseMenu).isRequired,
        source: React.PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            commentHover: false,
            validationErrorMessage: null,
            isFocused: false,
            showErrorPopover: false,
        };
        this.renderedEntityProperties_ = {};
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.onMouseDown_);
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.hideDialog_);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.onMouseDown_);
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.hideDialog_);
    }

    onMouseDown_ = e => {
        if (this.fieldDialog_ && !this.fieldDialog_.contains(e.target)) {
            this.hideDialog_();
        }
    };

    hideDialog_ = () => {
        this.setState({fieldDialog: null});
    };

    showMenu_ = e => {
        this.props.menuDelegate.showFieldContextMenu(
            e,
            this.menuButton_,
            this.props.entity);
    };

    showDraftMenu_ = e => {
        if (this.props.entity.isDirty()) {
            this.props.menuDelegate.showDraftContextMenu(
                e,
                this.draftBadge_,
                this.props.entity);
        }
    };

    onMouseEnter_ = () => {
        this.setState({commentHover: true});
    };

    onMouseLeave_ = () => {
        this.setState({commentHover: false});
    };

    onValueClick_ = e => {
        if (this.valueNode_) {
            this.valueNode_.focus();
        }
    };

    validationError = message => {
        this.setState({validationErrorMessage: message});
    };

    onChangeFocus_ = status => {
        this.setState({isFocused: status});
    };

    onMouseEnterError_ = () => {
        this.setState({showErrorPopover: true});
    };

    onMouseLeaveError_ = () => {
        this.setState({showErrorPopover: false});
    };

    shouldComponentUpdate(nextProps, nextState) {
        const isDirty = nextProps.entity.isDirty();
        const label = nextProps.entity.getLabel();
        const key = nextProps.entity.getKey();
        const commentCount = nextProps.entity.getCommentCount();
        const value = nextProps.entity.getValue();
        const originalValue = nextProps.entity.getOriginalValue();
        if (!shallowEqual(this.state, nextState)) {
            return true;
        }
        if (this.renderedEntityProperties_.isDirty != isDirty ||
            this.renderedEntityProperties_.label != label ||
            this.renderedEntityProperties_.key != key ||
            this.renderedEntityProperties_.commentCount != commentCount ||
            this.renderedEntityProperties_.value != value ||
            this.renderedEntityProperties_.originalValue != originalValue) {
            this.renderedEntityProperties_.isDirty = isDirty;
            this.renderedEntityProperties_.label = label;
            this.renderedEntityProperties_.key = key;
            this.renderedEntityProperties_.commentCount = commentCount;
            this.renderedEntityProperties_.value = value;
            this.renderedEntityProperties_.originalValue = originalValue;
            return true;
        }
        return false;
    }

    render() {
        const showComments =
            this.state.commentHover || this.props.entity.getCommentCount() > 0;

        const newValueClassNames = [Styles.newValue];
        const originalValueClassNames = [Styles.originalValue];
        if (this.props.entity.isReadOnly()) {
            newValueClassNames.push(Styles.readOnly);
        } else if (this.props.entity.isDirty()) {
            newValueClassNames.push(Styles.dirty);
            originalValueClassNames.push(Styles.visible);
        }

        let inputComponent;
        if (this.props.entity instanceof TokenFieldEntity) {
            inputComponent = <TokenField
                createDialog={fieldDialog => this.setState({fieldDialog})}
                focused={this.state.isFocused}
                {...this.props}
                onChangeFocus={this.onChangeFocus_}/>;
        } else if (this.props.entity instanceof EnumFieldEntity) {
            inputComponent = <EnumField
                createDialog={fieldDialog => this.setState({fieldDialog})}
                {...this.props}
                onChangeFocus={this.onChangeFocus_}/>;
        } else if (this.props.entity instanceof MultipicklistEntity) {
            inputComponent = <Multipicklist
                createDialog={fieldDialog => this.setState({fieldDialog})}
                {...this.props}/>;
        } else if (this.props.entity instanceof NumericFieldEntity) {
            inputComponent = <NumericField
                ref={node => (this.valueNode_ = node)}
                {...this.props}
                onValidation={this.validationError}/>;
        } else if (this.props.entity instanceof TextFieldEntity) {
            inputComponent = <TextField
                ref={node => (this.valueNode_ = node)}
                {...this.props}
                onValidation={this.validationError}
                onChangeFocus={this.onChangeFocus_}/>;
        } else if (this.props.entity instanceof BooleanFieldEntity) {
            inputComponent = <BooleanField
                {...this.props}
                onChangeFocus={this.onChangeFocus_}/>;
        } else if (this.props.entity instanceof ReferenceFieldEntity) {
            inputComponent = <ReferenceField {...this.props}/>;
        } else if (this.props.entity instanceof DateFieldEntity) {
            inputComponent = <DateField {...this.props}/>;
        } else if (this.props.entity instanceof DateTimeFieldEntity) {
            inputComponent = <DateTimeField {...this.props}/>;
        } else {
            return null;
        }

        let saveError;
        if (!this.state.isFocused &&
            ((this.props.entity instanceof TextFieldEntity &&
                !this.props.entity.isValid()) ||
                (!(this.props.entity instanceof TextFieldEntity) &&
                    this.props.entity.hasSaveError()))) {
            let errorPopover;
            if (this.state.showErrorPopover) {
                errorPopover = <ErrorPopover
                    errorMessage={this.props.entity.getError().getMessage()}/>;
            }
            saveError = <div
                onMouseEnter={this.onMouseEnterError_}
                onMouseLeave={this.onMouseLeaveError_}>
                <WarningIcon/>
                {errorPopover}
            </div>;
        }

        let currencySign;
        if (this.props.entity.getType() === "Currency") {
            currencySign = <div className={Styles.currencySign}>
                {this.props.entity.getCurrencySign()}
            </div>;
        }

        let originalValue = this.props.entity.getOriginalDisplayValue();
        if (this.props.entity instanceof NumericFieldEntity) {
            originalValue = this.props.entity.getOriginalValue();
            originalValue = formatNumber(originalValue);
        } else if (this.props.entity instanceof BooleanFieldEntity) {
            originalValue = this.props.entity.getOriginalValue();
            originalValue = formatBoolean(originalValue);
        }

        let dialog;
        if (this.state.fieldDialog) {
            const rect = this.rootNode_.getBoundingClientRect();
            dialog = <Dialog
                ref={node => (this.fieldDialog_ = ReactDOM.findDOMNode(node))}
                showBackdrop={false}
                onDismiss={this.state.fieldDialog.onDismiss}
                left={this.state.fieldDialog.left - rect.left}
                top={this.state.fieldDialog.top - rect.top}>
                {this.state.fieldDialog.node}
            </Dialog>;
        }
        return <div
            ref={node => (this.rootNode_ = node)}
            className={Styles.field}
            onMouseEnter={this.onMouseEnter_}
            onMouseLeave={this.onMouseLeave_}>
            <div
                className={Styles.label}
                ref={node => (this.props.entity.domNode = node)}>
                <div className={Styles.labelText}>
                    <DragHandle/>
                    {this.props.entity.getLabel()}
                </div>
                <div
                    ref={node => (this.menuButton_ = node)}
                    className={Styles.fieldMenu}
                    onClick={this.showMenu_}>
                    <ArrowIcon/>
                </div>
            </div>
            <div className={Styles.values} onClick={this.onValueClick_}>
                <div className={newValueClassNames.join(" ")}>
                    {inputComponent}
                    <div className={Styles.valueActions}>
                        <div
                            className={
                                showComments
                                    ? Styles.commentWrapper
                                    : Styles.commentWrapperHidden
                            }>
                            <quip.apps.ui.CommentsTrigger
                                className={Styles.commentsTrigger}
                                entity={this.props.entity}
                                showEmpty={true}/>
                        </div>
                        <div
                            title={quiptext("This field is read-only.")}
                            className={Styles.lockIcon}>
                            <LockIcon/>
                        </div>
                        <div className={Styles.status}>
                            <div
                                ref={node => (this.draftBadge_ = node)}
                                className={Styles.badge}
                                style={{
                                    background: quip.apps.ui.Color.GREEN,
                                }}
                                onClick={this.showDraftMenu_}>
                                <div>{quiptext("Draft")}</div>
                                <div>
                                    <ArrowIcon/>
                                </div>
                            </div>
                            <div className={Styles.saveError}>{saveError}</div>
                        </div>
                    </div>
                </div>
                <div className={originalValueClassNames.join(" ")}>
                    <div className={Styles.originalContent}>
                        {currencySign}
                        {originalValue}
                    </div>
                    <div className={Styles.badge}>{this.props.source}</div>
                </div>
            </div>
            {dialog}
        </div>;
    }
}

export default entityListener(Field);

class TextField extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(FieldEntity).isRequired,
        handleKeyEvent: React.PropTypes.func.isRequired,
        onValidation: React.PropTypes.func,
        onChangeFocus: React.PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            commentHover: false,
        };
    }

    handleKeyEvent_ = e => {
        const maxLength = this.props.entity.getMaxLength();
        if (e.keyCode >= 48 &&
            e.keyCode <= 90 &&
            this.props.entity.getDisplayValue() !== null &&
            this.props.entity.getDisplayValue().length >= maxLength) {
            return true;
        } else {
            return this.props.handleKeyEvent(e);
        }
    };

    focus = () => {
        this.props.entity.focus();
    };

    onFocus_ = e => {
        if (this.props.onChangeFocus) {
            this.props.onChangeFocus(true);
        }
    };

    onBlur_ = e => {
        if (this.props.onChangeFocus) {
            this.props.onChangeFocus(false);
        }
        const isValid = this.props.entity.isValid();
        if (!isValid) {
            const message = quiptext("Not valid field value.");
            this.props.onValidation(message);
        } else {
            this.props.onValidation(null);
        }
    };

    render() {
        return <div className={Styles.textField}>
            <quip.apps.ui.RichTextBox
                width="100%"
                minHeight={20}
                maxHeight={300}
                entity={this.props.entity.get("value")}
                allowedStyles={[quip.apps.RichTextEntity.Style.TEXT_PLAIN]}
                handleKeyEvent={this.handleKeyEvent_}
                readOnly={this.props.entity.isReadOnly()}
                disableAutocomplete={true}
                disableInlineMenus={true}
                disableLinkification={true}
                onBlur={this.onBlur_}
                onFocus={this.onFocus_}/>
        </div>;
    }
}

class NumericField extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(FieldEntity).isRequired,
        handleKeyEvent: React.PropTypes.func.isRequired,
        onValidation: React.PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            commentHover: false,
        };
    }

    componentDidMount() {
        // TODO: Should ideally be in NumericFieldEntity.intialize but it didn't
        // seem to work there.
        this.props.entity.format();
    }

    handleKeyEvent_ = e => {
        const maxLength = this.props.entity.getMaxLength();
        const whitelistedKeys = new Set([",", ".", "Backspace"]);
        // Keyboard and keypad numbers
        if ((e.keyCode >= 48 && e.keyCode <= 57) ||
            (e.keyCode >= 96 && e.keyCode <= 105) ||
            whitelistedKeys.has(e.key)) {
            return this.props.handleKeyEvent(e);
        } else {
            return true;
        }
    };

    focus = () => {
        this.props.entity.focus();
    };

    onFocus_ = e => {
        const type = this.props.entity.getType();
        const rawValue = this.props.entity.getRawValue();
        if (type === "Percent" && rawValue && rawValue.slice(-1) === "%") {
            this.props.entity.setValue(rawValue.slice(0, -1));
        }
    };

    onBlur_ = e => {
        const isValid = this.props.entity.isValid();
        if (!isValid) {
            const message = quiptext("Not valid field value.");
            this.props.onValidation(message);
        } else {
            this.props.onValidation(null);
            this.props.entity.format();
        }
    };

    render() {
        let currencySign;
        if (this.props.entity.getType() === "Currency") {
            currencySign = <div className={Styles.currencySign}>
                {this.props.entity.getCurrencySign()}
            </div>;
        }
        return <div className={Styles.textField}>
            {currencySign}
            <quip.apps.ui.RichTextBox
                width="100%"
                minHeight={20}
                maxHeight={300}
                entity={this.props.entity.get("value")}
                allowedStyles={[quip.apps.RichTextEntity.Style.TEXT_PLAIN]}
                handleKeyEvent={this.handleKeyEvent_}
                readOnly={this.props.entity.isReadOnly()}
                disableAutocomplete={true}
                disableInlineMenus={true}
                disableLinkification={true}
                onBlur={this.onBlur_}
                onFocus={this.onFocus_}/>
        </div>;
    }
}

class BooleanField extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(FieldEntity).isRequired,
        handleKeyEvent: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.entity.getValue(),
        };
    }

    componentWillReceiveProps(nextProps) {
        const newValue = nextProps.entity.getValue();
        if (newValue != this.state.value) {
            this.setState({value: newValue});
        }
    }

    onClick_ = e => {
        const newValue = event.target.checked;
        if (newValue !== this.state.value) {
            this.setState({value: newValue});
            this.props.entity.setValue(newValue);
        }
    };

    render() {
        return <div className={Styles.booleanField}>
            <input
                type="checkbox"
                onClick={this.onClick_}
                checked={this.state.value}
                id={this.props.entity.getKey()}
                disabled={this.props.entity.isReadOnly()}/>
            <label for={this.props.entity.getKey()}>
                {formatBoolean(this.state.value)}
            </label>
        </div>;
    }
}

class ReferenceField extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(ReferenceFieldEntity).isRequired,
    };

    onClick_ = e => {
        const record = this.props.entity.getParentRecord();
        const instanceUrl = record.getParentRecord().getInstanceUrl();
        const recordId = this.props.entity.getValue();
        const url = record.getClient().salesforceUrl(instanceUrl, recordId);
        quip.apps.openLink(url);
    };

    render() {
        return <div className={Styles.referenceField} onClick={this.onClick_}>
            {this.props.entity.getDisplayValue()}
        </div>;
    }
}

export class DateField extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(DateFieldEntity).isRequired,
        width: React.PropTypes.number,
    };

    render() {
        return <div
            className={Styles.dateField}
            style={{width: this.props.width}}>
            {this.props.entity.getDisplayValue()}
        </div>;
    }
}

class DateTimeField extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(DateTimeFieldEntity).isRequired,
    };

    render() {
        return <div className={Styles.dateTimeField}>
            {this.props.entity.getDisplayValue()}
        </div>;
    }
}

class EnumDropdown extends React.Component {
    static propTypes = {
        entity: React.PropTypes.oneOfType([
            React.PropTypes.instanceOf(EnumFieldEntity),
            React.PropTypes.instanceOf(MultipicklistEntity),
        ]),
        options: React.PropTypes.array.isRequired,
        onRowClick: React.PropTypes.func.isRequired,
        showCheckmark: React.PropTypes.bool.isRequired,
        selectedIndexes: React.PropTypes.array,
    };

    constructor(props) {
        super(props);
        if (this.props.selectedIndexes) {
            this.state = {
                selectedIndexes: props.selectedIndexes,
            };
        }
    }

    componentDidMount() {
        quip.apps.addDetachedNode(ReactDOM.findDOMNode(this));
    }

    componentWillUnmount() {
        quip.apps.removeDetachedNode(ReactDOM.findDOMNode(this));
    }

    onRowClick_ = (e, option) => {
        if (this.props.selectedIndexes) {
            const index = this.props.options.indexOf(option);
            let selectedIndexes = this.state.selectedIndexes;
            selectedIndexes[index] = !selectedIndexes[index];
            this.setState({selectedIndexes: selectedIndexes});
        }
        this.props.onRowClick(e, option, true);
    };

    renderRow_ = (option, isHighlighted) => {
        const classNames = [Styles.enumRow];
        if (isHighlighted) {
            classNames.push(Styles.enumHighlighted);
        }
        if (option.id !== "free_form" &&
            option.id !== "loading" &&
            option.id !== "no_results") {
            classNames.push(Styles.selectable);

            if (option.serverValue == "") {
                classNames.push(Styles.noValue);
            }
        }

        let checkmarkStyle = {};
        if (!this.props.showCheckmark) {
            checkmarkStyle = {
                display: "none",
            };
        } else if (this.props.entity) {
            let showCheckmark = false;
            if (this.props.selectedIndexes) {
                const index = this.props.options.indexOf(option);
                if (this.state.selectedIndexes[index]) {
                    showCheckmark = true;
                }
            } else if (this.props.entity.getValue().id === option.id) {
                showCheckmark = true;
            }
            if (!showCheckmark) {
                checkmarkStyle = {
                    visibility: "hidden",
                };
            }
        }
        return <div
            className={classNames.join(" ")}
            key={option.id}
            onMouseDown={e => this.onRowClick_(e, option)}>
            <div className={Styles.checkmarkIcon} style={checkmarkStyle}>
                <CheckmarkIcon/>
            </div>
            <div className={Styles.enumLabel}>
                {option.dropdownName || option.name}
            </div>
        </div>;
    };

    render() {
        return <div className={Styles.enumDropdown}>
            <RowContainer
                containerClassName={Styles.enumResult}
                rows={this.props.options}
                renderRow={this.renderRow_}/>
        </div>;
    }
}

export class EnumField extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(EnumFieldEntity).isRequired,
        createDialog: React.PropTypes.func.isRequired,
        onChangeFocus: React.PropTypes.func,
        width: React.PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            commentHover: false,
            dropdown: false,
            options: [],
            optionsLoadingStatus: LOADING_STATUS.UNLOADED,
        };
    }

    componentDidMount() {
        if (this.props.entity.isReadOnly()) {
            return;
        }
        if (!this.props.entity.optionsHasLoaded()) {
            this.setState({optionsLoadingStatus: LOADING_STATUS.LOADING});
        }
        this.props.entity
            .getOptions()
            .then(options => {
                const newValue = options.find(
                    option => option.id == this.props.entity.getDisplayValue());
                if (newValue) {
                    this.setEntityValue(newValue);
                    this.props.entity.setOriginalValue(newValue);
                }
                this.setState({
                    optionsLoadingStatus: LOADING_STATUS.LOADED,
                });
            })
            .catch(error => {
                this.props.entity.setError(error);
                this.setState({optionsLoadingStatus: LOADING_STATUS.ERROR});
            });
    }

    onDropdownHidden_ = () => {
        this.setState({dropdown: false}, () => {
            if (this.props.entity.getAutoCompleteUrl() &&
                this.lastQuery !== null &&
                this.lastQuery !== undefined &&
                this.lastQuery !== this.props.entity.getDisplayValue()) {
                let option;
                if (this.lastQuery.length === 0) {
                    option = this.state.options[0];
                } else {
                    option = {
                        id: "free_form",
                        name: this.lastQuery,
                        serverValue: "",
                        useQuery: true,
                    };
                }
                this.onRowClick_(null, option, false);
            }
        });
    };

    showDropdown_ = () => {
        const boundingRect = this.fieldDom.getBoundingClientRect();
        const node = <EnumDropdown
            entity={this.props.entity}
            options={this.state.options}
            onRowClick={(e, option) => this.onRowClick_(e, option, true)}
            showCheckmark={!this.props.entity.getAutoCompleteUrl()}/>;
        const left = boundingRect.left - 12;
        const top = boundingRect.bottom;
        const onDismiss = this.onDropdownHidden_;
        this.props.createDialog({node, left, top, onDismiss});
    };

    onUpdate_ = () => {
        if (this.props.entity.getAutoCompleteUrl()) {
            let query = this.fieldDom.innerText.trim();
            this.lastQuery = query;
            let client = this.props.entity.getParentRecord().getClient();
            let dummyValue = {
                id: "loading",
                name: "Loading…",
                serverValue: "",
                useQuery: true,
            };
            this.setState(
                {
                    dropdown: true,
                    options: [dummyValue],
                },
                this.showDropdown_);
            client
                .autocomplete(
                    query,
                    this.props.entity.getAutoCompleteUrl(),
                    this.props.entity.getKey())
                .then(map => {
                    if (this.lastQuery === query && this.state.dropdown) {
                        if (map.length === 0) {
                            // Throw to show no results.
                            throw new Error();
                        } else {
                            this.setState(
                                {
                                    options: map,
                                },
                                this.showDropdown_);
                        }
                    }
                })
                .catch(error => {
                    if (this.state.dropdown) {
                        let dummyValue = {
                            id: "no_results",
                            name: "No Results",
                            serverValue: "",
                            useQuery: true,
                        };
                        this.setState(
                            {
                                options: [dummyValue],
                            },
                            this.showDropdown_);
                    }
                });
        }
    };

    onFocus_ = () => {
        this.onUpdate_();
        if (this.props.onChangeFocus) {
            this.props.onChangeFocus(true);
        }
    };

    onBlur_ = e => {
        if (this.props.onChangeFocus) {
            this.props.onChangeFocus(false);
        }
    };

    onClick_ = e => {
        if (this.props.entity.isReadOnly() || quip.apps.isMobile()) {
            return;
        }
        if (this.state.optionsLoadingStatus == LOADING_STATUS.LOADING ||
            this.state.optionsLoadingStatus == LOADING_STATUS.ERROR) {
            return;
        }
        this.props.entity
            .getOptions()
            .then(options => {
                this.setState(
                    {
                        dropdown: true,
                        options: options,
                    },
                    this.showDropdown_);
            })
            .catch(error => {
                this.setState({optionsLoadingStatus: LOADING_STATUS.ERROR});
            });
    };

    onRowClick_ = (e, option, hide) => {
        if (e) {
            e.stopPropagation();
        }
        if (this.props.entity.getAutoCompleteUrl() && option.useQuery) {
            option.name = this.lastQuery;
        } else {
            this.lastQuery = option.name;
        }
        this.setEntityValue(option);
        if (hide) {
            this.props.createDialog(null);
        }
    };

    setEntityValue(option) {
        this.props.entity.setValue(option);
        if (this.props.entity.getAutoCompleteUrl()) {
            this.fieldDom.value = this.props.entity.getDisplayValue();
        }
    }

    render() {
        // TODO: Can we make this just a single RichTextBox? Doing so would
        // require disabling a lot of its functionality but the code seems
        // cleaner.
        if (this.props.entity.getAutoCompleteUrl() &&
            !this.props.entity.isReadOnly() &&
            !quip.apps.isMobile()) {
            return <div className={Styles.autocompleteField}>
                <div
                    contentEditable={true}
                    onBlur={this.onBlur_}
                    onFocus={this.onFocus_}
                    onInput={this.onUpdate_}
                    ref={el => (this.fieldDom = el)}
                    suppressContentEditableWarning={true}
                    style={{width: this.props.width}}>
                    {this.props.entity.getDisplayValue()}
                </div>
            </div>;
        } else {
            let loading;
            if (this.state.optionsLoadingStatus == LOADING_STATUS.LOADING) {
                loading = <quip.apps.ui.Image.Placeholder
                    size={25}
                    loading={true}/>;
                return <div
                    className={Styles.enumField}
                    onClick={this.onClick_}>
                    {loading}
                </div>;
            } else if (this.state.optionsLoadingStatus ==
                LOADING_STATUS.ERROR) {
                //TODO
                return null;
            } else {
                return <div
                    className={Styles.enumField}
                    onClick={this.onClick_}
                    style={{width: this.props.width}}
                    ref={el => (this.fieldDom = el)}>
                    <div>{this.props.entity.getDisplayValue()}</div>
                    {!quip.apps.isMobile() &&
                        !this.props.entity.isReadOnly() && <DropdownIcon/>}
                </div>;
            }
        }
    }
}

export class Multipicklist extends React.Component {
    static propTypes = {
        entity: React.PropTypes.instanceOf(MultipicklistEntity).isRequired,
        createDialog: React.PropTypes.func.isRequired,
        width: React.PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            options: [],
            selectedIndexes: [],
            optionsLoadingStatus: LOADING_STATUS.UNLOADED,
        };
    }

    componentDidMount() {
        if (this.props.entity.isReadOnly()) {
            return;
        }
        if (!this.props.entity.optionsHasLoaded()) {
            this.setState({optionsLoadingStatus: LOADING_STATUS.LOADING});
        }
        this.props.entity
            .getOptions()
            .then(options => {
                const selectedIndexes = this.getSelectedIndexes_(
                    this.props.entity.getValue(),
                    options);
                this.setState({
                    options: options,
                    selectedIndexes: selectedIndexes,
                    optionsLoadingStatus: LOADING_STATUS.LOADED,
                });
            })
            .catch(error => {
                this.props.entity.setError(error);
                this.setState({optionsLoadingStatus: LOADING_STATUS.ERROR});
            });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            selectedIndexes: this.getSelectedIndexes_(
                nextProps.entity.getValue(),
                this.state.options),
        });
    }

    getSelectedIndexes_(value, options) {
        let selectedIndexes = Array(options.length).fill(false);
        const selectedOptions = value ? value.split(";") : [];
        for (let i = 0; i < options.length; i++) {
            if (selectedOptions.indexOf(options[i].id) !== -1) {
                selectedIndexes[i] = true;
            }
        }
        return selectedIndexes;
    }

    showDropdown_ = () => {
        const boundingRect = this.fieldDom.getBoundingClientRect();
        const node = <EnumDropdown
            entity={this.props.entity}
            options={this.state.options}
            selectedIndexes={this.state.selectedIndexes}
            onRowClick={(e, option) => this.onRowClick_(e, option, false)}
            showCheckmark={true}/>;
        const left = boundingRect.left - 12;
        const top = boundingRect.bottom;
        this.props.createDialog({node, left, top});
    };

    onClick_ = e => {
        if (this.props.entity.isReadOnly() || quip.apps.isMobile()) {
            return;
        }
        if (this.state.optionsLoadingStatus == LOADING_STATUS.LOADING ||
            this.state.optionsLoadingStatus == LOADING_STATUS.ERROR) {
            return;
        }
        this.props.entity
            .getOptions()
            .then(options => {
                this.setState(
                    {
                        options: options,
                    },
                    this.showDropdown_);
            })
            .catch(error => {
                this.setState({optionsLoadingStatus: LOADING_STATUS.ERROR});
            });
    };

    onRowClick_ = (e, option, hide) => {
        if (e) {
            e.stopPropagation();
        }
        const index = this.state.options.indexOf(option);
        let selectedIndexes = this.state.selectedIndexes;
        selectedIndexes[index] = !selectedIndexes[index];
        this.setState({selectedIndexes: selectedIndexes});
        const newValue = this.state.options
            .filter((option, i) => selectedIndexes[i])
            .map(option => option.id)
            .join(";");
        this.setEntityValue({id: newValue || null});
        if (hide) {
            this.props.createDialog(null);
        }
    };

    setEntityValue(option) {
        this.props.entity.setValue(option.id);
    }

    render() {
        if (this.state.optionsLoadingStatus == LOADING_STATUS.LOADING) {
            const loading = <quip.apps.ui.Image.Placeholder
                size={25}
                loading={true}/>;
            return <div className={Styles.enumField} onClick={this.onClick_}>
                {loading}
            </div>;
        } else if (this.state.optionsLoadingStatus == LOADING_STATUS.ERROR) {
            //TODO
            return null;
        } else {
            return <div
                className={Styles.enumField}
                onClick={this.onClick_}
                style={{width: this.props.width || "80%"}}
                ref={el => (this.fieldDom = el)}>
                <div>{this.props.entity.getDisplayValue()}</div>
                {!quip.apps.isMobile() &&
                    !this.props.entity.isReadOnly() && <DropdownIcon/>}
            </div>;
        }
    }
}

export class TokenField extends React.Component {
    static propTypes = {
        createDialog: React.PropTypes.func.isRequired,
        dialog: React.PropTypes.bool.isRequired,
        entity: React.PropTypes.instanceOf(FieldEntity).isRequired,
        focused: React.PropTypes.bool.isRequired,
        onChangeFocus: React.PropTypes.func,
        width: React.PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            selected: null,
        };
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.handleClick_);
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.dismissFocus_);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleClick_);
        quip.apps.removeEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.dismissFocus_);
    }

    handleKeyDown_ = e => {
        const items = this.props.entity.getValue().items;
        if (e.which === 8 && this.state.selected) {
            e.preventDefault();
            this.onClearClick_(this.state.selected);
            return false;
        } else if (e.which === 8 &&
            this.inputDom.value === "" &&
            items.length > 0) {
            e.preventDefault();
            this.onTokenClick_(items[items.length - 1]);
            return false;
        } else if (this.state.selected) {
            this.setState({selected: null});
        }
        return true;
    };

    handleClick_ = e => {
        if (this.props.focused &&
            !this.props.dialog &&
            this.fieldDom &&
            !this.fieldDom.contains(e.target)) {
            this.dismissFocus_();
        }
    };

    dismissFocus_ = () => {
        this.props.onChangeFocus(false);
        this.setState({selected: null});
        if (this.inputDom) {
            this.inputDom.value = "";
        }
    };

    onClearClick_(item) {
        const value = this.props.entity.getValue();
        const items = value.items.slice();
        items.splice(items.indexOf(item), 1);
        this.props.entity.setValue({items: items});
        this.setState({selected: null});
    }

    onTokenClick_(item) {
        this.setState({selected: item});
    }

    onUpdate_ = () => {
        let options;
        let query;
        if (this.props.entity.getAutoCompleteUrl()) {
            query = this.inputDom.value.trim();
            this.lastQuery = query;
            let client = this.props.entity.getParentRecord().getClient();
            let dummyValue = {
                id: "loading",
                name: quiptext("Loading…"),
                serverValue: "",
                useQuery: true,
            };
            this.setState({options: [dummyValue]}, this.showDropdown_);
            options = client
                .autocomplete(
                    query,
                    this.props.entity.getAutoCompleteUrl(),
                    this.props.entity.getKey())
                .then(options => {
                    if (this.lastQuery !== query) {
                        throw new Error();
                    } else {
                        return options;
                    }
                });
        } else {
            options = this.props.entity
                .getOptions()
                .then(options =>
                    options.filter(
                        option =>
                            option.name
                                .toLowerCase()
                                .indexOf(this.inputDom.value.toLowerCase()) >=
                            0)
                );
        }
        options
            .then(options =>
                options.filter(
                    option =>
                        !this.props.entity
                            .getValue()
                            .items.find(item => item.id === option.id))
            )
            .then(options => {
                if (options.length == 0) {
                    throw new Error();
                }
                this.setState({options: options}, this.showDropdown_);
            })
            .catch(error => {
                if (!this.props.entity.getAutoCompleteUrl() ||
                    this.lastQuery === query) {
                    this.setState(
                        {
                            options: [
                                {
                                    id: "no_results",
                                    name: quiptext("No Results"),
                                },
                            ],
                        },
                        this.showDropdown_);
                }
            });
    };

    showDropdown_ = () => {
        const boundingRect = this.fieldDom.getBoundingClientRect();
        const node = <EnumDropdown
            entity={this.props.entity}
            options={this.state.options}
            onRowClick={(e, option) => this.onRowClick_(e, option, true)}
            showCheckmark={false}/>;
        const left = boundingRect.left - 12;
        const top = boundingRect.bottom;
        const onDismiss = this.onDropdownHidden_;
        this.props.createDialog({node, left, top, onDismiss});
    };

    onDropdownHidden_ = () => {
        this.lastQuery = null;
    };

    onRowClick_ = (e, option) => {
        if (e) {
            e.stopPropagation();
        }
        if (option.id !== "no_results" && option.id !== "loading") {
            const value = this.props.entity.getValue();
            const items = value.items.slice();
            items.push(option);
            this.props.entity.setValue({items: items});
            this.inputDom.value = "";
        }
        setTimeout(() => this.props.createDialog(null), 0);
    };

    render() {
        const classNames = [Styles.tokenField];
        if (this.props.focused) {
            classNames.push(Styles.tokenFieldFocused);
        }
        return <div
            className={classNames.join(" ")}
            onClick={e => {
                if (this.props.entity.isReadOnly() || quip.apps.isMobile()) {
                    return;
                }
                if (e) {
                    e.stopPropagation();
                }
                if (!this.props.focused) {
                    this.props.onChangeFocus(true);
                } else if (this.inputDom) {
                    this.inputDom.focus();
                }
            }}
            ref={el => (this.fieldDom = el)}
            style={{minHeight: 18, width: this.props.width}}>
            {this.props.entity.getValue().items.map(item => {
                const selected = item === this.state.selected;
                const classNames = [Styles.tokenBox];
                if (selected) {
                    classNames.push(Styles.tokenBoxSelected);
                }
                return <div
                    className={classNames.join(" ")}
                    onClick={
                        this.props.focused
                            ? e => {
                                  this.onTokenClick_(item);
                              }
                            : null
                    }>
                    <div className={Styles.tokenText}>{item.name}</div>
                    {this.props.focused && <div
                        className={Styles.clearIcon}
                        onClick={e => {
                            e.stopPropagation();
                            this.onClearClick_(item);
                        }}>
                        <ClearIcon/>
                    </div>}
                </div>;
            })}
            {this.props.focused && <input
                autoFocus
                onChange={this.onUpdate_}
                onKeyDown={this.handleKeyDown_}
                ref={el => (this.inputDom = el)}/>}
        </div>;
    }
}
