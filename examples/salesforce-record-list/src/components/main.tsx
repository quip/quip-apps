// Copyright 2019 Quip

import React, {
    Component,
    ReactElement,
    MouseEvent as ReactMouseEvent,
} from "react";
import PropTypes, {InferProps} from "prop-types";
import quip from "quip-apps-api";
import _ from "quiptext";
import classNames from "classnames";
import {RootEntity, AppData} from "../model/root";
import List from "./list";
import ListPicker from "./list-picker";
import {ListMenu} from "../menus";
import DuelingDialog from "./dueling-dialog";
import menuActions from "../lib/menu-actions";
import Styles from "./main.less";
import CommentCursor from "./comment-cursor";
import Icon from "./icon";
import recordMetric from "../lib/metrics";
import {parseCreationUrl} from "../lib/util";

type MainProps = InferProps<typeof Main.propTypes>;
interface MainState {
    data: AppData;
    initOptions?: {list_id?: string; object_type?: string; org_name?: string};
    showListPicker: boolean;
    showManageColumns: boolean;
    isLoading: boolean;
    addingComment: boolean;
    error?: Error;
    resizeHandleOffset: number;
    resizingContainer: boolean;
}
export default class Main extends Component<MainProps, MainState> {
    static propTypes = {
        rootRecord: PropTypes.instanceOf(RootEntity).isRequired,
        listMenu: PropTypes.instanceOf(ListMenu).isRequired,
        isCreation: PropTypes.bool.isRequired,
        creationUrl: PropTypes.string,
        initOptionsJson: PropTypes.string,
        error: PropTypes.instanceOf(Error),
    };

    setupMenuActions_(rootRecord: RootEntity) {
        const client = rootRecord.getClient();
        menuActions.save = () => rootRecord.getActions().onSave();
        menuActions.refreshList = () => rootRecord.getActions().onRefresh();
        menuActions.openInSalesforce = () =>
            quip.apps.openLink(rootRecord.getData().selectedList.salesforceUrl);
        menuActions.showListPicker = () =>
            this.setState({showListPicker: true});
        menuActions.showManageColumns = () =>
            this.setState({showManageColumns: true});
        menuActions.resetData = () => rootRecord.getActions().onResetData();
        menuActions.logout = async () => {
            this.setState({isLoading: true});
            await client.logout();
            this.refreshData_();
            this.setState({isLoading: false});
        };
        menuActions.login = async () => {
            await client.login();
            this.refreshData_();
        };
        menuActions.toggleCommenting = this.toggleCommenting_;
        menuActions.hideColumn = colName =>
            rootRecord.getActions().onHideColumn(colName);
        menuActions.toggleTruncateContent = () =>
            rootRecord.getActions().onToggleTruncate();
        menuActions.toggleSandbox = () =>
            rootRecord.getActions().onToggleSandbox();
    }

    private rootRef_: Element | null;
    private detachedRefs_: Map<string, Node | null>;
    private initOptions_: {[key: string]: string} | null;

    private initialDragX_: number = 0;
    private needsDragUpdate_: boolean = false;

    static childContextTypes = {
        addingComment: PropTypes.bool,
        toggleAddingComment: PropTypes.func,
    };

    constructor(props: MainProps) {
        super(props);
        this.rootRef_ = null;
        const {rootRecord, initOptionsJson, creationUrl} = props;
        this.setupMenuActions_(rootRecord);
        this.detachedRefs_ = new Map();
        const data = rootRecord.getData();
        let initOptions: {[key: string]: string} | null = null;
        if (initOptionsJson) {
            try {
                initOptions = JSON.parse(initOptionsJson);
            } catch (e) {
                // Ignore parse errors here. Presumably the metrics and local
                // logs are enough to debug.
                console.error(`Invalid initOptions JSON: ${initOptionsJson}`);
            }
        }

        if (props.isCreation) {
            const args: {[key: string]: string} = {};
            if (initOptionsJson) {
                args["init_options"] = initOptionsJson;
            }
            if (initOptions) {
                args["list_id"] = initOptions["list_id"];
                args["object_type"] = initOptions["object_type"];
            }
            if (creationUrl) {
                args["creation_url"] = creationUrl;
            }
            recordMetric("created", args);
        }
        this.initOptions_ = initOptions;

        this.state = {
            data,
            initOptions,
            showListPicker: false,
            showManageColumns: false,
            isLoading: false,
            addingComment: false,
            error: props.error,
            resizeHandleOffset: 0,
            resizingContainer: false,
        };
    }

    componentDidMount() {
        const {rootRecord, isCreation, creationUrl} = this.props;
        if (isCreation) {
            const creationListInfo = parseCreationUrl(creationUrl);
            // If we have a creation URL, parse and load a list. If the user is
            // not logged in, this will prompt them to log in first.
            if (creationListInfo) {
                this.onSelectList_(creationListInfo.id, creationListInfo.type);
            } else {
                this.refreshData_();
            }
        } else {
            const initOptions = this.initOptions_;
            const hasInitOptionsList =
                initOptions &&
                initOptions["list_id"] &&
                initOptions["object_type"];
            // If initOptions has been specified (for instance, by automation
            // API) and are valid, parse and load the specified list by
            // initOptions. If the user is not logged in, this will prompt them
            // to log in first.
            if (hasInitOptionsList) {
                this.onSelectList_(
                    initOptions["list_id"],
                    initOptions["object_type"]);
            } else {
                this.refreshData_();
            }
        }
        rootRecord.listen(this.refreshData_);
    }

    componentWillUnmount() {
        const {rootRecord} = this.props;
        rootRecord.unlisten(this.refreshData_);
    }

    detachedRef_ = (name: string) => (newRef: Node) => {
        const existingRef = this.detachedRefs_.get(name);
        if (!newRef && existingRef) {
            quip.apps.removeDetachedNode(existingRef);
        } else if (existingRef && newRef) {
            quip.apps.addDetachedNode(newRef);
        }
        this.detachedRefs_.set(name, newRef);
    };

    refreshData_ = () => {
        const {listMenu, rootRecord} = this.props;
        const data = rootRecord.getData();
        listMenu.updateToolbar(data);
        this.setState({data});
    };

    onConnect_ = (e: ReactMouseEvent<HTMLDivElement>) => {
        const {rootRecord} = this.props;
        e.preventDefault();
        rootRecord
            .getClient()
            .ensureLoggedIn()
            .then(() => {
                this.setState({showListPicker: true});
            })
            .catch(err => {
                const {error_message} = err;
                let error = error_message || err;
                if (error === "ip restricted") {
                    error = _(
                        "Please connect to your work network and try again.");
                }
                this.setState({error: new Error(error)});
            });
    };

    toggleCommenting_ = () => {
        this.setState(({addingComment}) => ({addingComment: !addingComment}));
    };

    hideListPicker_ = () => {
        this.setState({showListPicker: false});
    };

    onSelectList_ = async (
        selectedListId: string,
        selectedListType: string
    ) => {
        const {rootRecord} = this.props;
        this.hideListPicker_();
        const actions = rootRecord.getActions();
        this.setState({isLoading: true});
        try {
            await actions.onSetSelectedList(selectedListId, selectedListType);
            this.setState({isLoading: false});
        } catch (err) {
            recordMetric("error", {
                "error_type": "select_list",
                "message": err.message,
                "stack": err.stack,
            });
            let error = err;
            const code = error.getCode && error.getCode();
            if (code === 404 || code === 403) {
                error = new Error(_(
                    "List not found. Try logging in to a different Salesforce instance") as string);
            }
            this.setState({error, isLoading: false});
        }
    };

    onClickReference_ = (relativeUrl: string) => {
        const {instanceUrl} = this.state.data;
        quip.apps.openLink(`${instanceUrl}${relativeUrl}`);
    };

    onStartResizeContainer_ = (e: ReactMouseEvent<HTMLDivElement>) => {
        document.addEventListener("mousemove", this.onDragResizeContainer_);
        document.addEventListener("mouseup", this.onDropResizeContainer_);
        this.initialDragX_ = e.clientX;
        this.setState({resizingContainer: true, resizeHandleOffset: 0});
    };
    onDragResizeContainer_ = (e: MouseEvent) => {
        this.needsDragUpdate_ = true;
        requestAnimationFrame(() => {
            if (this.needsDragUpdate_) {
                this.setState({
                    resizeHandleOffset: e.clientX - this.initialDragX_,
                });
                this.needsDragUpdate_ = false;
            }
        });
    };
    onDropResizeContainer_ = () => {
        const {rootRecord} = this.props;
        const {resizeHandleOffset} = this.state;
        document.removeEventListener("mousemove", this.onDragResizeContainer_);
        document.removeEventListener("mouseup", this.onDropResizeContainer_);
        rootRecord.setContainerWidth(
            rootRecord.getContainerWidth() + resizeHandleOffset * 2);
        this.setState({resizingContainer: false, resizeHandleOffset: 0});
    };

    renderPlaceholder(listContent: ReactElement) {
        const {isLoggedIn} = this.state.data;
        const {initOptions} = this.state;
        const orgName =
            initOptions && initOptions["org_name"]
                ? initOptions["org_name"]
                : "Salesforce";
        const connectPromptMsg = _("Connect to %(org)s", {
            "org": orgName,
        });
        return <div className={Styles.placeholder} onClick={this.onConnect_}>
            <div className={Styles.openPicker}>
                <quip.apps.ui.Button
                    disabled={false}
                    text={
                        (isLoggedIn
                            ? _("Select a List View")
                            : connectPromptMsg) as string
                    }/>
            </div>
            {<div className={Styles.placeholderOverlay}/>}
            {listContent}
            {!isLoggedIn ? (
                <div className={Styles.loginContext}>
                    <span>
                        {_(
                            "Trouble connecting? Make sure your Quip and Salesforce admin has ")}
                        <a
                            onClick={e => e.stopPropagation()}
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://www.quipsupport.com/hc/en-us/articles/360022156351-Quip-Salesforce-Integration-Summary">
                            {_("already set up the integration")}
                        </a>
                        {_(
                            ", and that your browser isn't blocking the login popup.")}
                    </span>
                </div>
            ) : null}
        </div>;
    }

    render() {
        const {rootRecord} = this.props;
        const {
            data,
            error,
            addingComment,
            showManageColumns,
            showListPicker,
            isLoading,
            resizingContainer,
            resizeHandleOffset,
        } = this.state;
        const {
            isReadOnly,
            selectedList,
            listError,
            saveError,
            objectInfoError,
            isSaving,
        } = data;
        const actions = rootRecord.getActions();
        const containerWidth = rootRecord.getContainerWidth();

        let dialog;
        if (showListPicker) {
            dialog = <ListPicker
                error={listError || objectInfoError}
                listTypes={data.listTypes}
                listViews={data.listViews}
                availableObjects={data.availableObjects}
                isLoadingLists={data.isLoadingLists}
                isFetchingMoreLists={data.isFetchingMoreLists}
                isLoadingListTypes={data.isLoadingListTypes}
                onFetchListTypes={actions.onFetchListTypes}
                onFetchLists={actions.onFetchLists}
                onSearchLists={rootRecord.searchForLists}
                onSelectList={this.onSelectList_}
                onDismiss={this.hideListPicker_}/>;
        } else if (showManageColumns || !selectedList.hasInitialColumns) {
            dialog = <DuelingDialog
                title={
                    (selectedList.hasInitialColumns
                        ? _("Manage List View Columns")
                        : _("Choose List View Columns")) as string
                }
                optionName={_("Columns") as string}
                subtitle={
                    !selectedList.hasInitialColumns
                        ? (_(
                              "Select the most relevant fields (you can always adjust these later).\nFewer fields will make your Salesforce List faster and easier to use.") as string)
                        : undefined
                }
                hideCancel={!selectedList.hasInitialColumns}
                options={selectedList.availableColumns.map(c => ({
                    id: c.fieldApiName,
                    label: c.label,
                }))}
                initiallySelectedIds={selectedList.showingColumns}
                onCommitSelection={actions.onSetShowingColumns}
                onDismiss={() => this.setState({showManageColumns: false})}/>;
        }

        if (isLoading) {
            return <quip.apps.ui.Spinner size={25}/>;
        }
        const content = <List
            title={selectedList.title}
            isEmpty={selectedList.isEmpty}
            link={selectedList.salesforceUrl}
            themeInfo={selectedList.themeInfo}
            columns={selectedList.columns}
            rows={selectedList.rows}
            recordsPerPage={selectedList.recordsPerPage}
            columnWidths={selectedList.columnWidths}
            showingColumns={selectedList.showingColumns}
            sortColumn={selectedList.sortColumn}
            sortDesc={selectedList.sortDesc}
            isPlaceholder={selectedList.isPlaceholder}
            isReadOnly={isReadOnly}
            isSaving={isSaving}
            truncateContent={data.truncateContent}
            isRefreshing={data.isLoadingListData}
            onUpdateCell={actions.onUpdateCell}
            onAddComment={actions.onAddComment}
            onSetColumnWidths={actions.onSetColumnWidths}
            onSetShowingColumns={actions.onSetShowingColumns}
            onSetSortColumn={actions.onSetSortColumn}
            onClickReference={this.onClickReference_}
            error={error || saveError}/>;
        return <div
            className={classNames(Styles.root, {
                [Styles.resizingRoot]: resizingContainer,
            })}
            style={{width: containerWidth}}
            ref={r => (this.rootRef_ = r)}>
            {selectedList && selectedList.isPlaceholder
                ? this.renderPlaceholder(content)
                : content}
            {addingComment ? <CommentCursor rootRef={this.rootRef_}/> : null}
            {resizingContainer ? (
                <div
                    ref={this.detachedRef_("resizeIndicator")}
                    className={Styles.resizeContainerIndicator}
                    style={{
                        width: Math.max(
                            containerWidth + resizeHandleOffset * 2,
                            800),
                    }}/>
            ) : null}
            <div
                ref={this.detachedRef_("resizeContainerHandle")}
                className={Styles.resizeContainerHandle}
                style={{transform: `translateX(${resizeHandleOffset}px)`}}
                onMouseDown={this.onStartResizeContainer_}>
                <Icon type="utility" object="drag_and_drop" size="small"/>
            </div>
            {dialog}
        </div>;
    }

    getChildContext() {
        const {addingComment} = this.state;
        return {
            addingComment,
            toggleAddingComment: this.toggleCommenting_,
        };
    }
}
