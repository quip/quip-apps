import quip from "quip";

export class Root extends React.Component {
    static propTypes = {
        auth: React.PropTypes.instanceOf(quip.apps.Auth).isRequired
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: props.auth.isLoggedIn(),
            error: null
        };
    }
    render() {
        const { auth } = this.props;
        const { isLoggedIn, error } = this.state;
        console.log("state", this.state)
        return (
            <div>
                {isLoggedIn ?
                    <button onClick={this.onLogoutClick}>
                        Logout
                    </button> :
                    <button onClick={this.onLoginClick}>
                        Login
                    </button>}
                {error && <div>We encountered an error. Please try again</div>}
            </div>
        );
    }
    onLoginClick = () => {
        this.props.auth
            .login()
            .then(
                () => {
                    this.setState({
                        isLoggedIn: this.props.auth.isLoggedIn(),
                        token: this.props.auth.getTokenResponse(),
                        error: null
                    });
                },
                error => {
                    this.setState({ error });
                }
            );
    };
    onLogoutClick = () => {
        this.props.auth
            .logout()
            .then(
                () => {
                    this.setState({
                        isLoggedIn: this.props.auth.isLoggedIn(),
                        token: null,
                        error: null
                    });
                },
                error => {
                    this.setState({ error });
                }
            );
    };

    forceLogin = () => {
        this.setState({ isLoggedIn: false });
    };
}

quip.apps.initialize({
    initializationCallback: function(rootNode, params) {
        ReactDOM.render(<Root auth={quip.apps.auth("quip-automation-api")} />, rootNode);
    }
});
