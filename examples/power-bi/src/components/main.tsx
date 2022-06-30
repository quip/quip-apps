import quip from "quip-apps-api";
import React, { useEffect, useState } from "react";
import { menuActions, Menu } from "../menus";
import Client, { Report } from "../model/client";
import { AppData, RootEntity } from "../model/root";
import Dashboard from "./dashboard";
import LoginPrompt from "./loginPrompt";
import TemplatePicker from "./templatePicker";

interface MainProps {
  rootRecord: RootEntity;
  menu: Menu;
  isCreation: boolean;
  creationUrl?: string;
  initOptions?: string;
}

const Main = ({
  menu,
  rootRecord,
  isCreation,
  creationUrl,
  initOptions,
}: MainProps) => {
  const [data, setData] = useState<AppData>({
    reportId: undefined,
    reportLink: undefined,
    reportUrl: undefined,
  });
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new Client();

  const login = async () => {
    setError(null);
    try {
      const result = await client.login();
      setLoggedIn(result);
      menu.updateToolbar(rootRecord, client);
    } catch (err) {
      console.error("Something went wrong while logging in", err);
      setError(err.toString());
    }
  };

  const logout = async () => {
    await client.logout();
    setLoggedIn(false);
    menu.updateToolbar(rootRecord, client);
  };

  const setupMenuActions = () => {
    menuActions.logOut = () => {
      logout();
    };

    menuActions.logIn = async () => {
      login();
    };

    menuActions.open = () => {
      if (data.reportLink) {
        quip.apps.openLink(data.reportLink);
      }
    };

    menuActions.templateMode = () => {
      rootRecord.toggleTemplateMode();
    };
  };

  const refreshData = () => {
    const data = rootRecord.getData();
    setData(data);
  };
  
  useEffect(() => {
    menu.updateToolbar(rootRecord, client);
    setupMenuActions();
  }, [data]);

  const selectReport = (report: Report) => {
    rootRecord.setReport(report.id, report.embedUrl, report.webUrl);
  };

  const selectReportById = async (reportId: string) => {
    try {
      const report = await client.getReportById(reportId);
      selectReport(report);
    } catch (err) {
      setError("Report initialization failed, try again...");
    }
  };

  useEffect(() => {
    // Mount & Update

    refreshData();
    rootRecord.listen(refreshData);
    setLoggedIn(client.loggedIn);

    if ((isCreation && creationUrl) || initOptions) {
      console.log(isCreation, creationUrl, initOptions);
      let reportId;
      const reportUrlRegex = /https\:\/\/app.powerbi.com\/groups\/me\/reports\/([A-z0-9\-]+)/;
      if (isCreation && creationUrl) {
        const match = creationUrl.match(reportUrlRegex);
        console.log(match);
        if (match && match.length >= 1) {
          reportId = match[1];
        }
      }

      if (initOptions) {
        const opts = JSON.parse(initOptions);
        if (opts && opts.reportId) {
          // check if reportId is an ID or a URL
          const match = opts.reportId.match(reportUrlRegex);
          if (match && match.length >= 1) {
            reportId = match[1];
          } else {
            reportId = opts.reportId;
          }
        }
      }

      if (reportId) {
        selectReportById(reportId);
      }
    }

    return () => {
      // Unount
      rootRecord.unlisten(refreshData);
    };
  }, [rootRecord]);

  let errorMessage;
  if (error) {
    errorMessage = (
      <div className="error">
        <div onClick={() => setError(null)}>An error occurred: {error}</div>
      </div>
    );
  }

  return (
    <div className="root">
      {errorMessage}
      {rootRecord.isTemplateMode()
      ? <TemplatePicker record={rootRecord} />
      : loggedIn ? (
        <Dashboard
          report={data}
          onError={(err: any) => setError(err.toString())}
          onSelect={selectReport}
        />
      ) : (
        <LoginPrompt configured={!!data.reportId} onLogin={login} />
      )}
    </div>
  );
};

export default Main;
