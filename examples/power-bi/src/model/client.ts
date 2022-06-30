import quip from "quip-apps-api";
import { OAUTH_NAME } from "../const";

const BASE_URL = "https://api.powerbi.com";

export interface Report {
  id: string;
  name: string;
  embedUrl: string;
  webUrl: string;
}

interface ReportsResponse {
  value: Report[];
}

class Client {
  private auth: quip.apps.OAuth2 = quip.apps.auth(
    OAUTH_NAME
  ) as quip.apps.OAuth2;

  get loggedIn() {
    return this.auth.isLoggedIn();
  }

  get token() {
    return this.auth.getTokenResponseParam("access_token");
  }

  get data() {
    return this.auth.getTokenResponse();
  }

  async login() {
    return await this.auth.login({
      access_type: "offline",
    });
  }

  async logout() {
    return await this.auth.logout();
  }

  private request = async <T>(url: string, retry = false): Promise<T> => {
    if (!this.auth.isLoggedIn()) {
      throw new Error("Not logged in");
    }

    const response = await this.auth.request<T>({
      url: `${BASE_URL}${url}`,
      method: "GET",
    });

    if (!response.ok) {
      if ((response.status === 401 || response.status === 403) && !retry) {
        await this.auth.refreshToken();
        return await this.request<T>(url, true);
      } else {
        throw new Error(response.statusText);
      }
    }

    return response.json();
  };

  async getReports() {
    const { value } = await this.request<ReportsResponse>(
      "/v1.0/myorg/reports"
    );
    return value;
  }

  async getReportById(id: string) {
    return await this.request<Report>(`/v1.0/myorg/reports/${id}`);
  }
}

export default Client;
