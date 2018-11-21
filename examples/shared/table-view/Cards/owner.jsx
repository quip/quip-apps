import React, {PureComponent} from "react";
import Plus from "../lib/components/icons/Plus";
import OwnerTooltip from "./OwnerTooltip";
import OwnerPicker from "./owner-picker.jsx";
import {PersonRecord, TextRecord, COMMENT_TRIGGER_MAKEUP} from "../model";
import Modal from "../lib/components/Modal";
import styles from "./Owner.less";
const {ProfilePicture} = quip.apps.ui;

const PROFILE_SIZE = 30;
const PROFILE_OVERLAP = 12;

class Owner extends PureComponent {
    static propTypes = {
        availableWidth: React.PropTypes.number.isRequired,
        rowHeight: React.PropTypes.number.isRequired,
        record: React.PropTypes.instanceOf(PersonRecord),
        projectRecord: React.PropTypes.instanceOf(TextRecord),
        metricType: React.PropTypes.string,
        showComments: React.PropTypes.bool.isRequired,
    };
    constructor(props) {
        super(props);
        this.owners_ = props.record.getUsers();
        this.state = {
            members: [],
            plusNumberWidth: 0,
            showPicker: false,
            toolTipData: null,
            hasComments: props.record.getCommentCount() > 0,
        };
    }

    componentDidMount() {
        this.setMembers();
        quip.apps.addEventListener(
            quip.apps.EventType.DOCUMENT_MEMBERS_LOADED,
            this.setMembers);
        quip.apps.addEventListener(
            quip.apps.EventType.WHITELISTED_USERS_LOADED,
            this.whitelistedUsersLoaded);
        this.props.record.listenToComments(this.updateHasComments);
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(
            quip.apps.EventType.DOCUMENT_MEMBERS_LOADED,
            this.setMembers);
        quip.apps.removeEventListener(
            quip.apps.EventType.WHITELISTED_USERS_LOADED,
            this.whitelistedUsersLoaded);
        this.props.record.unlisten(this.update_);
        this.props.record.get("users").unlisten(this.update_);
        this.props.record.unlistenToComments(this.updateHasComments);
    }

    componentWillMount() {
        this.props.record.listen(this.update_);
        this.props.record.get("users").listen(this.update_);
    }

    updateHasComments = () => {
        if (!quip.apps.isMobile()) {
            const hasComments = this.props.record.getCommentCount() > 0;
            if (hasComments != this.state.hasComments) {
                this.setState({hasComments: hasComments});
            }
        }
    };

    update_ = () => {
        const owners = this.props.record.getUsers();
        if (owners.length != this.owners_.length) {
            this.owners_ = owners;
            this.forceUpdate();
        }

        for (let i = 0; i < owners.length; i++) {
            if (owners[i] !== this.owners_[i]) {
                this.owners_ = owners;
                this.forceUpdate();
                return;
            }
        }
    };

    whitelistedUsersLoaded = () => {
        this.update_();
    };

    setMembers = () => {
        this.setState({members: quip.apps.getDocumentMembers()});
        this.update_();
    };

    showPicker = () =>
        !quip.apps.isMobile() && this.setState({showPicker: true});
    hidePicker = () => this.setState({showPicker: false});
    showToolTip = user => {
        this.setState({toolTipData: user});
    };
    hideToolTip = () => {
        this.setState({toolTipData: null});
    };

    render() {
        const {
            record,
            rowHeight,
            projectRecord,
            availableWidth,
            showComments,
        } = this.props;
        const {
            showPicker,
            members,
            toolTipData,
            plusNumberWidth,
            hasComments,
        } = this.state;
        const showCommentsIcon = showComments || hasComments;
        const paddingLeft = showCommentsIcon ? COMMENT_TRIGGER_MAKEUP : 0;
        const paddingRight = 0;
        const owners = this.owners_;
        const pickerModalStyle = {
            content: {
                width: 230,
            },
        };
        const tooltipModalStyle = {
            overlay: {
                pointerEvents: "none",
            },
            content: {
                pointerEvents: "auto",
            },
        };

        // Determines the max number of people we can display.
        const commentWidth = paddingLeft - paddingRight;
        const limit =
            Math.floor(
                (availableWidth -
                    paddingLeft -
                    paddingRight -
                    PROFILE_SIZE -
                    plusNumberWidth -
                    commentWidth) /
                    (PROFILE_SIZE - PROFILE_OVERLAP)) + 1;

        let pickerModal;
        if (showPicker) {
            pickerModal = <Modal
                style={pickerModalStyle}
                onRequestClose={this.hidePicker}
                topOffset={rowHeight / 2 + 20}
                onBlur={this.hidePicker}
                wrapperRef={this.wrapper}>
                <OwnerPicker
                    record={record}
                    owners={owners}
                    members={members}
                    projectRecord={projectRecord}
                    metricType={this.props.metricType}/>
            </Modal>;
        }

        let tooltipModal;
        if (!showPicker && toolTipData) {
            tooltipModal = <Modal
                style={tooltipModalStyle}
                onRequestClose={this.hidePicker}
                topOffset={rowHeight / 2 + 10}
                wrapperRef={this.wrapper}>
                <OwnerTooltip
                    onMouseEnter={() => this.showToolTip(toolTipData)}
                    onMouseLeave={this.hideToolTip}
                    user={toolTipData}/>
            </Modal>;
        }

        return <div
            ref={el => (this.wrapper = el)}
            className={styles.wrapper}
            style={{
                width: availableWidth,
                paddingLeft: paddingLeft,
                paddingRight: paddingRight,
            }}>
            {!owners.every(owner => owner == null) &&
                owners.map(
                    (owner, i) =>
                        owner != null &&
                        i < limit && <div
                            onMouseEnter={() => this.showToolTip(owner)}
                            onMouseLeave={this.hideToolTip}
                            key={owner.getId()}
                            className={styles.profilePicWrapper}
                            onClick={this.showPicker}
                            style={{marginLeft: i !== 0 && -PROFILE_OVERLAP}}>
                            <ProfilePicture
                                user={owner}
                                round
                                size={PROFILE_SIZE}/>
                        </div>)}
            {owners.length > limit && <div
                ref={el => {
                    if (el) {
                        const width = el.getBoundingClientRect().width;
                        if (width !== plusNumberWidth) {
                            this.setState({plusNumberWidth: width});
                        }
                    }
                }}
                onClick={this.showPicker}
                className={styles.plusNumberWrapper}>
                <p>+{owners.length - limit}</p>
            </div>}
            {!quip.apps.isMobile() &&
                !owners.length && <div
                    onClick={this.showPicker}
                    className={styles.emptyOwners}>
                    <Plus size={18}/>
                </div>}
            {pickerModal}
            {tooltipModal}
        </div>;
    }
}

export default Owner;
