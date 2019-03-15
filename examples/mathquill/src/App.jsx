import quip from "quip";
import Styles from "./App.less";
//const MathQuill = require("exports-loader?window.MathQuill!imports-loader?window.jQuery=jquery!mathquill/build/mathquill.js");
import MathQuill from 'react-mathquill'

import "./mathquill.css";

export default class App extends React.Component {
  constructor(props) {
    super();
    this.state = {
      latex: props.latex || "",
    };
  }
  render() {
    const {latex} = this.state;
    return (
      <div>
        <MathQuill latex={latex} onChange={latex => {
          console.debug("onChange latex", latex)
          quip.apps.getRootRecord().set("latex", latex);
        }}/>
        <div>
          Quip App ID: {quip.apps.getQuipAppId()}<br/>
          Latex: {latex}
        </div>
      </div>
    );
  }
}
