import React, {Component} from "react";
import Plus from "../lib/components/icons/Plus";
import OwnerTooltip from "./OwnerTooltip";
import OwnerPicker from "./OwnerPicker";
import {PersonRecord} from "../model";
import Modal from "../lib/components/Modal";
import styles from "./Owner.less";
const {ProfilePicture} = quip.apps.ui;

const PROFILE_SIZE = 30;
const PROFILE_OVERLAP = 12;

class Owner extends Component {
    static propTypes = {
        availableWidth: React.PropTypes.number.isRequired,
        paddingLeft: React.PropTypes.number.isRequired,
        paddingRight: React.PropTypes.number.isRequired,
        rowHeight: React.PropTypes.number.isRequired,
        rootHeight: React.PropTypes.number.isRequired,
        record: React.PropTypes.instanceOf(PersonRecord),
        projectName: React.PropTypes.string.isRequired,
        metricType: React.PropTypes.string,
    };
    constructor(props) {
        super(props);
        this.state = {
            members: [],
            plusNumberWidth: 0,
            showPicker: false,
            toolTipData: null,
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
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(
            quip.apps.EventType.DOCUMENT_MEMBERS_LOADED,
            this.setMembers);
        quip.apps.removeEventListener(
            quip.apps.EventType.WHITELISTED_USERS_LOADED,
            this.whitelistedUsersLoaded);
    }

    whitelistedUsersLoaded = () => {
        this.forceUpdate();
    };

    setMembers = () => {
        this.setState({members: quip.apps.getDocumentMembers()});
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
            rootHeight,
            projectName,
            availableWidth,
            paddingLeft,
            paddingRight,
        } = this.props;
        const {showPicker, members, toolTipData, plusNumberWidth} = this.state;
        const owners = record.getUsers();
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
            <Modal
                style={pickerModalStyle}
                onRequestClose={this.hidePicker}
                rootHeight={rootHeight}
                topOffset={rowHeight / 2 + 20}
                isOpen={showPicker}
                onBlur={this.hidePicker}
                wrapperRef={this.wrapper}>
                <OwnerPicker
                    record={record}
                    owners={owners}
                    members={members}
                    projectName={projectName}
                    metricType={this.props.metricType}/>
            </Modal>
            <Modal
                style={tooltipModalStyle}
                onRequestClose={this.hidePicker}
                rootHeight={rootHeight}
                topOffset={rowHeight / 2 + 10}
                isOpen={toolTipData && !showPicker}
                wrapperRef={this.wrapper}>
                <OwnerTooltip
                    onMouseEnter={() => this.showToolTip(toolTipData)}
                    onMouseLeave={this.hideToolTip}
                    user={toolTipData}/>
            </Modal>
        </div>;
    }
}

export default Owner;
