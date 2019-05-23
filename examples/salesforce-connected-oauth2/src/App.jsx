import Styles from "./App.less";

export const DEFAULT_API_VERSION = "46.0";

export function getAuth() {
    return quip.apps.auth("oauth2");
}

export default class App extends React.Component {
    constructor(props) {
        super();
        this.state = {
            isLoggedIn: getAuth().isLoggedIn(),
            loadingLogin: false,
        };
    }

    login = () => {
        console.debug("login");
        this.setState({loadingLogin: true});
        return getAuth()
            .login({prompt: "login"})
            .then(this.updateIsLoggedIn)
            .finally(() => {
                this.setState({loadingLogin: false});
            });
    };

    logout = () => {
        this.setState({loadingLogin: true});
        return getAuth()
            .logout()
            .then(this.updateIsLoggedIn)
            .finally(() => {
                this.setState({loadingLogin: false});
            });
    };

    updateIsLoggedIn = () => {
        this.setState({
            isLoggedIn: getAuth().isLoggedIn(),
        });
    };

    render() {
        const {isLoggedIn} = this.state;
        const fn = !isLoggedIn ? this.login : this.logout;
        const text = !isLoggedIn ? "Log in" : "Log out";
        return (
            <div>
                <div>
                    <button onClick={fn}>{text}</button>
                </div>
                {isLoggedIn && <ApiTest />}
            </div>
        );
    }
}

class ApiTest extends React.Component {
    constructor(props) {
        super();
        this.state = {
            endpoint: "/services/data/",
            responseJson: null,
        };
    }

    onSubmit = e => {
        const {endpoint} = this.state;
        const tokenResponse = getAuth().getTokenResponse();
        const url = `${tokenResponse.instance_url}${endpoint}`;
        this.setState({responseJson: `Loading ${url}`, responseEndpoint: null});
        getAuth()
            // Proxies the fetch through Quip's server to avoid CORS issues
            // and pass the bearer token automatically in the heads.
            .request({url})
            .then(response => {
                console.debug("Response from API", response);
                if (!response.ok) {
                    console.error("REQUEST ERROR", response);
                    return;
                }
                const responseJson = JSON.stringify(response.json(), null, 2);
                console.debug({responseJson});
                this.setState({responseJson, responseEndpoint: url});
            });
    };

    render() {
        const {endpoint, responseEndpoint, responseJson} = this.state;
        return (
            <div style={{marginTop: 20}}>
                <h2>API Test</h2>
                <div style={{alignItems: "center", display: "flex"}}>
                    <div>
                        <label style={{alignItems: "center", display: "flex"}}>
                            <div style={{marginRight: 10}}>Endpoint</div>
                            <input
                                value={endpoint}
                                style={{width: 250}}
                                onChange={e =>
                                    this.setState({endpoint: e.target.value})}
                            />
                        </label>
                    </div>
                    <div style={{marginLeft: 20}}>
                        <button onClick={this.onSubmit}>Submit</button>
                    </div>
                </div>
                <hr style={{margin: "20px 0"}} />
                <h2>
                    Response{" "}
                    {responseEndpoint && <span>from {responseEndpoint}</span>}
                </h2>
                <div>
                    <textarea
                        readOnly
                        value={responseJson}
                        style={{minWidth: 800, minHeight: 400}}
                    />
                </div>
            </div>
        );
    }
}
