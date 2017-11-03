import quip from "quip";
import Styles from "./App.less";

export default class App extends React.Component {
    static propTypes = {
        auth: React.PropTypes.instanceOf(quip.apps.Auth).isRequired,
        forceLogin: React.PropTypes.func.isRequired
    };
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            files: null
        };
    }
    componentDidMount() {
        this.fetchPath("/files", {
            query: {
                fields: "*"
            }
        }).then(({files}) => this.setState({ files, loading: false }));
    }
    render() {
        const { loading, files } = this.state;
        if (loading) {
            return <div>Loading...</div>;
        }
        return (
            <div className={Styles.app}>
                <ul className={Styles.fileList}>
                    {files.map(({id, iconLink, name}) => <li key={id}>
                        <img src={iconLink}/>
                        {" "}
                        {name}
                    </li>)}
                </ul>
                <button onClick={this.onLoginClick}>
                    Logout
                </button>
            </div>
        );
    }

    onLoginClick = () => {
        this.props.auth.logout().then(() => this.props.forceLogin());
    }

    fetchPath(path, params = {}, tryRefresh = true) {
        const requestParams = Object.assign(
            {
                url: `https://www.googleapis.com/drive/v3${path}`
            },
            params
        );
        return this.props.auth.request(requestParams).then(response => {
            if (response.status == 401 && tryRefresh) {
                return this.refreshToken().then(response =>
                    this.fetchPath(path, params, false)
                );
            } else if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(this.props.forceLogin());
            }
        });
    }

    refreshToken() {
        return this.props.auth.refreshToken().then(response => {
            if (response && response.ok) {
                return response;
            } else {
                return Promise.reject(response);
            }
        });
    }
}
