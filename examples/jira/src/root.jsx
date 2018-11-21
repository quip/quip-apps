// Copyright 2017 Quip

import Dialog from "../../shared/dialog/dialog.jsx";
import JiraPicker from "./jira-picker.jsx";
import PlaceholderData from "./placeholder-data.js";
import Record from "../../shared/base-field-builder/record.jsx";
import RecordList from "../../shared/base-field-builder/record-list.jsx";
import Styles from "./root.less";
import {getDefaultFilter} from "./jira-picker.jsx";
import {JiraDatasource, MAX_RECORDS_LIST} from "./datasource.js";
import {JiraMenu} from "./jira-menu.js";
import {JiraRecentEntity} from "./model/jira-recent-record.js";
import {JiraRecordEntity} from "./model/jira-record.js";
import {JiraRootEntity} from "./model/jira-root.js";
import {paginatedRecordList} from "../../shared/base-field-builder/paginated-record-list.jsx";

import {ColumnRecord, StatusTypeRecord} from "../../shared/table-view/model.js";

import {
    BooleanFieldEntity,
    DateFieldEntity,
    EnumFieldEntity,
    FieldEntity,
    TextFieldEntity,
    TokenFieldEntity,
} from "../../shared/base-field-builder/model/field.js";

// TODO (from Pedram): actually replace quip.apps.ui.Image.Placeholder with
// quip.apps.ui.Spinner in code when enough clients have it.
if (quip.apps.ui.Spinner) {
    quip.apps.ui.Image.Placeholder = quip.apps.ui.Spinner;
}

quip.apps.registerClass(JiraRootEntity, JiraRootEntity.ID);
quip.apps.registerClass(JiraRecentEntity, JiraRecentEntity.ID);
quip.apps.registerClass(JiraRecordEntity, JiraRecordEntity.ID);
quip.apps.registerClass(BooleanFieldEntity, BooleanFieldEntity.ID);
quip.apps.registerClass(ColumnRecord, ColumnRecord.CONSTRUCTOR_KEY);
quip.apps.registerClass(DateFieldEntity, DateFieldEntity.ID);
quip.apps.registerClass(EnumFieldEntity, EnumFieldEntity.ID);
quip.apps.registerClass(FieldEntity, FieldEntity.ID);
quip.apps.registerClass(StatusTypeRecord, StatusTypeRecord.CONSTRUCTOR_KEY);
quip.apps.registerClass(TextFieldEntity, TextFieldEntity.ID);
quip.apps.registerClass(TokenFieldEntity, TokenFieldEntity.ID);

const menuDelegate = new JiraMenu();

const Step = {
    LOADING: Symbol(),
    LOGIN: Symbol(),
    PICKING: Symbol(),
    LIST: Symbol(),
    DETAIL: Symbol(),
    HOST_URL: Symbol(),
};

const MAX_ELEMENT_WIDTH = 650;

const PaginatedRecordList = paginatedRecordList(RecordList);

class Root extends React.Component {
    static propTypes = {
        auth: React.PropTypes.instanceOf(quip.apps.Auth).isRequired,
        entity: React.PropTypes.instanceOf(JiraRootEntity).isRequired,
        menuDelegate: React.PropTypes.instanceOf(JiraMenu).isRequired,
        client: React.PropTypes.instanceOf(JiraDatasource).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            containerWidth: quip.apps.getContainerWidth(),
            currentValueDialog: null,
            step: Step.LOADING,
            selectedIssues: [],
            urlEmpty: !this.props.auth.isLoggedIn(),
        };
        this.props.menuDelegate.setLogoutCallback(() => {
            this.props.auth.logout().then(response => {
                this.props.entity.clearInstanceUrl();
                this.props.entity.clearRecords();
                this.props.entity.clearSelectedRecord();
                this.props.entity.set("isPlaceholder", true);

                this.setState(
                    {
                        step: Step.LOADING,
                        selectedIssues: [],
                        urlEmpty: true,
                    },
                    this.updateAuth);
                this.props.menuDelegate.updateToolbar(null);
                this.props.menuDelegate.refreshToolbar();
            });
        });
    }

    componentDidMount() {
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_FOCUS,
            this.onFocus_);
        quip.apps.addEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.hideDialog_);
        quip.apps.addEventListener(
            quip.apps.EventType.CONTAINER_SIZE_UPDATE,
            this.onContainerSizeChanged_);
        this.props.entity.listen(this.onEntityChange_);
        this.updateAuth();
    }

    componentWillUnmount() {
        this.props.entity.unlisten(this.onEntityChange_);
        quip.apps.removeEventListener(
            quip.apps.EventType.CONTAINER_SIZE_UPDATE,
            this.onContainerSizeChanged_);
        quip.apps.removeEventListener(
            quip.apps.EventType.ELEMENT_BLUR,
            this.hideDialog_);
        quip.apps.removeEventListener(
            quip.apps.EventType.ELEMENT_FOCUS,
            this.onFocus_);
    }

    onContainerSizeChanged_ = () => {
        this.setState({containerWidth: quip.apps.getContainerWidth()});
    };

    componentDidUpdate() {
        this.props.menuDelegate.refreshToolbar();
    }

    onEntityChange_ = () => {
        if (this.props.entity.isPlaceholder()) {
            if (this.state.step === Step.DETAIL ||
                this.state.step === Step.LIST) {
                this.setState({step: Step.LOGIN});
            }
        } else if (this.state.step !== Step.PICKING) {
            if (this.props.entity.getSelectedRecord()) {
                this.setState({step: Step.DETAIL});
            } else {
                this.setState({step: Step.LIST});
            }
        }

        if (this.state.step === Step.LIST) {
            // This is a hack due to how the data model works for table-view.
            // The cells notify the parent when the model has changed, causing
            // this to repeatedly rerender. Need a longer term fix.
            const loaded = !this.props.entity
                .getRecords()
                .find(entity => !entity.hasLoaded());
            if (!this.state.loaded) {
                if (this.state.loaded != loaded) {
                    this.setState({loaded: loaded});
                }
                return;
            } else if (this.props.entity.getFilterId() &&
                this.props.entity.isFetching()) {
                return;
            }
        }
    };

    onUpdate_ = selectedIssues => {
        this.setState({
            selectedIssues: selectedIssues,
            selectedLiveFilter: null,
        });
    };

    selectFilter_ = filter => {
        this.setState({selectedIssues: [], selectedLiveFilter: filter});
    };

    fetchFilterRecords_(query) {
        this.setState({filterQuery: query});
        return this.props.client
            .searchRecords({jql: query}, MAX_RECORDS_LIST)
            .then(response => {
                this.props.entity.clearStaleRecords();
                for (const issue of response.issues) {
                    this.props.entity.addRecord(issue.id);
                }
                this.setState({step: Step.LIST});
            });
    }

    selectRecords_ = () => {
        if (this.props.entity.isPlaceholder()) {
            // Clear out the placeholder data.
            this.props.entity.set("isPlaceholder", false);
        }
        this.props.entity.clearSelectedRecord();
        this.props.entity.clearRecords();

        if (this.state.selectedLiveFilter) {
            this.props.entity.setFilterId(this.state.selectedLiveFilter.id);
            this.props.entity.set(
                "filterName",
                this.state.selectedLiveFilter.name);
            this.props.entity.set("filterLastFetchedTime", Date.now());
            this.fetchFilterRecords_(this.state.selectedLiveFilter.query);
        } else if (this.state.selectedIssues.length == 1) {
            let issue = this.state.selectedIssues[0];
            this.props.entity.addRecentRecord(
                issue.id,
                issue.key,
                issue.summary);
            this.props.entity.setSelectedRecord(issue.id);
            this.setState({step: Step.DETAIL});
        } else {
            for (const issue of this.state.selectedIssues) {
                this.props.entity.addRecentRecord(
                    issue.id,
                    issue.key,
                    issue.summary);
                this.props.entity.addRecord(issue.id);
            }
            this.setState({step: Step.LIST});
        }
    };

    onSelectIssues = () => {
        this.setState({step: Step.PICKING});
    };

    onCurrentValue = field => {
        this.setState({currentValueDialog: field.getOriginalDisplayValue()});
    };

    enableButton = issue => {
        this.setState({selectedIssues: [issue]});
    };

    enableConnectButton_ = () => {
        this.setState({
            errorLink: null,
            errorMessage: null,
            urlEmpty: this.input_.value.length === 0,
        });
    };

    isValidUrl_ = entered => {
        let urlRegex = /^(?:(?:https?):\/\/)?(?:(?:\.){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        // TODO(Joyce): Actually fix above regex, if possible
        return (
            urlRegex.test(entered) &&
            !(
                entered.startsWith("www") &&
                (entered.match(/\./g) || []).length == 1
            )
        );
    };

    render() {
        const width = Math.min(this.state.containerWidth, MAX_ELEMENT_WIDTH);
        let content;
        if (this.state.step === Step.LOADING) {
            content = <div style={{width: this.props.loadingWidth}}>
                <quip.apps.ui.Image.Placeholder
                    key={"record-list-spinner"}
                    size={25}
                    loading={true}/>
            </div>;
        } else if (this.state.step === Step.LOGIN) {
            let onClickCallback;
            let pickerText;
            if (!quip.apps.isMobile()) {
                if (this.isLoggedIn_()) {
                    onClickCallback = function(e) {
                        this.onPickerClick(e);
                    }.bind(this);
                    pickerText = quiptext("Select Jira Issue(s)…");
                } else {
                    onClickCallback = this.setHostUrl_;
                    pickerText = quiptext("Connect to Jira…");
                }
            }
            content = <div onClick={onClickCallback}>
                {!quip.apps.isMobile() && <div className={Styles.openPicker}>
                    <quip.apps.ui.Button text={pickerText}/>
                </div>}
                <div className={Styles.placeholderOverlay}/>
                <RecordList
                    isLoggedIn={this.isLoggedIn_()}
                    columns={this.props.entity.getColumnsList()}
                    entities={this.props.entity.getRecords()}
                    loadingWidth={width}
                    menuDelegate={menuDelegate}
                    title={quiptext("Issues")}
                    widths={this.props.entity.get("placeholderWidths")}
                    ref={node => menuDelegate.setRecordListNode(node)}
                    metricType={"jira"}/>
            </div>;
        } else if (this.state.step == Step.HOST_URL) {
            let urlDialogClassNames = [Styles.urlDialog];

            let errorMessage = this.state.errorMessage || "";
            if (this.state.errorMessage) {
                urlDialogClassNames.push(Styles.hasError);
                if (this.state.errorLink) {
                    errorMessage = <a
                        href={this.state.errorLink}
                        target="_blank">
                        {errorMessage}
                    </a>;
                }
                errorMessage = <div className={Styles.error}>
                    {errorMessage}
                </div>;
            }
            const defaultInstance = this.props.auth.isLoggedIn()
                ? this.props.auth.getTokenResponseParam("instance_url")
                : "";
            const hostUrlInput = <input
                className={Styles.urlBar}
                placeholder="https://yoursite.atlassian.net/"
                defaultValue={defaultInstance}
                ref={node => {
                    this.input_ = node;
                }}
                onChange={this.enableConnectButton_}
                onKeyDown={e => this.onUrlEnter_(e)}
                type="url"
                autoFocus={true}/>;

            content = <div>
                <RecordList
                    isLoggedIn={this.isLoggedIn_()}
                    columns={this.props.entity.getColumnsList()}
                    entities={this.props.entity.getRecords()}
                    loadingWidth={width}
                    menuDelegate={menuDelegate}
                    title={quiptext("Issues")}
                    widths={this.props.entity.get("placeholderWidths")}
                    ref={node => menuDelegate.setRecordListNode(node)}
                    metricType={"jira"}/>
                <Dialog
                    onDismiss={this.handleUrlDismiss_}
                    displayImmediately={true}>
                    <div className={urlDialogClassNames.join(" ")}>
                        <div className={Styles.jiraHeader}>
                            {quiptext("Connect to Jira")}
                        </div>
                        <div className={Styles.server}>
                            {quiptext("Server")}
                        </div>
                        {hostUrlInput}
                        {errorMessage}
                        <div className={Styles.line}/>
                        <div className={Styles.actions}>
                            <quip.apps.ui.Button
                                text={quiptext("Cancel")}
                                onClick={this.handleUrlDismiss_}/>
                            <quip.apps.ui.Button
                                primary={true}
                                disabled={this.state.urlEmpty}
                                ref={node => {
                                    this.connectButton = node;
                                }}
                                onClick={e => this.onLoginClick(e)}
                                text={quiptext("Connect")}/>
                        </div>
                    </div>
                </Dialog>
            </div>;
        } else if (this.state.step == Step.PICKING) {
            let selectButtonText;
            if (this.state.selectedLiveFilter) {
                selectButtonText = quiptext("Select Live Filter");
            } else {
                if (this.state.selectedIssues.length == 0) {
                    selectButtonText = quiptext("Select Issue(s)");
                } else if (this.state.selectedIssues.length == 1) {
                    selectButtonText = quiptext("Select 1 Issue");
                } else {
                    selectButtonText = quiptext("Select %(count)s Issues", {
                        "count": this.state.selectedIssues.length,
                    });
                }
            }
            content = <Dialog onDismiss={this.hidePicker_}>
                <div className={Styles.dialog}>
                    <div className={Styles.header}>
                        {quiptext("Select Jira Issue")}
                    </div>
                    <JiraPicker
                        client={this.props.client}
                        ref={el => (this.picker = ReactDOM.findDOMNode(el))}
                        className={Styles.jiraPicker}
                        onUpdate={this.onUpdate_}
                        selectedLiveFilter={this.state.selectedLiveFilter}
                        selectedIssues={this.state.selectedIssues}
                        onSelectFilter={this.selectFilter_}
                        enableButton={this.enableButton}
                        recentRecords={this.props.entity.getRecentRecords()}/>
                    <div className={Styles.actions}>
                        <quip.apps.ui.Button
                            text={quiptext("Cancel")}
                            onClick={this.hidePicker_}/>
                        <quip.apps.ui.Button
                            primary={true}
                            disabled={
                                this.state.selectedIssues.length == 0 &&
                                !this.state.selectedLiveFilter
                            }
                            onClick={this.selectRecords_}
                            text={selectButtonText}/>
                    </div>
                </div>
            </Dialog>;
        } else if (this.state.step == Step.LIST) {
            content = <PaginatedRecordList
                isLoggedIn={this.isLoggedIn_()}
                columns={this.props.entity.getColumnsList()}
                entities={this.props.entity.getRecords()}
                loadingWidth={width}
                menuDelegate={menuDelegate}
                onContextMenu={this.onContextMenu_}
                title={quiptext("Issues")}
                widths={this.props.entity.get("widths")}
                childRef={node => {
                    menuDelegate.setRecordListNode(node);
                    this.props.entity.setDom(ReactDOM.findDOMNode(node));
                }}
                metricType={"jira"}/>;
        } else {
            const selectedRecord = this.props.entity.getSelectedRecord();
            content = <Record
                entity={selectedRecord}
                menuDelegate={menuDelegate}
                ref={node => {
                    menuDelegate.setSelectedRecordNode(node);
                    this.props.entity.setDom(ReactDOM.findDOMNode(node));
                }}/>;
        }

        let dialog;
        if (this.state.currentValueDialog !== null) {
            dialog = <Dialog
                displayImmediately={true}
                onDismiss={() => this.setState({currentValueDialog: null})}>
                <div className={Styles.currentValueDialog}>
                    <div className={Styles.jiraHeader}>
                        {quiptext("Currently in Jira")}
                    </div>
                    <div className={Styles.currentValueBody}>
                        {this.state.currentValueDialog}
                    </div>
                    <div className={Styles.line}/>
                    <div className={Styles.actions}>
                        <quip.apps.ui.Button
                            onClick={() =>
                                this.setState({currentValueDialog: null})
                            }
                            primary={true}
                            text={quiptext("Done")}/>
                    </div>
                </div>
            </Dialog>;
        }

        if (this.state.step == Step.LIST || this.state.step == Step.LOGIN) {
            // Content will stretch to its desired contents.
            return <div>
                {content}
                {dialog}
            </div>;
        } else {
            return <div style={{width: width}}>
                {content}
                {dialog}
            </div>;
        }
    }

    onContextMenu_ = (commands, context, cell) => {
        if (this.props.entity.getFilterId()) {
            commands.splice(commands.indexOf("deleteRow"), 1);
        }
        commands.splice(0, 0, "open-link");
        context["open-link"] = () => {
            const entity = quip.apps.getRecordById(cell.id);
            return entity.getFieldData("key").value;
        };
    };

    handleUrlDismiss_ = () => {
        if (this.state.step === Step.HOST_URL) {
            this.setState({step: Step.LOGIN, errorMessage: null});
        }
    };

    hideDialog_ = () => {
        if (this.state.step === Step.PICKING) {
            this.setState({step: Step.LOGIN});
        } else if (this.state.step === Step.HOST_URL) {
            this.setState({step: Step.LOGIN, errorMessage: null});
        }
    };

    hidePicker_ = () => {
        if (this.state.step === Step.PICKING) {
            if (this.props.entity.getSelectedRecord()) {
                this.setState({step: Step.DETAIL});
            } else if (this.props.entity.hasListRecords()) {
                this.setState({step: Step.LIST});
            } else {
                this.setState({step: Step.LOGIN});
            }
        }
    };

    setHostUrl_ = () => {
        if (quip.apps.isElementFocused()) {
            this.nextStep_ = null;
            this.setState({step: Step.HOST_URL});
        } else {
            this.nextStep_ = Step.HOST_URL;
        }
    };

    onPickerClick = e => {
        if (quip.apps.isElementFocused()) {
            this.nextStep_ = null;
            this.setState({step: Step.PICKING});
        } else {
            this.nextStep_ = Step.PICKING;
        }
    };

    onFocus_ = () => {
        if (this.nextStep_) {
            this.setState({step: this.nextStep_});
            this.nextStep_ = null;
        }
    };

    onUrlEnter_(e) {
        if (e.keyCode == 13) {
            this.connectButton.props.onClick();
        }
    }

    onLoginClick(e) {
        let instanceUrl = this.input_.value
            .trim()
            .replace("http://", "https://")
            .toLowerCase();
        if (!this.isValidUrl_(instanceUrl)) {
            this.setState({
                errorLink: null,
                errorMessage: quiptext("Please enter a valid URL."),
            });
        } else {
            if (instanceUrl.endsWith("/")) {
                instanceUrl = instanceUrl.slice(0, -1);
            }
            if (!instanceUrl.startsWith("http")) {
                instanceUrl = "https://" + instanceUrl;
            }
            this.props.entity.setInstanceUrl(instanceUrl);
            this.authenticateUrl(instanceUrl, false);
        }
    }

    authenticateUrl(url, alternate) {
        if (this.isLoggedIn_()) {
            this.updateAuth();
            this.setState({step: Step.PICKING});
        } else {
            this.props.auth
                .login({
                    "instance_url": url,
                })
                .then(() => {
                    this.updateAuth();
                    this.setState({step: Step.PICKING});
                })
                .catch(error => {
                    if (alternate) {
                        // Use previous exception instead.
                        return;
                    }

                    if (error.error_code) {
                        if (error.error_code === "invalid_url") {
                            window.setTimeout(() => {
                                throw new Error(
                                    `Invalid Jira url: ${
                                        error.error_message
                                    }, HTTP Code: ${error.http_code}`);
                            }, 0);
                            this.setState({
                                errorLink: null,
                                errorMessage: quiptext(
                                    "Not a valid Jira instance."),
                            });
                        } else if (error.error_code === "invalid_response") {
                            window.setTimeout(() => {
                                throw new Error(
                                    `Invalid Jira response: ${
                                        error.error_message
                                    }, HTTP Code: ${error.http_code}`);
                            }, 0);
                            this.setState({
                                errorLink: null,
                                errorMessage: quiptext("Invalid response."),
                            });
                            if (!alternate) {
                                this.authenticateUrl(
                                    this.props.entity.getAlternativeOAuthBaseUrl(),
                                    true);
                            }
                        } else if (error.error_code === "permission_denied") {
                            this.setState({
                                errorLink: null,
                                errorMessage: quiptext(
                                    "Permission denied. Please allow Jira access."),
                            });
                        } else if (error.error_code === "server_error") {
                            this.setState({
                                errorLink:
                                    "https://quip.com/dev/liveapps/jira/config-firewall",
                                errorMessage: quiptext(
                                    "Unable to connect to server, click here for more details."),
                            });
                        } else {
                            this.setState({
                                errorLink:
                                    "https://quip.com/dev/liveapps/jira/config?jira_instance_url=" +
                                    this.props.entity.getInstanceUrl(),
                                errorMessage: quiptext(
                                    "To use this server, click here to set up an app connection to Quip."),
                            });
                        }
                    }
                });
        }
    }

    isLoggedIn_() {
        return (
            this.props.auth.isLoggedIn() &&
            (this.props.auth.getTokenResponseParam("instance_url") ===
                this.props.entity.getInstanceUrl() ||
                this.props.auth.getTokenResponseParam("instance_url") ===
                    this.props.entity.getAlternativeOAuthBaseUrl())
        );
    }

    updateAuth() {
        const filterId = this.props.entity.getFilterId();
        if (filterId) {
            // For filters, we need to refetch the filter given that the
            // issues could change. In such a case, the filter itself may
            // have changed, so we fetch a filter first.
            if (this.state.filterQuery) {
                this.fetchFilterRecords_(this.state.filterQuery);
            } else {
                const defaultFilter = getDefaultFilter(filterId);
                if (defaultFilter) {
                    if (this.props.entity.isOwner()) {
                        this.fetchFilterRecords_(defaultFilter.query).catch(
                            error => {
                                // No access or failed. Use stale records.
                                this.setState({step: Step.LIST});
                            });
                    } else {
                        this.setState({step: Step.LIST});
                    }
                } else {
                    this.props.client
                        .fetchFilter(filterId)
                        .then(response => {
                            this.props.entity.set("filterName", response.name);
                            this.props.entity.set(
                                "filterLastFetchedTime",
                                Date.now());
                            this.fetchFilterRecords_(response.jql);
                        })
                        .catch(error => {
                            // For some reason columns might not finish
                            // syncing in time. Need to follow up on this.
                            const updateStep = () => {
                                if (this.props.entity.getColumnsList()) {
                                    // No access or failed. Use stale records.
                                    this.setState({
                                        step: Step.LIST,
                                    });
                                } else {
                                    window.setTimeout(updateStep, 100);
                                }
                            };
                            updateStep();
                        });
                }
            }
        } else if (this.props.entity.getSelectedRecord()) {
            this.setState({step: Step.DETAIL});
        } else if (this.props.entity.hasListRecords()) {
            this.setState({step: Step.LIST});
        } else {
            this.setState({step: Step.LOGIN});
            if (this.isLoggedIn_()) {
                this.props.menuDelegate.updateToolbar(null);
                this.props.menuDelegate.refreshToolbar();
            }
        }
    }
}

quip.apps.initialize({
    menuCommands: menuDelegate.allMenuCommands(),
    toolbarCommandIds: [quip.apps.DocumentMenuCommands.MENU_MAIN, "save-data"],
    initializationCallback: function(root, params) {
        const rootRecord = quip.apps.getRootRecord();
        if (params.isCreation) {
            rootRecord.loadPlaceholderData(PlaceholderData);
        } else if (quip.apps.CreationSource &&
            params.creationSource === quip.apps.CreationSource.TEMPLATE) {
            rootRecord.clearData();
            rootRecord.loadPlaceholderData(PlaceholderData);
        }
        const auth = quip.apps.auth("jira-oauth1");
        const client = new JiraDatasource(auth);
        menuDelegate.init(auth, client);
        ReactDOM.render(
            <Root
                auth={auth}
                entity={rootRecord}
                client={client}
                menuDelegate={menuDelegate}
                ref={node => {
                    if (node != null) {
                        menuDelegate.setClearRecordCallback(
                            node.onSelectIssues);
                        menuDelegate.setCurrentValueCallback(
                            node.onCurrentValue);
                    }
                }}/>,
            root);
        menuDelegate.refreshToolbar();
    },
});
