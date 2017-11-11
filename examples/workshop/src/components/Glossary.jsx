import React from "react";
import { connect } from "react-redux";
import classNames from "classnames";

import Styles from "./Glossary.less";

import { addPhrase, loadGlossary, updateGlossary } from "../redux/actions";

class Glossary extends React.Component {
    static propTypes = {
        addPhrase: React.PropTypes.func.isRequired,
        error: React.PropTypes.any,
        loadGlossary: React.PropTypes.func.isRequired,
        glossary: React.PropTypes.object.isRequired,
        glossaryLoading: React.PropTypes.bool.isRequired,
        glossaryUpdatingRemote: React.PropTypes.bool.isRequired,
        updateGlossary: React.PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.loadGlossary();
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
            <div>
                <h1>Glossary</h1>
                {error && <h2>ERROR! {error}</h2>}
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
                                    data={data}
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

class Term extends React.Component {
    onChange = e => {
        const { data, updateGlossary } = this.props;
        const { definition, phrase } = data;
        updateGlossary({ phrase, definition: e.currentTarget.value });
    };

    render() {
        const { data } = this.props;
        const { definition, phrase } = data;
        return (
            <div>
                <dt>{phrase}</dt>
                <dd>
                    <textarea
                        onChange={this.onChange}
                        value={definition}
                        style={{ resize: "both" }}
                    />
                </dd>
            </div>
        );
    }
}
