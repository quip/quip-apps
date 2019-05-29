// Copyright 2017 Quip
/* @flow */

import quip from "quip";
import React from "react";

import {updateToolbar} from "./menus";

export const DEFAULT_API_VERSION = "46.0";

export function getAuth() {
    return quip.apps.auth("oauth2");
}

export default (
    rootRecord: quip.apps.RootRecord,
    WrappedComponent: React.Component
) => {
    class RecordComponent extends React.Component {
        constructor(props) {
            super();
            this.state = {
                isLoggedIn: getAuth().isLoggedIn(),
                loadingLogin: false,
            };
        }

        componentDidMount() {
            this._recordListener = rootRecord.listen(() => {
                const data = rootRecord.getData();
                this.setState({...data});
            });
        }

        componentWillUnmount() {
            if (this._recordListener) {
                rootRecord.unlisten(this._recordListener);
            }
        }

        login = () => {
            this.setState({loadingLogin: true});
            return getAuth()
                .login({prompt: "login"})
                .then(this.updateIsLoggedIn)
                .catch(this.loginFailed)
                .finally(() => {
                    this.setState({loadingLogin: false});
                    updateToolbar();
                });
        };

        logout = () => {
            this.setState({loadingLogin: true});
            return getAuth()
                .logout()
                .then(this.updateIsLoggedIn)
                .finally(() => {
                    this.setState({loadingLogin: false});
                    updateToolbar();
                });
        };

        updateIsLoggedIn = () => {
            this.setState({
                isLoggedIn: getAuth().isLoggedIn(),
            });
        };

        render() {
            const rootRecordData = rootRecord.getData() || {};
            return (
                <WrappedComponent
                    {...this.state}
                    {...rootRecordData}
                    login={this.login}
                    logout={this.logout}
                />
            );
        }
    }

    return RecordComponent;
};
