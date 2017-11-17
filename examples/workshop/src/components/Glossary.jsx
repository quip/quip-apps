import React from "react";
import { connect } from "react-redux";
import classNames from "classnames";

import Styles from "./Glossary.less";

import { addPhrase, loadGlossary, updateGlossary } from "../redux/actions";

class Glossary extends React.Component {
    static propTypes = {
        addPhrase: React.PropTypes.func.isRequired,
        error: React.PropTypes.any,
        glossary: React.PropTypes.object.isRequired,
        glossaryLoading: React.PropTypes.bool.isRequired,
        glossaryUpdatingRemote: React.PropTypes.bool.isRequired,
        loadGlossary: React.PropTypes.func.isRequired,
        updateGlossary: React.PropTypes.func.isRequired,
    };

    componentDidMount() {
        if (!this.props.glossary.length) {
            this.props.loadGlossary();
        }
    }

    addPhrase = e => {
        if (this.newEl.value === "") {
            console.error("come on, add a phrase dude");
            return;
        }
        this.props.addPhrase(this.newEl.value);
        this.newEl.value = "";
    };

    render() {
        const {
            error,
            glossary,
            glossaryLoading,
            glossaryUpdatingRemote,
        } = this.props;
        if (error) {
            return <h1>ERROR! {error}</h1>;
        }
        if (glossaryLoading) {
            return <h1>Loading!</h1>;
        }
        return (
            <div className={Styles.glossaryEditor}>
                <h1>Glossary</h1>
                <div style={{ display: "flex" }}>
                    <dl style={{ flex: 1 }}>
                        {glossary
                            .sort((a, b) => {
                                if (a.phrase < b.phrase) {
                                    return -1;
                                } else if (b.phrase < a.phrase) {
                                    return 1;
                                }
                                return 0;
                            })
                            .map(data => (
                                <Term
                                    key={data.phrase}
                                    phrase={data.phrase}
                                    definition={data.definition}
                                    updateGlossary={this.props.updateGlossary}
                                />
                            ))}
                    </dl>

                    <div style={{ marginLeft: 40, marginTop: 20 }}>
                        <div style={{ marginBottom: 10 }}>
                            <input ref={el => (this.newEl = el)} />
                        </div>
                        <button onClick={this.addPhrase}>Add phrase</button>
                    </div>
                </div>
                <div
                    className={classNames(Styles.updatingRemote, {
                        [Styles.updatingRemoteInAction]: glossaryUpdatingRemote,
                    })}
                >
                    Updating remote...
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        error: state.error,
        glossary: state.glossary,
        glossaryLoading: state.glossaryLoading,
        glossaryUpdatingRemote: state.glossaryUpdatingRemote,
    };
};

export default connect(mapStateToProps, {
    addPhrase,
    loadGlossary,
    updateGlossary,
})(Glossary);

export class Term extends React.Component {
    onChange = e => {
        const { definition, phrase, updateGlossary } = this.props;
        updateGlossary({ phrase, definition: e.currentTarget.value });
    };

    render() {
        const { definition, phrase, updateGlossary } = this.props;
        return (
            <div className={Styles.term}>
                <dt>{phrase}</dt>
                <dd>
                    {updateGlossary ? (
                        <textarea
                            onChange={this.onChange}
                            value={definition}
                            style={{
                                fontSize: "1.5em",
                                fontStyle: "italic",
                                resize: "both",
                            }}
                        />
                    ) : (
                        <p
                            style={{
                                fontSize: "2em",
                                fontStyle: "italic",
                                margin: 0,
                                marginTop: 5,
                            }}
                        >
                            {definition}
                        </p>
                    )}
                </dd>
            </div>
        );
    }
}
