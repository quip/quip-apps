import { models } from "powerbi-client";
import { PowerBIEmbed } from "powerbi-client-react";
import quip from "quip-apps-api";
import React, { useCallback, useEffect, useState } from "react";
import Client, { Report } from "../model/client";
import { AppData } from "../model/root";

interface DashboardProps {
  report: AppData;
  onError: (err: any) => void;
  onSelect: (report: Report) => void;
}

const Dashboard = ({ report, onError, onSelect }: DashboardProps) => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [token, setToken] = useState<string>();

  const [iframe, setIframe] = useState<Node>();
  const handleRef = useCallback((node: Node) => {
    quip.apps.clearEmbeddedIframe();
    setIframe(node);
    quip.apps.registerEmbeddedIframe(node);
  }, []);

  const client = new Client();

  const checkToken = async (reportId: string) => {
    try {
      await client.getReportById(reportId);
      setToken(client.token);
    } catch (err) {
      console.error(err);
      client.logout();
      onError("Token is invalid, log out and log back in.");
    }
  };

  useEffect(() => {
    if (report.reportId) {
      checkToken(report.reportId);
    }
  }, [report]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const fetchedReports = await client.getReports();
      setReports(fetchedReports);
    } catch (err) {
      console.error("Something went wrong while loading reports", err);
      onError(err);
    }
    setLoading(false);
  };

  const selectReport = (id: string) => {
    const report = reports.find((r) => r.id === id);
    if (report) {
      onSelect(report);
    }
  };

  useEffect(() => {
    if (!report.reportId) {
      loadReports();
    }
  }, [report.reportId]);

  let content;
  if (loading) {
    content = (
      <div className="spinner">
        <quip.apps.ui.Spinner size={40} />
      </div>
    );
  } else if (report.reportId && report.reportUrl) {
    const config = {
      type: "report", // Supported types: report, dashboard, tile, visual and qna
      id: report.reportId,
      embedUrl: report.reportUrl,
      accessToken: token,
      tokenType: models.TokenType.Aad,
      settings: {
        panes: {
          filters: {
            expanded: false,
            visible: false,
          },
          background: models.BackgroundType.Transparent,
        },
      },
    };

    content = (
      <div>
        {token ? (
          <PowerBIEmbed
            embedConfig={config}
            cssClassName="dash-element"
            getEmbeddedComponent={(e) => handleRef(e.iframe)}
          />
        ) : (
          <div className="spinner">
            <quip.apps.ui.Spinner size={40} />
          </div>
        )}
      </div>
    );
  } else {
    content = (
      <div className="dash-selector">
        <div className="title">Select a report...</div>
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => selectReport(report.id)}
            className="dash-row"
          >
            {report.name}
          </div>
        ))}
        {reports.length === 0 ? <div className="dash-row no-click">
          No reports found!
        </div> : undefined}
      </div>
    );
  }

  return <div className="dashboard">{content}</div>;
};

export default Dashboard;
