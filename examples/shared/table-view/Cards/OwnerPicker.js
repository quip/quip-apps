import React, { Component } from "react";
import cx from "classnames";
import { PersonRecord } from "../model";
import { X } from "reline";
import styles from "./OwnerPicker.less";
const { ProfilePicture } = quip.apps.ui;

class OwnerPicker extends Component {
    static propTypes = {
        record: React.PropTypes.instanceOf(PersonRecord).isRequired,
        owners: React.PropTypes.arrayOf(
            React.PropTypes.instanceOf(PersonRecord),
        ).isRequired,
        projectName: React.PropTypes.string.isRequired,
        metricType: React.PropTypes.string,
    };
    constructor(props) {
        super(props);
        this.state = {
            members: [],
            inputText: "",
            autoComplete: [],
            focusedIndex: 0,
        };
    }

    componentDidMount() {
        this.setMembers();
        quip.apps.addEventListener(
            quip.apps.EventType.DOCUMENT_MEMBERS_LOADED,
            this.setMembers,
        );
        window.addEventListener("keydown", this.onKeyDown);
        this._input.focus();
    }

    componentWillUnmount() {
        quip.apps.removeEventListener(
            quip.apps.EventType.DOCUMENT_MEMBERS_LOADED,
            this.setMembers,
        );
        window.removeEventListener("keydown", this.onKeyDown);
    }

    setMembers = () => {
        this.setState({ members: quip.apps.getDocumentMembers() });
    };

    onKeyDown = e => {
        if (e.metaKey || e.ctrlKey) return;

        if (e.keyCode === 13) {
            // Enter
            e.preventDefault();
            e.stopPropagation();
            this.addOwner(this.state.autoComplete[this.state.focusedIndex]);
        } else if (e.keyCode === 38) {
            // Up
            e.preventDefault();
            e.stopPropagation();
            this.setState(current => {
                const nextIndex = current.focusedIndex - 1;
                const currentMembers = current.autoComplete.length;
                return {
                    focusedIndex:
                        nextIndex < 0 ? currentMembers - 1 : nextIndex,
                };
            });
        } else if (e.keyCode === 40) {
            // Down
            e.preventDefault();
            e.stopPropagation();
            this.setState(current => {
                const nextIndex = current.focusedIndex + 1;
                const currentMembers = current.autoComplete.length;
                return {
                    focusedIndex: nextIndex >= currentMembers ? 0 : nextIndex,
                };
            });
        }
    };

    onInputChange = e => {
        const inputText = e.target.value;
        if (!inputText) {
            this.setState(({ members }, { owners }) => ({
                inputText,
                focusedIndex: 0,
                autoComplete: [],
            }));
        } else {
            this.setState({ inputText, focusedIndex: 0 });
            var searchCallback = function(response) {
                this.setState(({ owners }) => ({
                    autoComplete: response.filter(user => {
                        return !this.props.owners.find(
                            owner => owner.getId() === user.getId(),
                        );
                    }).slice(0, 10),
                }));
            };
            quip.apps.searchPeople(inputText, searchCallback.bind(this));
        }
    };

    addOwner = user => {
        if (user) {
            this.props.record.addUser(user);
            if (this.props.metricType) {
                quip.apps.recordQuipMetric(this.props.metricType, {
                    action: "add_user",
                    num_users: this.props.record
                        .get("users")
                        .count()
                        .toString(),
                });
            }
            this.setState({ inputText: "", autoComplete: [], focusedIndex: 0 });
            quip.apps.addWhitelistedUser(user.getId());
            quip.apps.sendMessage("Added {0} to " + this.props.projectName, [
                user.getId(),
            ]);
        }
    };

    removeOwner = user => {
        this.props.record.removeUser(user);
        if (this.props.metricType) {
            quip.apps.recordQuipMetric(this.props.metricType, {
                action: "remove_user",
            });
        }
    };

    render() {
        const { owners } = this.props;

        return (
            <div>
                <div className={styles.inputAutoCompleteWrapper}>
                    <div className={styles.inputAutoCompleteInput}>
                        <input
                            ref={c => (this._input = c)}
                            value={this.state.inputText}
                            className={styles.input}
                            onChange={this.onInputChange}
                            type="text"
                            placeholder="Add People..."
                        />
                    </div>
                    <div>
                        {this.state.autoComplete.map((mem, index) => {
                            return (
                                <div
                                    key={mem.getId()}
                                    className={cx(styles.autoCompleteItem, {
                                        [styles.autoCompleteItemFocused]:
                                            this.state.focusedIndex === index,
                                    })}
                                    onClick={() => this.addOwner(mem)}
                                    onMouseEnter={() =>
                                        this.setState({ focusedIndex: index })}
                                >
                                    <ProfilePicture
                                        user={mem}
                                        round
                                        size={35}
                                    />
                                    <div className={styles.userItemName}>
                                        {mem.getName()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {owners.map((owner, i) => (
                    <div key={owner.getId()} className={styles.userItem}>
                        <ProfilePicture user={owner} round size={35} />
                        <div className={styles.userItemName}>
                            {owner.getName()}
                        </div>
                        <div
                            className={styles.deleteUser}
                            onClick={() => this.removeOwner(owner)}
                        >
                            <X strokeWidth={2} size={8} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

export default OwnerPicker;
