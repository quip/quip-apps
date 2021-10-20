import quip from "quip-apps-api";
import React from "react";

const Login = () => {
    return (
        <div className="container config">
            <img src="assets/logo.png" alt="Tableau Logo" />
            <quip.apps.ui.Button text="Connect to Tableau" />
        </div>
    );
};

export default Login;
