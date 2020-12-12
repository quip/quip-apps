import quip from "quip";
import App from "./App.jsx";

export class Root extends React.Component {
    static propTypes = {
        auth: React.PropTypes.instanceOf(quip.apps.Auth).isRequired,
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: props.auth.isLoggedIn(),
            error: null,
        };
    }
    render() {
        const { auth } = this.props;
        const { isLoggedIn, error } = this.state;
        return <div>
            {isLoggedIn && <App auth={auth} forceLogin={this.forceLogin}/>}
            {!isLoggedIn && <button onClick={this.onLoginClick}>Login</button>}
            {error && <div>We encountered an error. Please try again</div>}
        </div>;
    }
    onLoginClick = () => {
        this.props.auth
            .login({
                access_type: "offline",
                prompt: "consent",
            })
            .then(
                () => {
                    this.setState({
                        isLoggedIn: this.props.auth.isLoggedIn(),
                        error: null,
                    });
                },
                (error) => {
                    this.setState({ error });
                },
            );
    };
    forceLogin = () => {
        this.setState({ isLoggedIn: false });
    };
}

quip.apps.initialize({
    initializationCallback: function (rootNode, params) {
        ReactDOM.render(<Root auth={quip.apps.auth("gdrive")}/>, rootNode);
    },
});
