import Styles from "./App.less";

const wsUri = "wss://echo.websocket.org/";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = { messages: ["constructor called"] };
  }
  componentWillMount() {
    this.testWebSocket();
  }

  testWebSocket() {
    this.websocket = new WebSocket(wsUri);
    this.websocket.onopen = this.onOpen;
    this.websocket.onclose = this.onClose;
    this.websocket.onmessage = this.onMessage;
    this.websocket.onerror = this.onError;
  }

  onOpen = evt => {
    this.setState({ messages: [...this.state.messages, "CONNECTED"] });
    this.doSend("WebSocket rocks");
  };

  onClose = evt => {
    this.setState({ messages: [...this.state.messages, "DISCONNECTED"] });
  };

  onMessage = evt => {
    console.debug("onMessage", evt.data);
    this.setState({ messages: [...this.state.messages, evt.data] });
    this.websocket.close();
  };

  onError = evt => {
    console.debug("onError", evt.data);
    this.setState({
      messages: [...this.state.messages, "ERROR : " + evt.data]
    });
  };

  doSend(message) {
    this.setState({ messages: [...this.state.messages, "SENT: " + message] });
    this.websocket.send(message);
  }

  render() {
    const { messages } = this.state;
    return (
      <div>
        <h1>WEBSOCKET TEST MESSAGES</h1>
        {messages.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>
    );
  }
}
