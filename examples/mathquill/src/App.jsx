import Styles from "./App.less";
const MathQuill = require("exports-loader?window.MathQuill!imports-loader?window.jQuery=jquery!mathquill/build/mathquill.js");

import "./mathquill.css";

export default class App extends React.Component {
  componentDidMount() {
    const MQ = MathQuill.getInterface(2);
    const field = MQ.MathField(this.el);
  }
  render() {
    return (
      <div>
        <span
          ref={el => (this.el = el)}
          style={{ border: "1px solid #ccc", minWidth: 150 }}
        >
          x=
        </span>
      </div>
    );
  }
}
