// Copyright 2017 Quip

import React from "react";
import quip from "quip";
import cx from "classnames";

import format from "date-fns/format";

import handleRichTextBoxKeyEventNavigation from "quip-apps-handle-richtextbox-key-event-navigation";

import {auth, login, refreshToken} from "../model.js";

import Checkmark from "./Checkmark.jsx";
import Chevron from "quip-apps-chevron";
import Styles from "./Row.less";

const {RichTextBox, CommentsTrigger} = quip.apps.ui;

const RETURN_KEY = 13;
const API = "https://platform.quip.com/1";
const TEMPLATE_THREAD_ID = "IrdIAvWi0VAp";

export default class Row extends React.Component {
    static propTypes = {
        isLoggedIn: React.PropTypes.bool.isRequired,
        record: React.PropTypes.instanceOf(quip.apps.Record).isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            isContextMenuOpen: false,
            loading: false,
        };
    }

    componentDidMount = async () => {
        const {isLoggedIn, record} = this.props;
        const threadId = record.get("thread_id");
        if (isLoggedIn && threadId) {
            this.updateThreadProperties(threadId, true);
        }
    };

    updateThreadProperties = async (threadId, retry = false) => {
        console.debug("updateThreadProperties", threadId, retry);
        const {record} = this.props;
        try {
            const thread = await this.getThread(threadId);
            console.log("updateThreadProperties", {thread});

            record.set("thread_title", thread.title);
            record.set("thread_created_usec", thread.created_usec);
            record.set("thread_updated_usec", thread.updated_usec);
        } catch (err) {
            console.error("ERR updateThreadProperties", {err});
            if (retry) {
                await refreshToken();
                this.updateThreadProperties(threadId, false);
            }
        }
    };

    getThread = async threadId => {
        this.setState({loading: true});
        const rawResponse = await auth().request({
            url: `${API}/threads/${threadId}`,
        });
        console.debug("getThread", {rawResponse});
        this.setState({loading: false});
        if (!rawResponse.ok) {
            throw Error(rawResponse.status);
        }
        const response = await rawResponse.json();
        console.log({response});
        return {
            ...response.thread,
            html: response.html,
        };
    };

    handleKeyEvent = e => {
        if (e.keyCode === RETURN_KEY) {
            return true;
        }

        return handleRichTextBoxKeyEventNavigation(e, this.props.record);
    };

    showContextMenu = e => {
        if (this.state.isContextMenuOpen) {
            return;
        }
        const context = {
            delete: this.deleteOption,
            record: this.props.record,
        };
        quip.apps.showContextMenuFromButton(
            e.currentTarget,
            ["comment", "delete"],
            [],
            [],
            () => {
                this.setState({
                    isContextMenuOpen: false,
                });
            },
            context
        );
        this.setState({
            isContextMenuOpen: true,
        });
    };

    getTitle(atMentionUserName) {
        console.debug("getTitle", {atMentionUserName});
        const {record} = this.props;
        const viewingUserName = quip.apps.getViewingUser().getName();
        return `Feedback for ${viewingUserName} from ${atMentionUserName}`;
    }

    onClickGetFeedbackButton = async () => {
        const {record} = this.props;
        const link = this.refs["person"].querySelector("a.content");
        if (!link) {
            console.error("no content in RichTextBox");
            return;
        }
        const atMentionId = link.getAttribute("data-id");
        const atMentionUserName = link.textContent.replace("@", "");
        console.log("onClickGetFeedbackButton", {
            link,
            atMentionId,
            atMentionUserName,
        });
        if (!atMentionId && atMentionUserName) {
            console.error("please @mention a user ");
            return;
        }

        try {
            this.copyThread(atMentionId, atMentionUserName);
        } catch (err) {
            await refreshToken();
            this.copyThread(atMentionId, atMentionUserName);
        }
    };

    copyThread = async (atMentionId, atMentionUserName) => {
        const {record} = this.props;
        const token = quip.apps.getUserPreferences().getForKey("token");
        const viewingUser = quip.apps.getViewingUser();
        const title = this.getTitle(atMentionUserName);

        const threadToCopy = await this.getThread(TEMPLATE_THREAD_ID);
        console.debug({threadToCopy});

        this.setState({loading: true});
        const content = threadToCopy.html.replace(threadToCopy.title, title);
        const rawResponse = await auth().request({
            url: `${API}/threads/new-document`,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: {
                content,
                member_ids: [viewingUser.getId(), atMentionId].join(","),
            },
        });
        if (!rawResponse.ok) {
            throw Error(rawResponse.statusText);
        }
        const response = await rawResponse.json();
        console.log("copyThread", {response});
        const thread = response.thread;
        record.set("thread_id", thread.id);
        record.set("thread_title", thread.title);
        record.set("thread_created_usec", thread.created_usec);
        record.set("thread_updated_usec", thread.updated_usec);
        this.setState({loading: false});
    };

    onClickThreadTitle = e => {
        e.preventDefault();
        quip.apps.openLink(e.target.getAttribute("href"));
    };

    render() {
        const {isLoggedIn, record, selected, setRowSelected} = this.props;
        const {loading} = this.state;
        const threadId = record.get("thread_id");
        const threadTitle = record.get("thread_title");
        const threadCreatedUsec = record.get("thread_created_usec");
        const threadUpdatedUsec = record.get("thread_updated_usec");
        const dateFormat = "MM/DD/YYYY h:mma";

        let content;
        if (threadId) {
            content = (
                <a
                    href={`https://corp.quip.com/${threadId}`}
                    onClick={this.onClickThreadTitle}>
                    {threadTitle}
                </a>
            );
        } else if (loading) {
            content = <span>Copying template ...</span>;
        } else if (isLoggedIn) {
            content = (
                <button
                    disabled={!isLoggedIn}
                    onClick={this.onClickGetFeedbackButton}>
                    Get feedback!
                </button>
            );
        } else {
            content = <span>"^^ Login first ^^</span>;
        }

        return (
            <div className={Styles.row}>
                <div className={Styles.person} ref="person">
                    <RichTextBox
                        record={record.get("person")}
                        width="100%"
                        minHeight={20}
                        scrollable={false}
                        useDocumentTheme={false}
                        allowedStyles={[]}
                        ref="rtb"
                    />
                </div>
                <div className={Styles.document}>{content}</div>
                <div className={Styles.usec}>
                    {threadCreatedUsec
                        ? format(new Date(threadCreatedUsec / 1000), dateFormat)
                        : null}
                </div>
                <div className={Styles.usec}>
                    {threadUpdatedUsec
                        ? format(new Date(threadUpdatedUsec / 1000), dateFormat)
                        : null}
                </div>
                <div className={Styles.checkmark}>
                    <Checkmark
                        checked={selected}
                        onClick={() => {
                            setRowSelected(record.getId());
                        }}
                    />
                </div>
            </div>
        );
    }
}

export function HeaderRow() {
    return (
        <div className={Styles.rowHeader}>
            <div className={Styles.person}>@Person</div>
            <div className={Styles.document}>Feedback</div>
            <div className={Styles.usec}>Created</div>
            <div className={Styles.usec}>Updated</div>
            <div className={Styles.select} />
        </div>
    );
}
