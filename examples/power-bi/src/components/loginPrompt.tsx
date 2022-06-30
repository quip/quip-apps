import React from "react";

interface LoginPromptProps {
  onLogin: () => void;
  configured: boolean;
}

const LoginPrompt = ({ onLogin, configured }: LoginPromptProps) => {
  return (
    <div className="login">
      <h3>
        Welcome to Power BI
        <br />
        { configured ? "You must sign in to view this dashboard." : "Sign in to get started." }
      </h3>
      <div className="login-btn">
        <div onClick={() => onLogin()}>
          <img src="assets/login.png" alt="Sign in with Microsoft" />
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
