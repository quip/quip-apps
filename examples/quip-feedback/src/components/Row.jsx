// Copyright 2017 Quip

import React from "react";
import quip from "quip";
import cx from "classnames";

import format from "date-fns/format";

import handleRichTextBoxKeyEventNavigation from "quip-apps-handle-richtextbox-key-event-navigation";

import {login} from "../model.js";

import Checkmark from "./Checkmark.jsx";
import Chevron from "quip-apps-chevron";
import Styles from "./Row.less";

const {RichTextBox, CommentsTrigger} = quip.apps.ui;

const RETURN_KEY = 13;

//const API_PROXY = "http://localhost:8080";
const API_PROXY = "https://quip-platform-api-proxy.herokuapp.com";
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
            this.updateThreadProperties(threadId);
        }
    };

    updateThreadProperties = async threadId => {
        const {record} = this.props;
        const thread = await this.getThread(threadId);
        console.log("updateThreadProperties", {thread});

        record.set("thread_title", thread.title);
        record.set("thread_created_usec", thread.created_usec);
        record.set("thread_updated_usec", thread.updated_usec);
    };

    getThread = async threadId => {
        this.setState({loading: true});
        const token = quip.apps.getUserPreferences().getForKey("token");
        const rawResponse = await fetch(
            `${API_PROXY}/thread/get?access_token=${
                token.access_token
            }&thread_id=${threadId}`
        );
        this.setState({loading: false});
        const response = await rawResponse.json();
        console.log({response});
        return response.thread;
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

    getTitle() {
        const {record} = this.props;
        const shareWithUserName = record.get("person").getTextContent();
        const viewingUser = quip.apps.getViewingUser();
        return `Feedback for ${viewingUser.getName()} from ${shareWithUserName}`;
    }

    onClickGetFeedbackButton = async () => {
        const {record} = this.props;
        const token = quip.apps.getUserPreferences().getForKey("token");
        if (!token) {
            login();
            alert("try again");
            return;
        }
        const link = this.refs["person"].querySelector("a.content");
        if (!link) {
            console.error("no content in RTB");
            return;
        }
        const atMentionId = link.getAttribute("data-id");
        console.log({link, atMentionId});
        if (!atMentionId) {
            console.error("please @mention a user or a thread");
            return;
        }
        const isAThread =
            link.getAttribute("data-click") === "control-document";
        if (isAThread) {
            const threadId = link.getAttribute("href").replace("/", "");
            console.log("isAThread!", threadId);
            record.set("thread_id", threadId);
            this.updateThreadProperties(threadId);
            return;
        }
        this.setState({loading: true});

        const viewingUser = quip.apps.getViewingUser();
        const threadTitle = this.getTitle();
        const rawResponse = await fetch(`${API_PROXY}/thread/copy`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                access_token: token.access_token,
                template_thread_id: TEMPLATE_THREAD_ID,
                title: threadTitle,
                member_ids: [viewingUser.getId(), atMentionId],
            }),
        });
        const response = await rawResponse.json();

        console.log({response});
        const thread = response.thread;
        record.set("thread_id", thread.id);
        record.set("thread_title", threadTitle);
        record.set("thread_created_usec", thread.created_usec);
        record.set("thread_updated_usec", thread.updated_usec);
        this.setState({loading: false});
    };

    onClickThreadTitle = e => {
        e.preventDefault();
        quip.apps.openLink(`https://quip.com${e.target.getAttribute("href")}`);
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
                <div className={Styles.document}>
                    <a href={`/${threadId}`} onClick={this.onClickThreadTitle}>
                        {threadTitle}
                    </a>
                </div>
            );
        } else if (loading) {
            content = (
                <div className={Styles.document}>
                    <span>Loading ...</span>
                </div>
            );
        } else if (isLoggedIn) {
            content = (
                <div className={Styles.button}>
                    <button
                        disabled={!isLoggedIn}
                        onClick={this.onClickGetFeedbackButton}>
                        Get feedback!
                    </button>
                </div>
            );
        } else {
            content = <div className={Styles.document}>^^ Login first ^^</div>;
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
                        handleKeyEvent={this.handleKeyEvent}
                        ref="rtb"
                    />
                </div>
                {content}
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
