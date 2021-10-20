import quip from "quip-apps-api";
import React from "react";
import {RootEntity} from "../model/root";

interface LoginProps {
    isConfigured: boolean;
    rootRecord: RootEntity;
}

const Login = ({isConfigured, rootRecord}: LoginProps) => {
    const handleLogin = () => {
        rootRecord.login();
    };

    return (
        <div className="container config">
            {isConfigured ? (
                <p className="margin-m">
                    You must be logged in to view this dashboard.
                </p>
            ) : null}
            <img
                src="assets/logo.png"
                alt="Tableau Logo"
                className="logo margin-m"
            />
            <quip.apps.ui.Button
                text="Connect to Tableau"
                className="margin-m"
                onClick={handleLogin}
            />
        </div>
    );
};

export default Login;
